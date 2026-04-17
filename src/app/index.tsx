import { createFileRoute, Link } from "@tanstack/react-router";
import { HealthCheck } from "@/components/health-check";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <h1>Welcome to AICodeReviewer</h1>
        <p>Start Reviewing your code today!</p>
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link to="/sign-in">Sign In</Link>
        </Button>
        <Button asChild>
          <Link to="/sign-up">Sign Up</Link>
        </Button>
      </div>
      <HealthCheck />
    </div>
  );
}
