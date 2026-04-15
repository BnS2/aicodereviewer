import { PrismaClient } from "@prisma/client";
import { ENV } from "varlock";

const createPrismaClient = () => new PrismaClient();

const globalPrismaClient = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalPrismaClient.prisma ?? createPrismaClient();

if (ENV.NODE_ENV !== "production") {
  globalPrismaClient.prisma = db;
}
