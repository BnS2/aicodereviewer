export interface UserProps {
  id: string;
  name: string;
  email: string;
  image?: string | null | undefined;
}

export interface HeaderProps {
  user: UserProps;
}

/**
 * Raw repository data directly from the GitHub API (snake_case)
 */
export interface GitHubApiRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

/**
 * Cleaned up repository data used in our application (camelCase)
 */
export interface GitHubRepo {
  githubId: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
  updatedAt: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  draft: boolean;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
  additions?: number;
  deletions?: number;
  changed_files?: number;
}

export type PRState = "open" | "closed" | "all";

export interface PullRequestCardProps {
  pr: {
    id: number;
    number: number;
    title: string;
    state: "open" | "closed";
    draft: boolean;
    htmlUrl: string;
    author: { login: string; avatarUrl: string };
    headRef: string;
    baseRef: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    createdAt: string;
    mergedAt: string | null;
    review: { status: string; createdAt: Date } | null;
  };
  repositoryId: string;
}

export type PullRequestFileStatus =
  | "added"
  | "removed"
  | "modified"
  | "renamed"
  | "copied"
  | "changed"
  | "unchanged";

export interface GitHubPullRequestFile {
  sha: string;
  filename: string;
  status: PullRequestFileStatus;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

export interface PullRequestFile {
  sha: string;
  filename: string;
  status: PullRequestFileStatus;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previousFilename?: string;
}
