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
  Loader2Icon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  XCircleIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { cn, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/(dashboard)/repos/$repoId/pr/$prNumber")({
  component: PullRequestDetailPage,
});

function PullRequestDetailPage() {
  const { repoId, prNumber } = Route.useParams();
  const numPrNumber = Number.parseInt(prNumber, 10);

  const repository = trpc.repository.list.useQuery(undefined, {
    select: (repos) => repos.find((r) => r.id === repoId),
    enabled: !!repoId,
  });

  const pr = trpc.pullRequest.get.useQuery(
    {
      repositoryId: repoId,
      prNumber: numPrNumber,
    },
    { enabled: !!repoId && !Number.isNaN(numPrNumber) },
  );

  if (pr.isLoading || repository.isLoading) {
    return <LoadingState />;
  }

  if (pr.error || !pr.data || !repository.data) {
    return <ErrorState message={pr.error?.message || "Pull request not found"} repoId={repoId} />;
  }

  const data = pr.data;
  const isMerged = data.state === "closed" && data.mergedAt !== null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link to="/repos/$repoId" params={{ repoId }}>
            <Button variant={"outline"} size={"icon"} className="shrink-0">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-2xl tracking-tight">{data.title}</h1>
              <Badge
                variant={data.state === "open" ? "default" : "secondary"}
                className={cn(
                  "gap-1",
                  data.state === "open" &&
                    "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400",
                  isMerged &&
                    "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 dark:text-purple-400",
                )}
              >
                {isMerged ? (
                  <GitMergeIcon className="size-3" />
                ) : (
                  <GitPullRequestIcon className="size-3" />
                )}
                {isMerged ? "Merged" : data.state.charAt(0).toUpperCase() + data.state.slice(1)}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
              <span className="font-mono text-xs">#{data.number}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Avatar className="size-4 ring-1 ring-border">
                  <AvatarImage src={data.author.avatarUrl} alt={data.author.login} />
                  <AvatarFallback>{data.author.login[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                {data.author.login}
              </span>
              <span>·</span>
              <span>opened {formatDate(new Date(data.createdAt))}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={"ghost"}
            size={"icon-sm"}
            onClick={() => pr.refetch()}
            disabled={pr.isFetching}
          >
            <RefreshCwIcon className={cn("size-4", pr.isFetching && "animate-spin")} />
          </Button>
          <a href={data.htmlUrl} target="_blank" rel="noopener noreferrer">
            <Button variant={"outline"} size={"sm"} className="gap-2">
              <ExternalLinkIcon className="size-4" />
              View on GitHub
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-medium text-muted-foreground text-sm uppercase tracking-wider">
                Branches
              </h3>
              <div className="flex items-center gap-3 font-mono text-sm">
                <code className="rounded-md bg-muted px-2 py-1 text-foreground">
                  {data.baseRef}
                </code>
                <ArrowLeftIcon className="size-4 text-muted-foreground" />
                <code className="rounded-md bg-muted px-2 py-1 text-foreground">
                  {data.headRef}
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-medium text-muted-foreground text-sm uppercase tracking-wider">
                Changes
              </h3>
              <div className="flex items-center gap-8">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Files Changed</p>
                  <p className="flex items-center gap-2 font-semibold text-2xl">
                    <FileTextIcon className="size-5 text-muted-foreground" />
                    {data.changedFiles}
                  </p>
                </div>
                <div className="h-10 w-px bg-border/60" />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Additions</p>
                  <p className="flex items-center gap-2 font-semibold text-2xl text-emerald-600 dark:text-emerald-400">
                    <PlusIcon className="size-5" />
                    {data.additions}
                  </p>
                </div>
                <div className="h-10 w-px bg-border/60" />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Deletions</p>
                  <p className="flex items-center gap-2 font-semibold text-2xl text-red-600 dark:text-red-400">
                    <MinusIcon className="size-5" />
                    {data.deletions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-medium text-muted-foreground text-sm uppercase tracking-wider">
                Review Status
              </h3>
              {data.review ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ReviewStatusIcon status={data.review.status} />
                    <div>
                      <p className="font-medium">
                        {data.review.status.charAt(0) + data.review.status.slice(1).toLowerCase()}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Last updated {formatDate(new Date(data.review.createdAt))}
                      </p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Full Review
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <ClockIcon className="size-5" />
                    <p className="font-medium">No review yet</p>
                  </div>
                  <Button className="w-full">Start Review Analysis</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-medium text-muted-foreground text-sm uppercase tracking-wider">
                Repository
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <GitBranchIcon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{repository.data.fullName}</p>
                  <Link
                    to="/repos/$repoId"
                    params={{ repoId }}
                    className="text-muted-foreground text-xs hover:underline"
                  >
                    View all pull requests
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReviewStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircleIcon className="size-5 text-emerald-500" />;
    case "PROCESSING":
      return <Loader2Icon className="size-5 animate-spin text-blue-500" />;
    case "PENDING":
      return <ClockIcon className="size-5 text-amber-500" />;
    case "FAILED":
      return <XCircleIcon className="size-5 text-red-500" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
}

function LoadingState() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <Skeleton className="size-9 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, repoId }: { message: string; repoId: string }) {
  return (
    <Card className="py-16 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <XCircleIcon className="size-6 text-destructive" />
      </div>
      <p className="mt-4 font-medium text-destructive">Error Loading Pull Request</p>
      <p className="mt-1 text-muted-foreground text-sm">{message}</p>
      <Link to="/repos/$repoId" params={{ repoId }} className="mt-6 inline-block">
        <Button variant={"outline"}>
          <ArrowLeftIcon className="size-4" />
          Back to repository
        </Button>
      </Link>
    </Card>
  );
}
