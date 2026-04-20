import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/repos/$repoId/pr/$prNumber")({
  component: prNumber,
});

function prNumber() {
  return <div>Hello "/(dashboard)/repos/$repoId/pr/$prNumber"!</div>;
}
