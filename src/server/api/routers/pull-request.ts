import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { formatPR, formatPRFiles } from "@/lib/utils";
import {
  enrichPullRequestsWithStats,
  fetchPullRequestFiles,
  fetchPullRequests,
  fetchSinglePullRequest,
  getGitHubAccessToken,
} from "@/server/services/github";
import { createTRPCRouter, protectedProcedure } from "../trpc";

type Context = {
  db: typeof import("@/server/db").db;
  user: { id: string };
};

// Helper for repetitive checking and fetching
async function getRepoContext(ctx: Context, repositoryId: string) {
  const repository = await ctx.db.repository.findUnique({
    where: { id: repositoryId, userId: ctx.user.id },
  });

  if (!repository) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Repository not found" });
  }

  const accessToken = await getGitHubAccessToken(ctx.user.id);
  if (!accessToken) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "GitHub account not connected" });
  }

  const [owner, repo] = repository.fullName.split("/");
  if (!owner || !repo) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid repository name" });
  }

  return { repository, accessToken, owner, repo };
}

export const pullRequestRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        repositoryId: z.string(),
        state: z.enum(["open", "closed", "all"]).default("open"),
        page: z.number().optional(),
        perPage: z.number().optional(),
        countsOnly: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { repository, accessToken, owner, repo } = await getRepoContext(
        ctx,
        input.repositoryId,
      );

      const prs = await fetchPullRequests(
        owner,
        repo,
        accessToken,
        input.state,
        input.page,
        input.perPage,
      );

      // NOTE: This doubles the fetch count for each PR to get additions/deletions stats.
      // With N PRs, this results in 1 + N API calls.
      const enrichedPrs = input.countsOnly
        ? prs
        : await enrichPullRequestsWithStats(owner, repo, accessToken, prs);

      const existingReviews = await ctx.db.review.findMany({
        where: {
          repositoryId: repository.id,
          prNumber: { in: prs.map((pr) => pr.number) },
        },
        select: {
          prNumber: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const reviewMap = new Map();
      for (const r of existingReviews) {
        if (!reviewMap.has(r.prNumber)) {
          reviewMap.set(r.prNumber, r);
        }
      }

      return enrichedPrs.map((pr) => formatPR(pr, reviewMap.get(pr.number)));
    }),

  get: protectedProcedure
    .input(
      z.object({
        repositoryId: z.string(),
        prNumber: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { repository, accessToken, owner, repo } = await getRepoContext(
        ctx,
        input.repositoryId,
      );

      const pr = await fetchSinglePullRequest(owner, repo, accessToken, input.prNumber);
      const existingReview = await ctx.db.review.findFirst({
        where: {
          repositoryId: repository.id,
          prNumber: pr.number,
        },
        orderBy: { createdAt: "desc" },
      });

      return formatPR(pr, existingReview);
    }),

  files: protectedProcedure
    .input(
      z.object({
        repositoryId: z.string(),
        prNumber: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { accessToken, owner, repo } = await getRepoContext(ctx, input.repositoryId);

      const files = await fetchPullRequestFiles(accessToken, owner, repo, input.prNumber);
      return formatPRFiles(files);
    }),
});
