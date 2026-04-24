import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GitBranchIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  Loader2Icon,
  MinusIcon,
  PlusIcon,
  ScanSearchIcon,
  SparklesIcon,
  Wand2Icon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { cn, formatDate } from "@/lib/utils";
import { DiffViewer } from "@/components/diff-viewer";

export const Route = createFileRoute("/(dashboard)/repos/$repoId/pr/$prNumber")({
  component: PullRequestDetailPage,
});

function PullRequestDetailPage() {
  const { repoId, prNumber } = Route.useParams();
  const numPrNumber = Number.parseInt(prNumber, 10);
  const [activeTab, setActiveTab] = useState<"review" | "files">("review");

  const pr = trpc.pullRequest.get.useQuery(
    {
      repositoryId: repoId,
      prNumber: numPrNumber,
    },
    { enabled: !Number.isNaN(numPrNumber) },
  );

  const files = trpc.pullRequest.files.useQuery(
    {
      repositoryId: repoId,
      prNumber: numPrNumber,
    },
    { enabled: !Number.isNaN(numPrNumber) },
  );

  if (pr.isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (pr.error || !pr.data) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircleIcon className="size-6 text-destructive" />
          </div>
          <p className="mt-4 font-medium text-destructive">
            {pr.error?.message ?? "Pull request not found"}
          </p>
          <Link to={`/repos/$repoId`} params={{ repoId }} className="mt-6 inline-block">
            <Button variant={"outline"}>
              <ArrowLeftIcon className="size-4" />
              Back to Repository
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isMerged = pr.data.state === "closed" && pr.data.mergedAt;

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <Link to={`/repos/$repoId`} params={{ repoId }}>
          <Button variant={"outline"} size={"icon"} className="mt-1 shrink-0">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={cn(
                    "shrink-0 rounded-lg p-2",
                    isMerged
                      ? "bg-purple-500/10"
                      : pr.data.state === "closed"
                        ? "bg-red-500/10"
                        : "bg-emerald-500/10",
                  )}
                >
                  {isMerged ? (
                    <GitMergeIcon className="size-5 text-purple-500" />
                  ) : pr.data.state === "closed" ? (
                    <XCircleIcon className="size-5 text-red-500" />
                  ) : (
                    <GitPullRequestIcon className="size-5 text-emerald-500" />
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate font-semibold text-xl tracking-tight">{pr.data.title}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <PRStatusBadge
                      state={pr.data.state}
                      isMerged={!!isMerged}
                      draft={pr.data.draft}
                    />
                    <span className="font-mono text-muted-foreground text-sm">
                      #{pr.data.number}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <a
              href={pr.data.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant={"outline"} size={"sm"} className="gap-2">
                <ExternalLinkIcon className="size-4" />
                GitHub
              </Button>
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
              <Avatar className="size-5 ring-1 ring-border">
                <AvatarImage src={pr.data.author.avatarUrl} />
                <AvatarFallback className="text-[10px]">
                  {pr.data.author.login[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{pr.data.author.login}</span>
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="size-3.5" />
              {formatDate(pr.data.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center divide-x divide-border/60">
            <div className="flex-1 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <GitBranchIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-muted-foreground text-xs">Merged request</p>
                  <div className="flex items-center gap-2 text-sm">
                    <code className="min-w-0 truncate rounded bg-secondary px-2 py-0.5 font-mono text-xs">
                      {pr.data.headRef}
                    </code>
                    <ArrowRightIcon className="size-3 shrink-0 text-muted-foreground" />
                    <code className="min-w-0 truncate rounded bg-secondary px-2 py-0.5 font-mono text-xs">
                      {pr.data.baseRef}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 px-6 py-4">
              <StatItem
                icon={PlusIcon}
                value={pr.data.additions}
                colorClass="text-emerald-600 dark:text-emerald-400"
                bgClass="bg-emerald-500/10"
              />
              <StatItem
                icon={MinusIcon}
                value={pr.data.deletions}
                colorClass="text-red-600 dark:text-red-400"
                bgClass="bg-red-500/10"
              />
              <StatItem
                icon={FileTextIcon}
                value={pr.data.changedFiles}
                colorClass="text-muted-foreground dark:text-muted-foreground"
                bgClass="bg-muted"
              />
            </div>

            {/* TODO: Review action cluster */}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-border/60 border-b">
        <div className="flex items-center gap-1">
          <TabButton
            active={activeTab === "files"}
            onClick={() => setActiveTab("files")}
            icon={FileTextIcon}
            label="Changed Files"
            count={files.data?.length}
          />
        </div>
      </div>

      {activeTab === "files" && (
        <div>
          {files.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : files.error ? (
            <Card className="border-destructive/50">
              <CardContent className="py-12 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <XCircleIcon className="size-6 text-destructive" />
                </div>
                <p className="mt-4 font-medium text-destructive">No files changed.</p>
                <p className="mt-1 text-muted-foreground text-sm">{files.error.message}</p>
              </CardContent>
            </Card>
          ) : files.data ? (
            <DiffViewer files={files.data} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function PRStatusBadge({
  state,
  isMerged,
  draft,
}: {
  state: string;
  isMerged: boolean;
  draft: boolean;
}) {
  if (draft) {
    return (
      <Badge variant={"secondary"} className="gap-1">
        Draft
      </Badge>
    );
  }

  if (isMerged) {
    return (
      <Badge
        variant={"secondary"}
        className="gap-1 border border-purple-500/20 bg-purple-600/10 dark:text-purple-400"
      >
        <GitMergeIcon className="size-3" />
        Merged
      </Badge>
    );
  }

  if (state === "closed") {
    return (
      <Badge variant={"destructive"} className="gap-1">
        <XCircleIcon className="size-3" />
        Closed
      </Badge>
    );
  }

  if (state === "open") {
    return (
      <Badge
        variant={"secondary"}
        className="gap-1 border border-emerald-500/20 bg-emerald-600/10 dark:text-emerald-400"
      >
        <GitMergeIcon className="size-3" />
        Open
      </Badge>
    );
  }
}

function StatItem({
  icon: Icon,
  value,
  label,
  colorClass,
  bgClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label?: string;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-md p-1.5", bgClass)}>
        <Icon className={cn("size-3.5", colorClass)} />
      </div>
      <div>
        <p className={cn("font-semibold text-sm tabular-nums", colorClass)}>
          {value.toLocaleString()}
        </p>
        {label && <p className={cn("font-medium text-xs", colorClass)}>{label}</p>}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-xs tabular-nums",
            active ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
      {active && (
        <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-primary" />
      )}
    </button>
  );
}
