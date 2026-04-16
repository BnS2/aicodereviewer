import "varlock/auto-load";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { ENV } from "varlock/env";
import { db } from "../db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: ENV.GITHUB_CLIENT_ID,
      clientSecret: ENV.GITHUB_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7d
    updateAge: 60 * 60 * 24, // 24hrs
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 mins
    },
  },
  trustedOrigins: [ENV.BETTER_AUTH_URL],
  plugins: [tanstackStartCookies()],
});

export type Session = typeof auth.$Infer.Session;
