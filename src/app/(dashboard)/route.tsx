import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Header from "@/components/header";
import { getSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/(dashboard)")({
  beforeLoad: async () => {
    // This server function works safely on both client and server
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: "/sign-in",
      });
    }

    return {
      session,
    };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { session } = Route.useRouteContext();

  return (
    <div className="min-h-screen bg-background">
      <Header user={session.user} />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
