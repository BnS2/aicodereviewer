import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { fetchGitHubRepos, getGitHubAccessToken } from "@/server/services/github";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const repositoryRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const repositories = await ctx.db.repository.findMany({
      where: {
        userId: ctx.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return repositories;
  }),

  fetchFromGitHub: protectedProcedure.mutation(async ({ ctx }) => {
    const accessToken = await getGitHubAccessToken(ctx.user.id);

    if (!accessToken) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "User has not authorized GitHub access",
      });
    }

    const repos = await fetchGitHubRepos(accessToken);
    return repos.map((repo) => ({
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      htmlUrl: repo.html_url,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
    }));
  }),

  connect: protectedProcedure
    .input(
      z.object({
        repos: z
          .array(
            z.object({
              githubId: z.number(),
              name: z.string(),
              fullName: z.string(),
              private: z.boolean(),
              htmlUrl: z.string(),
              description: z.string().nullable(),
              language: z.string().nullable(),
              stars: z.number(),
            }),
          )
          .max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await Promise.all(
        input.repos.map((repo) =>
          ctx.db.repository.upsert({
            where: {
              userId_githubId: {
                userId: ctx.user.id,
                githubId: repo.githubId,
              },
            },
            create: {
              userId: ctx.user.id,
              githubId: repo.githubId,
              name: repo.name,
              fullName: repo.fullName,
              private: repo.private,
              htmlUrl: repo.htmlUrl,
              description: repo.description,
              language: repo.language,
              stars: repo.stars,
            },
            update: {
              name: repo.name,
              fullName: repo.fullName,
              private: repo.private,
              htmlUrl: repo.htmlUrl,
              description: repo.description,
              language: repo.language,
              stars: repo.stars,
            },
          }),
        ),
      );

      return { connected: result.length };
    }),

  disconnect: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.repository.delete({
          where: {
            id: input.id,
            userId: ctx.user.id,
          },
        });
      } catch (error: unknown) {
        // P2025 is Prisma's error code for "Record to delete does not exist."
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Repository not found or does not belong to you",
          });
        }
        throw error;
      }

      return { success: true };
    }),
});
