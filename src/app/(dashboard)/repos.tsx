import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/repos")({
  component: Repos,
});

function Repos() {
  return <div>Hello "/(dashboard)/repos"!</div>;
}
