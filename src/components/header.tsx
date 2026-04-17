import { Link, useLocation } from "@tanstack/react-router";
import { FolderGit2, GitPullRequest } from "lucide-react";
import type { HeaderProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

const NAV_ITEMS = [
  {
    href: "/repos",
    label: "Repositories",
    icon: FolderGit2,
  },
  {
    href: "/reviews",
    label: "Reviews",
    icon: GitPullRequest,
  },
];

export default function Header({ user }: HeaderProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-border/60 border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
