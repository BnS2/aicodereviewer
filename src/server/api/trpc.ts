import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { flattenError, ZodError } from "zod";
import { db } from "@/server/db";
import { auth } from "../auth";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });

  return {
    db,
    session,
    headers: opts.headers,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? flattenError(error.cause) : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});
