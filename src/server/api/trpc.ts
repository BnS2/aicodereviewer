import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { flattenError, ZodError } from "zod";
// import { db } from "@/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    // db,
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
