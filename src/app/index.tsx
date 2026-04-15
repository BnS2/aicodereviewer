import { createFileRoute, Link } from "@tanstack/react-router";
import { HealthCheck } from "@/components/health-check";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex min-hscreen items-center justify-center">
      <div>
        <h1>Welcome to AICodeReviewer</h1>
        <p>Start Reviewing your code today!</p>
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
      </div>
      <HealthCheck />
    </div>
  );
}
