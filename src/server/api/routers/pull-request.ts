import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { GitHubPullRequest } from "@/lib/types";
import {
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

// Helper to format PR uniformly
function formatPR(
  pr: GitHubPullRequest,
  review: { status: string; createdAt: Date } | null | undefined = null,
) {
  return {
    id: pr.id,
    number: pr.number,
    title: pr.title,
    state: pr.state,
    draft: pr.draft,
    htmlUrl: pr.html_url,
    author: {
      login: pr.user.login,
      avatarUrl: pr.user.avatar_url,
    },
    headRef: pr.head.ref,
    baseRef: pr.base.ref,
    additions: pr.additions,
    deletions: pr.deletions,
    changedFiles: pr.changed_files,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    mergedAt: pr.merged_at,
    review,
  };
}

export const pullRequestRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        repositoryId: z.string(),
        state: z.enum(["open", "closed", "all"]).default("open"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { repository, accessToken, owner, repo } = await getRepoContext(
        ctx,
        input.repositoryId,
      );

      const prs = await fetchPullRequests(owner, repo, accessToken, input.state);
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

      const reviewMap = new Map(existingReviews.map((r: any) => [r.prNumber, r]));

      return prs.map((pr) => formatPR(pr, reviewMap.get(pr.number)));
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
});
