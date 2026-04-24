import {
  AlertCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  FileEditIcon,
  FileMinusIcon,
  FilePlusIcon,
  FileTextIcon,
  FolderTreeIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DiffFile {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previousFilename?: string;
}

interface DiffViewerProps {
  files: Array<DiffFile>;
}

export function DiffViewer({ files }: DiffViewerProps) {
  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(
    new Set(files.slice(0, 3).map((f) => f.sha)),
  );

  const toggleFile = (sha: string) => {
    const next = new Set(expandedFiles);

    if (next.has(sha)) {
      next.delete(sha);
    } else {
      next.add(sha);
    }
    setExpandedFiles(next);
  };

  const expandAll = () => {
    setExpandedFiles(new Set(files.map((f) => f.sha)));
  };

  const collapseAll = () => {
    setExpandedFiles(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <FolderTreeIcon className="size-4 text-primary" />
            </div>
            <div>
              <span className="font-medium text-base tabular-nums">{files.length}</span>
              <span className="ml-1.5 text-muted-foreground text-sm">
                {files.length === 1 ? "file" : "files"} changed
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <PlusIcon className="size-3.5" />
              <span className="tabular-nums">{totalAdditions}</span>
            </span>
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <MinusIcon className="size-3.5" />
              <span className="tabular-nums">{totalDeletions}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size={"sm"} onClick={expandAll}>
            Expand all
          </Button>
          <Button variant={"ghost"} size={"sm"} onClick={collapseAll}>
            Collapse all
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {files.map((file) => (
          <DiffFileCard
            key={file.sha}
            file={file}
            expanded={expandedFiles.has(file.sha)}
            onToggle={() => toggleFile(file.sha)}
          />
        ))}
      </div>
    </div>
  );
}

function DiffFileCard({
  file,
  expanded,
  onToggle,
}: {
  file: DiffFile;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const StatusIcon = getStatusIcon(file.status);
  const statusConfig = getStatusConfig(file.status);

  const copyFilename = () => {
    navigator.clipboard.writeText(file.filename);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pathParts = file.filename.split("/");
  const fileName = pathParts.pop();
  const directory = pathParts.join("/");

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="shrink-0">
          {expanded ? (
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          )}
        </div>

        <div className={cn("shrink-0 rounded-md p-1.5", statusConfig.bg)}>
          {React.createElement(StatusIcon, {
            className: cn("size-4 truncate text-muted-foreground"),
          })}
        </div>

        <div className="min-w-0 flex-1 items-center gap-2">
          {directory && (
            <span className="truncate font-mono text-muted-foreground text-sm">{directory}/</span>
          )}
          <span className="truncate font-medium font-mono text-sm">{fileName}</span>
          {file.changes > 300 && (
            <Badge
              variant={"outline"}
              className="shrink-0 gap-1 border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
            >
              <AlertCircleIcon className="size-3" />
              Large Changes
            </Badge>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {/* Change bar Visualization */}
          <div className="hidden items-center gap-0.5 sm:flex">
            {Array.from({ length: Math.min(5, file.additions) }, (_, idx) => {
              const key = `add-${idx}`;
              return <div key={key} className="h-3 w-1.5 bg-emerald-500" />;
            })}
            {Array.from({ length: Math.min(5, file.deletions) }, (_, idx) => {
              const key = `delete-${idx}`;
              return <div key={key} className="h-3 w-1.5 bg-red-500" />;
            })}
            {file.additions + file.deletions === 0 && (
              <div className="h-3 w-1.5 rounded-sm bg-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400">+{file.additions}</span>
            <span className="text-red-600 dark:text-red-400">-{file.deletions}</span>
          </div>
        </div>
      </button>
      {/* Expanded Content */}
      {expanded && (
        <CardContent className="border-border/60 border-t p-0">
          {file.patch ? (
            <div className="relative">
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                className="absolute top-2 right-2 z-10 bg-background/80 opacity-10 backdrop-blur-sm transition-opacity hover:opacity-100 focus:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  copyFilename();
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon className="size-4" />}
              </Button>
              <DiffContent patch={file.patch} fileId={file.sha} />
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <FileTextIcon className="mx-auto mb-2 size-8 opacity-50" />
              <p>No diff available for this file.</p>
              <p className="mt-1 text-xs">Binary file or too large to display.</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "added":
      return FilePlusIcon;
    case "removed":
      return FileMinusIcon;
    case "modified":
    case "changed":
      return FileEditIcon;
    case "renamed":
      return FileEditIcon;
    default:
      return FileTextIcon;
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "added":
      return {
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
      };
    case "removed":
      return {
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-500/10",
      };
    case "modified":
    case "changed":
      return {
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
      };
    case "renamed":
      return {
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10",
      };
    default:
      return {
        color: "text-muted-foreground",
        bg: "bg-muted",
      };
  }
}

function DiffContent({ patch, fileId }: { patch: string; fileId: string }) {
  const processedLines = React.useMemo(() => {
    const lines = patch.split("\n");
    let oldLineNum = 0;
    let newLineNum = 0;

    return lines.map((line) => {
      const lineInfo = parseLine(line);

      if (lineInfo.isHunk) {
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
        if (match?.[1] && match[2]) {
          oldLineNum = parseInt(match[1], 10);
          newLineNum = parseInt(match[2], 10);
        }
        return { line, lineInfo, oldNum: null, newNum: null };
      }

      const item = {
        line,
        lineInfo,
        oldNum: lineInfo.type === "addition" ? null : oldLineNum,
        newNum: lineInfo.type === "deletion" ? null : newLineNum,
      };

      if (lineInfo.type === "deletion") {
        oldLineNum++;
      } else if (lineInfo.type === "addition") {
        newLineNum++;
      } else if (lineInfo.type === "context") {
        oldLineNum++;
        newLineNum++;
      }

      return item;
    });
  }, [patch]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-xs">
        <tbody>
          {processedLines.map((item) => (
            <DiffTableRow
              key={
                item.lineInfo.isHunk
                  ? `${fileId}-hunk-${item.line}`
                  : `${fileId}-${item.lineInfo.type}-${item.oldNum}-${item.newNum}`
              }
              line={item.line}
              oldNum={item.oldNum}
              newNum={item.newNum}
              lineInfo={item.lineInfo}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiffTableRow({
  line,
  oldNum,
  newNum,
  lineInfo,
}: {
  line: string;
  oldNum: number | null;
  newNum: number | null;
  lineInfo: LineInfo;
}) {
  const isAddition = lineInfo.type === "addition";
  const isDeletion = lineInfo.type === "deletion";
  const isHunk = lineInfo.isHunk;

  return (
    <tr
      className={cn(
        "group border-transparent border-b transition-colors",
        isAddition && "bg-emerald-500/10 hover:bg-emerald-500/20",
        isDeletion && "bg-red-500/10 hover:bg-red-500/20",
        isHunk && "bg-blue-500/5 font-medium text-blue-600/80 dark:text-blue-400/80",
      )}
    >
      <td className="w-10 select-none border-border/50 border-r px-2 py-0.5 text-right text-muted-foreground/40 tabular-nums">
        {oldNum}
      </td>
      <td className="w-10 select-none border-border/50 border-r px-2 py-0.5 text-right text-muted-foreground/40 tabular-nums">
        {newNum}
      </td>
      <td
        className={cn(
          "whitespace-pre-wrap break-all px-4 py-0.5",
          isAddition && "text-emerald-700 dark:text-emerald-300",
          isDeletion && "text-red-700 dark:text-red-300",
          isHunk && "py-1",
        )}
      >
        <span className="mr-2 inline-block w-3 select-none text-muted-foreground/30">
          {isAddition ? "+" : isDeletion ? "-" : " "}
        </span>
        {line.startsWith("+") || line.startsWith("-") ? line.slice(1) : line}
      </td>
    </tr>
  );
}

interface LineInfo {
  type: "addition" | "deletion" | "context" | "hunk";
  isHunk: boolean;
}

function parseLine(line: string): LineInfo {
  if (line.startsWith("@@")) {
    return { type: "hunk", isHunk: true };
  }
  if (line.startsWith("+")) {
    return { type: "addition", isHunk: false };
  }
  if (line.startsWith("-")) {
    return { type: "deletion", isHunk: false };
  }
  return { type: "context", isHunk: false };
}
