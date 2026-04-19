import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { linkSocial } from "@/lib/auth-client";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface ConnectGithubProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ConnectGithub({
  title = "Connect your GitHub Account",
  description = "Link your GitHub account to access your repositories and get AI-powered code reviews.",
  className,
}: ConnectGithubProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      await linkSocial({
        provider: "github",
        callbackURL: window.location.href,
      });
    } catch (err) {
      logger.error("Failed to connect GitHub:", err);
      setIsConnecting(false);
    }
  };

  return (
    <Card className={cn(className)}>
      <CardContent className="py-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <FaGithub className="size-7 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-semibold text-lg">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">{description}</p>
        <Button className="mt-6" onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <>
              <FaGithub className="size-4" /> Connect GitHub
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
