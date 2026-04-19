import type { GitHubApiRepo, GitHubPullRequest } from "@/lib/types";
import { db } from "@/server/db";

export async function getGitHubAccessToken(userId: string): Promise<string | null> {
  const account = await db.account.findFirst({
    where: {
      userId,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  return account?.accessToken ?? null;
}

export async function fetchGitHubRepos(accessToken: string): Promise<Array<GitHubApiRepo>> {
  const repos: Array<GitHubApiRepo> = [];
  let hasMore = true;
  let page = 1;
  const perPage = 100;
  const MAX_PAGES = 100; // Safety limit: max 10,000 repos

  while (hasMore && page <= MAX_PAGES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(
        `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const body = await response.text().catch(() => "No body");
        if (response.status === 401) {
          throw new Error("GitHubUnauthorized");
        }
        if (response.status === 403 && response.headers.get("X-RateLimit-Remaining") === "0") {
          throw new Error("GitHubRateLimited");
        }
        if (response.status >= 500) {
          throw new Error("ServiceUnavailable");
        }
        throw new Error(`GitHubApiError: ${response.status} - ${body}`);
      }

      const data = (await response.json()) as Array<GitHubApiRepo>;
      repos.push(...data);

      const linkHeader = response.headers.get("link");
      hasMore = !!linkHeader && linkHeader.includes('rel="next"');

      if (hasMore) {
        if (page === MAX_PAGES) {
          break;
        }
        page++;
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("GitHubTimeout");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  return repos;
}

export async function fetchPullRequests(
  accessToken: string,
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
): Promise<Array<GitHubPullRequest>> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=30&sort=updated&direction=desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Github API error: ${response.status}`);
  }

  return (await response.json()) as Array<GitHubPullRequest>;
}

export async function fetchSinglePullRequest(
  accessToken: string,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<GitHubPullRequest> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Github API error: ${response.status}`);
  }

  return (await response.json()) as GitHubPullRequest;
}
