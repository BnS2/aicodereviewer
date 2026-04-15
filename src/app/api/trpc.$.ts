import { createFileRoute } from "@tanstack/react-router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: (ctx) => handler(ctx.request),
      POST: (ctx) => handler(ctx.request),
    },
  },
});
