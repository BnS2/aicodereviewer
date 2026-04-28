import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { GitHubPullRequest, GitHubPullRequestFile, PullRequestFile } from "./types";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();

  const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffMs = localNow.getTime() - localDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";

  if (diffDays < 0) {
    const futureDays = Math.abs(diffDays);
    if (futureDays === 1) return "tomorrow";
    if (futureDays < 7) return `in ${futureDays} days`;
    if (futureDays < 30) return `in ${Math.floor(futureDays / 7)} weeks`;
    if (futureDays < 365) return `in ${Math.floor(futureDays / 30)} months`;
  }

  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const getTimeAgo = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

// Helper to format PR uniformly
export function formatPR(
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
    additions: pr.additions ?? 0,
    deletions: pr.deletions ?? 0,
    changedFiles: pr.changed_files ?? 0,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    mergedAt: pr.merged_at,
    review: review ? { status: review.status, createdAt: review.createdAt.toISOString() } : null,
  };
}

export function formatPRFiles(files: Array<GitHubPullRequestFile>): Array<PullRequestFile> {
  return files.map((file) => ({
    sha: file.sha,
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch,
    previousFilename: file.previous_filename,
  }));
}
