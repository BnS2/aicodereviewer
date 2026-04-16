import "varlock/auto-load";

import { ENV } from "varlock/env";
import { PrismaClient } from "@/generated/prisma/client";

const createPrismaClient = () => new PrismaClient();

const globalPrismaClient = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalPrismaClient.prisma ?? createPrismaClient();

if (ENV.NODE_ENV !== "production") {
  globalPrismaClient.prisma = db;
}
