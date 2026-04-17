import type { GitHubRepo } from "@/lib/types";
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

export async function fetchGitHubRepos(accessToken: string): Promise<Array<GitHubRepo>> {
  const repos: Array<GitHubRepo> = [];
  let hasMore = true;
  let page = 1;
  const perPage = 100;
  const MAX_PAGES = 100; // Safety limit: max 10,000 repos

  while (hasMore && page <= MAX_PAGES) {
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub repos: ${response.status}`);
    }

    const data = (await response.json()) as Array<GitHubRepo>;
    repos.push(...data);

    // Check GitHub's 'Link' header to see if a next page exists
    const linkHeader = response.headers.get("link");
    hasMore = !!linkHeader && linkHeader.includes('rel="next"');

    if (hasMore) {
      page++;
    }
  }

  return repos;
}
