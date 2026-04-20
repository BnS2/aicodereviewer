import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GitBranchIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  GlobeIcon,
  Loader2Icon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import type { PRState, PullRequestCardProps } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/(dashboard)/repos/$repoId/")({
  component: RepositoryDetailPage,
});

function RepositoryDetailPage() {
  const [prState, setPrState] = useState<PRState>("open");
  const { repoId } = Route.useParams();
  const prStateValues: Array<PRState> = ["open", "closed", "all"];

  const repository = trpc.repository.list.useQuery(undefined, {
    select: (repos) => repos.find((r) => r.id === repoId),
    enabled: !!repoId,
  });

  const pr = trpc.pullRequest.list.useQuery(
    {
      repositoryId: repoId,
      state: prState,
    },
    { enabled: !!repoId },
  );

  const prs = trpc.pullRequest.list.useQuery(
    {
      repositoryId: repoId,
      state: "all",
      countsOnly: true,
    },
    { enabled: !!repoId },
  );

  const prCounts = {
    open: prs.data?.filter((p) => p.state === "open").length ?? 0,
    closed: prs.data?.filter((p) => p.state === "closed").length ?? 0,
    all: prs.data?.length ?? 0,
  };

  if (repository.isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((id) => (
            <Skeleton key={id} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!repository.data) {
    return (
      <Card className="py-16 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <GitBranchIcon className="size-6 text-muted-foreground" />
        </div>
        <p className="mt-4 font-medium">Repository not found</p>
        <p className="mt-1 text-muted-foreground text-sm">
          The repository may have been disconnected.
        </p>
        <Link to="/repos" className="mt-6 inline-block">
          <Button variant={"outline"}>
            <ArrowLeftIcon className="size-4" />
            Back to repositories
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link to="/repos">
            <Button variant={"outline"} size={"icon"} className="shrink-0">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-2xl tracking-tight">{repository.data.fullName}</h1>
              <Badge variant={"outline"} className="gap-1">
                {repository.data.private ? (
                  <>
                    <LockIcon className="size-3" />
                    Private
                  </>
                ) : (
                  <>
                    <GlobeIcon className="size-3" />
                    Public
                  </>
                )}
              </Badge>
            </div>
            <a
              href={repository.data.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
              View on GitHub
              <ExternalLinkIcon className="size-3" />
            </a>
          </div>
        </div>
        <Button
          variant={"ghost"}
          size={"icon-sm"}
          onClick={() => {
            prs.refetch();
            pr.refetch();
          }}
        >
          <RefreshCwIcon
            className={cn("size-4", (prs.isFetching || pr.isFetching) && "animate-spin")}
          />
        </Button>
      </div>

      <div className="border-border/60 border-b">
        <div className="flex items-center gap-1">
          {prStateValues.map((state) => (
            <button
              type="button"
              key={state}
              onClick={() => setPrState(state)}
              className={cn(
                "relative px-4 py-2.5 font-medium text-sm transition-colors",
                prState === state
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-2">
                {state === "open" && <GitPullRequestIcon className="size-4 text-emerald-500" />}
                {state === "closed" && <GitPullRequestIcon className="size-4 text-purple-500" />}
                {state === "all" && <GitBranchIcon className="size-4 text-muted-foreground" />}

                {state.charAt(0).toUpperCase() + state.slice(1)}
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                    prState === state
                      ? "bg-foreground/10 text-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {prCounts[state]}
                </span>
              </span>
              {prState === state && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {pr.isLoading ? (
          [1, 2, 3].map((index) => <Skeleton key={index} className="h-32 w-full rounded-xl" />)
        ) : prs.error ? (
          <Card className="border-destructive/50">
            <CardContent className="py-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircleIcon className="size-6 text-destructive" />
              </div>
              <p className="mt-4 font-medium text-destructive">Failed to load pull requests.</p>
              <p className="mt-1 text-muted-foreground text-sm">{prs.error.message}</p>
            </CardContent>
          </Card>
        ) : pr.data?.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                <GitPullRequestIcon className="size-6 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">No pull requests found.</p>
              <p className="mt-1 text-muted-foreground text-sm">
                {prState === "all"
                  ? "This repository has no pull requests  yet."
                  : `No ${prState} pull requests found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          pr.data?.map((p) => <PullRequestCard key={p.id} pr={p} repositoryId={repoId} />)
        )}
      </div>
    </div>
  );
}

const PullRequestCard = ({ pr, repositoryId }: PullRequestCardProps) => {
  const isMerged = pr.state === "closed" && pr.mergedAt !== null;

  return (
    <Card className="group transition-all hover:border-border">
      <CardContent className="p-5">
        <div>
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div>
              {isMerged ? (
                <GitMergeIcon className="size-4 text-purple-500" />
              ) : pr.state === "closed" ? (
                <XCircleIcon className="size-4 text-red-500" />
              ) : (
                <GitPullRequestIcon className="size-4 text-emerald-500" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <Link
                  to="/repos/$repoId/pr/$prNumber"
                  params={{ repoId: repositoryId, prNumber: pr.number.toString() }}
                  className="line-clamp-1 font-medium transition-colors hover:text-primary"
                >
                  {pr.title}
                </Link>
                {pr.draft && (
                  <Badge variant={"secondary"} className="text-xs">
                    Draft
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <span className="font-mono text-xs">#{pr.number}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="flex items-center gap-1.5">
                  <Avatar className="size-4 ring-1 ring-border">
                    <AvatarImage
                      src={pr.author.avatarUrl}
                      alt={pr.author.login}
                      className="text-[10px]"
                    />
                    <AvatarFallback>{pr.author.login[0].toUpperCase() || "?"}</AvatarFallback>
                  </Avatar>
                  {pr.author.login}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="size-3" />
                  {formatDate(new Date(pr.createdAt))}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <code className="flex items-center truncate rounded-md bg-muted px-2 py-0.5 font-mono text-muted-foreground text-xs">
                  {pr.baseRef}
                  <ArrowLeftIcon className="mx-1.5 size-3 text-muted-foreground/50" />
                  {pr.headRef}
                </code>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="text-muted-foreground/50">(</span>
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                      <PlusIcon className="mr-0.5 size-3" />
                      {pr.additions}
                    </span>
                    <span className="mx-1 text-muted-foreground/30">/</span>
                    <span className="flex items-center text-red-600 dark:text-red-400">
                      <MinusIcon className="mr-0.5 size-3" />
                      {pr.deletions}
                    </span>
                    <span className="text-muted-foreground/50">)</span>
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="flex items-center gap-1">
                    <FileTextIcon className="size-3" />
                    <span>{pr.changedFiles} files</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {pr.review && <ReviewStatusBadge status={pr.review.status} />}
              <Link
                to="/repos/$repoId/pr/$prNumber"
                params={{ repoId: repositoryId, prNumber: pr.number.toString() }}
              >
                <Button variant={pr.review ? "outline" : "default"}>
                  {pr.review ? "View" : "Review"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ReviewStatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className: string;
  spin?: boolean;
}

const ReviewStatusBadge = ({ status }: { status: string }) => {
  const configMap: Record<string, ReviewStatusConfig> = {
    COMPLETED: {
      icon: CheckCircleIcon,
      label: "Reviewed",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    PROCESSING: {
      icon: Loader2Icon,
      label: "Analyzing",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      spin: true,
    },
    PENDING: {
      icon: ClockIcon,
      label: "Queued",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    FAILED: {
      icon: XCircleIcon,
      label: "Failed",
      className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
  };

  const config = configMap[status] ?? {
    icon: ClockIcon,
    label: "Pending",
    className: "bg-muted text-muted-foreground",
  };

  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon className={cn("size-3", config.spin && "animate-spin")} />
      {config.label}
    </Badge>
  );
};
