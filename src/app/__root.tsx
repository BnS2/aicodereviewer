import type { ErrorComponentProps } from "@tanstack/react-router";
import { createRootRoute, HeadContent, Outlet, Scripts, useRouter } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { TRPCProvider } from "@/lib/trpc";

import appCss from "./globals.css?url";

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  const isDev = import.meta.env.DEV;

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
            background: "#0f0f0f",
            color: "#e5e5e5",
          }}
        >
          <div style={{ maxWidth: "800px", width: "100%" }}>
            <h1 style={{ color: "#f87171", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#a3a3a3", marginBottom: "1.5rem" }}>
              {error instanceof Error ? error.message : String(error)}
            </p>

            {isDev && error instanceof Error && error.stack && (
              <pre
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "1rem",
                  fontSize: "0.75rem",
                  overflowX: "auto",
                  color: "#fca5a5",
                  marginBottom: "1.5rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {error.stack}
              </pre>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => {
                  reset();
                  router.invalidate();
                }}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => router.navigate({ to: "/" })}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#262626",
                  color: "#e5e5e5",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TRPCProvider>
          <Outlet />
        </TRPCProvider>
        <Scripts />
      </body>
    </html>
  );
}
