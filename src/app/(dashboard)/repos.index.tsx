import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  FolderGit2Icon,
  GlobeIcon,
  LockIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { ConnectGithub } from "@/components/connect-github";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "@/lib/logger";
import { trpc } from "@/lib/trpc";
import type { GitHubRepo } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/(dashboard)/repos/")({
  component: Repos,
});

const languageColors: Record<string, string> = {
  typescript: "bg-blue-500",
  javascript: "bg-yellow-400",
  python: "bg-green-500",
  go: "bg-cyan-500",
  rust: "bg-orange-500",
  java: "bg-red-500",
  ruby: "bg-red-400",
  php: "bg-purple-500",
  "c#": "bg-green-600",
  "c++": "bg-pink-500",
  c: "bg-gray-500",
  swift: "bg-orange-400",
  kotlin: "bg-purple-400",
  dart: "bg-blue-400",
  vue: "bg-emerald-500",
  svelte: "bg-orange-600",
  lua: "bg-blue-600",
};

function Repos() {
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [showGitHubRepos, setShowGitHubRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const connectedRepos = trpc.repository.list.useQuery();
  const gitHubRepos = trpc.repository.fetchFromGitHub.useMutation();

  const connectMutation = trpc.repository.connect.useMutation({
    onSuccess: () => {
      connectedRepos.refetch();
      setSelectedRepos(new Set());
      setShowGitHubRepos(false);
    },
    onError: (error) => {
      logger.error("Failed to connect repositories:", error.message);
    },
  });

  const disconnectMutation = trpc.repository.disconnect.useMutation({
    onSuccess: () => {
      connectedRepos.refetch();
    },
    onError: (error) => {
      logger.error("Failed to disconnect repository:", error.message);
    },
  });

  const connectedIds = new Set(connectedRepos.data?.map((repo) => repo.githubId) || []);
  const availableRepos = gitHubRepos.data?.filter((repo) => !connectedIds.has(repo.githubId)) || [];
  const filteredAvailableRepos = availableRepos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLocaleLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleRepo = (githubId: number) => {
    const next = new Set(selectedRepos);
    if (next.has(githubId)) {
      next.delete(githubId);
    } else {
      next.add(githubId);
    }

    setSelectedRepos(next);
  };

  const handleConnect = () => {
    const reposToConnect = availableRepos
      .filter((repo) => selectedRepos.has(repo.githubId))
      .map((r) => ({
        githubId: r.githubId,
        name: r.name,
        fullName: r.fullName,
        private: r.private,
        htmlUrl: r.htmlUrl,
        description: r.description ?? null,
        language: r.language ?? null,
        stars: r.stars,
      }));

    connectMutation.mutate({ repos: reposToConnect });
  };

  const selectAll = () => {
    setSelectedRepos(new Set(filteredAvailableRepos.map((r) => r.githubId)));
  };

  const clearSelection = () => {
    setSelectedRepos(new Set());
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Repositories</h1>
          <p className="mt-1 text-muted-foreground">
            Select repositories to connect from your GitHub account
          </p>
        </div>
        <Button
          onClick={() => {
            const nextState = !showGitHubRepos;
            setShowGitHubRepos(nextState);

            if (nextState && !gitHubRepos.data) {
              gitHubRepos.mutate();
            }

            setSearchQuery("");
            setSelectedRepos(new Set());
          }}
          variant={showGitHubRepos ? "outline" : "default"}
        >
          {showGitHubRepos ? (
            <>
              <XIcon className="size-4" />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon className="size-4" />
              Add Repository
            </>
          )}
        </Button>
      </div>

      {showGitHubRepos && (
        <Card className="overflow-hidden">
          <div className="border-border/60 border-b bg-muted/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Import GitHub Repositories</h2>
                <p className="mt-0.5 text-muted-foreground text-sm">
                  Select repositories to import from Github
                </p>
              </div>
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                onClick={() => gitHubRepos.mutate()}
                disabled={gitHubRepos.isPending}
              >
                <RefreshCwIcon
                  className={gitHubRepos.isPending ? "size-4 animate-spin" : "size-4"}
                />
              </Button>
            </div>
          </div>

          <CardContent className="p-0">
            {gitHubRepos.isPending ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3, 4].map((id) => (
                  <Skeleton key={id} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : gitHubRepos.error ? (
              <div className="p-6">
                {gitHubRepos.error.data?.code === "PRECONDITION_FAILED" ? (
                  <ConnectGithub
                    title="GitHub account not connected"
                    description="Connect your GitHub account to view your repositories."
                  />
                ) : (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
                    <p className="text-destructive text-sm">{gitHubRepos.error.message}</p>
                  </div>
                )}
              </div>
            ) : availableRepos.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircleIcon className="size-6 text-emerald-500" />
                </div>

                <p className="mt-4 font-medium">All caught up!</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  All your repositories are already connected
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 border-border/60 border-b p-4 px-6">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search repositories"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Select all
                    </button>
                    {selectedRepos.size > 0 && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <button
                          type="button"
                          onClick={clearSelection}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="max-h-100 overflow-y-auto">
                  {filteredAvailableRepos.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground text-sm">
                        No repositories match your search.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {filteredAvailableRepos.map((repo) => (
                        <RepoSelectItem
                          key={repo.githubId}
                          repo={repo}
                          selected={selectedRepos.has(repo.githubId)}
                          onToggle={() => toggleRepo(repo.githubId)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-border/60 border-t bg-muted/60 px-6 py-4">
                  <p className="text-muted-foreground text-sm">
                    {selectedRepos.size} of {filteredAvailableRepos.length} selected
                  </p>
                  <Button
                    onClick={handleConnect}
                    disabled={selectedRepos.size === 0 || connectMutation.isPending}
                  >
                    {connectMutation.isPending ? (
                      <>
                        <RefreshCwIcon className="size-4 animate-spin" /> Connecting...
                      </>
                    ) : (
                      <>Connect {selectedRepos.size > 0 && `(${selectedRepos.size})`}</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
            Connected Repositories
          </h2>
          {connectedRepos.data && connectedRepos.data.length > 0 && (
            <Badge variant={"secondary"} className="tabular-nums">
              {connectedRepos.data.length}
            </Badge>
          )}
        </div>
        {connectedRepos.isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((id) => (
              <Skeleton key={id} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : connectedRepos.data?.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto flex h-14 items-center justify-center rounded-full bg-muted">
                <FolderGit2Icon className="size-7 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">No connected repositories found</p>
              <p className="mx-auto mt-1 max-w-sm text-muted-foreground text-sm">
                Connect your GitHub repositories to start getting AI-powered code reviews on your
                pull requests.
              </p>
              <Button
                className="mt-6"
                onClick={() => {
                  setShowGitHubRepos(true);
                  if (!gitHubRepos.data) {
                    gitHubRepos.mutate();
                  }
                }}
              >
                <PlusIcon className="size-4" />
                Add your first repository
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {connectedRepos.data?.map((repo) => (
              <ConnectedRepoCard
                key={repo.id}
                repo={repo}
                onDisconnect={() =>
                  disconnectMutation.mutate({
                    id: repo.id,
                  })
                }
                isDisconnecting={disconnectMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectedRepoCard({
  repo,
  onDisconnect,
  isDisconnecting,
}: {
  repo: {
    id: string;
    fullName: string;
    private: boolean;
    createdAt: Date;
  };
  onDisconnect: () => void;
  isDisconnecting: boolean;
}) {
  return (
    <Card className="group transition-all hover:border-primary/30 hover:shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link to="/repos/$repoId" params={{ repoId: repo.id }} className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                  repo.private
                    ? "bg-amber-500/10 group-hover:bg-amber-500/15"
                    : "bg-emerald-500/10 group-hover:bg-emerald-500/15",
                )}
              >
                {repo.private ? (
                  <LockIcon className="size-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <GlobeIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="min-w-0">
                <span className="block truncate font-medium transition-colors group-hover:text-primary">
                  {repo.fullName}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={"outline"} className="h-5 px-1.5 py-0 text-xs">
                    {repo.private ? "Private" : "Public"}
                  </Badge>
                </div>
              </div>
            </div>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                disabled={isDisconnecting}
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Repository</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to disconnect{" "}
                  <span className="font-medium text-muted-foreground">
                    &quot;{repo.fullName}&quot;
                  </span>{" "}
                  ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDisconnect} variant={"destructive"}>
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-4 flex items-center justify-between border-border/60 border-t pt-4">
          <span className="text-muted-foreground text-xs">
            Connected {formatDate(repo.createdAt)}
          </span>
          <Link to="/repos/$repoId" params={{ repoId: repo.id }}>
            <Button variant={"ghost"} size={"sm"} className="-mr-2 h-7 gap-1.5 text-xs">
              View PRs <ArrowRightIcon className="size-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function RepoSelectItem({
  repo,
  selected,
  onToggle,
}: {
  repo: GitHubRepo;
  selected: boolean;
  onToggle: () => void;
}) {
  const langColor = repo.language
    ? languageColors[repo.language.toLowerCase()] || "bg-gray-400"
    : null;

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: custom checkbox layout
    <label
      className={cn(
        "flex cursor-pointer items-center gap-4 px-6 py-4 transition-colors",
        selected ? "bg-primary/5" : "hover:bg-muted/50",
      )}
    >
      <Checkbox checked={selected} onCheckedChange={onToggle} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{repo.fullName}</span>
          {repo.private && <LockIcon className="size-3 shrink-0 text-muted-foreground" />}
        </div>
        {repo.description && (
          <p className="mt-0.5 truncate text-muted-foreground text-sm">{repo.description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {repo.stars > 0 && (
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <StarIcon className="size-3" />
            <span className="tabular-nums">{repo.stars}</span>
          </span>
        )}
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span className={cn("size-2.5 shrink-0 rounded-full", langColor)} />
            <span className="text-muted-foreground text-xs">{repo.language}</span>
          </div>
        )}
      </div>
    </label>
  );
}
