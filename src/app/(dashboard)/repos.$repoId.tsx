import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/repos/$repoId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { repoId } = Route.useParams();
  return <div>Hello {repoId}</div>;
}
