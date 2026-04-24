import type { GitHubApiRepo, GitHubPullRequest, GitHubPullRequestFile } from "@/lib/types";
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

/**
 * Shared helper for GitHub API fetching with consistent error handling and timeouts
 */
async function githubFetch<T>(
  url: string,
  accessToken: string,
  options: { signal?: AbortSignal } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s default timeout

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      signal: options.signal ?? controller.signal,
    });

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

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("GitHubTimeout");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchGitHubRepos(accessToken: string): Promise<Array<GitHubApiRepo>> {
  const repos: Array<GitHubApiRepo> = [];
  let hasMore = true;
  let page = 1;
  const perPage = 100;
  const MAX_PAGES = 100; // Safety limit: max 10,000 repos

  while (hasMore && page <= MAX_PAGES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

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
        if (response.status === 401) throw new Error("GitHubUnauthorized");
        if (response.status === 403 && response.headers.get("X-RateLimit-Remaining") === "0")
          throw new Error("GitHubRateLimited");
        if (response.status >= 500) throw new Error("ServiceUnavailable");
        throw new Error(`GitHubApiError: ${response.status} - ${body}`);
      }

      const data = (await response.json()) as Array<GitHubApiRepo>;
      repos.push(...data);

      const linkHeader = response.headers.get("link");
      hasMore = !!linkHeader && linkHeader.includes('rel="next"');

      if (hasMore) {
        if (page === MAX_PAGES) break;
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
  owner: string,
  repo: string,
  accessToken: string,
  state: "open" | "closed" | "all" = "open",
  page?: number,
  per_page?: number,
): Promise<Array<GitHubPullRequest>> {
  const prs: Array<GitHubPullRequest> = [];
  let currentPage = page ?? 1;
  let hasMore = true;

  while (hasMore) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=${per_page ?? 100}&page=${currentPage}&sort=updated&direction=desc`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "No body");
        if (response.status === 401) throw new Error("GitHubUnauthorized");
        if (response.status === 403 && response.headers.get("X-RateLimit-Remaining") === "0")
          throw new Error("GitHubRateLimited");
        if (response.status >= 500) throw new Error("ServiceUnavailable");
        throw new Error(`GitHubApiError: ${response.status} - ${body}`);
      }

      const data = (await response.json()) as Array<GitHubPullRequest>;
      prs.push(...data);

      const linkHeader = response.headers.get("link");

      if (page !== undefined) {
        hasMore = false;
      } else {
        hasMore = !!linkHeader && linkHeader.includes('rel="next"');
        currentPage++;
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

  return prs;
}

export async function fetchSinglePullRequest(
  owner: string,
  repo: string,
  accessToken: string,
  prNumber: number,
): Promise<GitHubPullRequest> {
  return githubFetch<GitHubPullRequest>(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
    accessToken,
  );
}

export async function enrichPullRequestsWithStats(
  owner: string,
  repo: string,
  accessToken: string,
  prs: Array<GitHubPullRequest>,
  concurrency = 5, // stay well under GitHub's rate limit
): Promise<Array<GitHubPullRequest>> {
  const results: Array<GitHubPullRequest> = [];

  for (let i = 0; i < prs.length; i += concurrency) {
    const batch = prs.slice(i, i + concurrency);
    const enriched = await Promise.all(
      batch.map((pr) =>
        fetchSinglePullRequest(owner, repo, accessToken, pr.number).catch((err) => {
          // Only fall back to original PR if it already has the core stats we need
          if (
            pr.additions !== undefined &&
            pr.deletions !== undefined &&
            pr.changed_files !== undefined
          ) {
            return pr;
          }
          throw err;
        }),
      ),
    );
    results.push(...enriched);
  }

  return results;
}

export async function fetchPullRequestFiles(
  accessToken: string,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<Array<GitHubPullRequestFile>> {
  const files: Array<GitHubPullRequestFile> = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  const MAX_PAGES = 100;

  while (hasMore && page <= MAX_PAGES) {
    const data = await githubFetch<Array<GitHubPullRequestFile>>(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=${perPage}&page=${page}`,
      accessToken,
    );

    files.push(...data);
    hasMore = data.length === perPage && page < MAX_PAGES;
    page++;
  }

  return files;
}
