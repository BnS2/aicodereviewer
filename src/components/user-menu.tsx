import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import type { UserProps } from "@/lib/types";

export function UserMenu({ user }: { user: UserProps }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/sign-in" });
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="h-9 gap-2 px-2 hover:bg-muted/80">
          <Avatar className="size-7 ring-1 ring-border">
            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
            <AvatarFallback className="bg-primary/10 font-medium text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-25 truncate font-medium text-sm sm:inline-block">
            {user.name || "User"}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-1 ring-border">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback className="bg-primary/10 font-medium text-primary text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-sm">{user.name || "User"}</span>
              <span className="truncate text-muted-foreground text-xs">
                {user.email || "Email"}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer gap-2 py-2" disabled>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer gap-2 py-2" disabled>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2 py-2"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
