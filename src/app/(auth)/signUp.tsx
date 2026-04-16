import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/signUp")({
  component: signUp,
});

function signUp() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <h1>signUp</h1>
      </div>
    </div>
  );
}
