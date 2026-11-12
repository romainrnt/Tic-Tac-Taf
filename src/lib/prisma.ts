import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const LOCAL_DATABASE_URL = "file:./prisma/dev.db";

/**
 * Resolves the libSQL connection: Turso when configured, the local file otherwise.
 * Refuses to fall back to a local file on Vercel, where the disk is ephemeral.
 *
 * @returns Connection URL and optional auth token
 */
function resolveDatabaseConnection(): { url: string; authToken?: string } {
  const remoteUrl = process.env.TURSO_DATABASE_URL;

  if (remoteUrl) {
    return {
      url: remoteUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }

  if (process.env.VERCEL) {
    throw new Error("TURSO_DATABASE_URL is required when running on Vercel");
  }

  return { url: LOCAL_DATABASE_URL };
}

/**
 * Builds a Prisma client bound to the resolved libSQL database.
 *
 * @returns Configured PrismaClient instance
 */
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaLibSql(resolveDatabaseConnection());

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

/**
 * Shared Prisma client reused across hot reloads in development.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
