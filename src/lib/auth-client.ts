import { createAuthClient } from "better-auth/react";
import { ENV } from "varlock/env";

export const authClient = createAuthClient({
  baseURL: ENV.PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession, getSession, linkSocial } = authClient;
