import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { TRPCProvider } from "@/lib/trpc";

import appCss from "./globals.css?url";

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
