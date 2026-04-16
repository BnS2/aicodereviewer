import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/repos")({
  component: Repos,
});

function Repos() {
  return <div>Hello "/repos"!</div>;
}
