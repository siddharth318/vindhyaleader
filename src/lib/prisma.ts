import { PrismaClient } from "@prisma/client";

// Avoid exhausting DB connections from hot-reload in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * `next build` prerenders pages in several parallel workers, each with its own Prisma pool
 * (default: 2 × CPUs + 1 connections). Against the shared production database that can use
 * up every connection slot and fail the build, so cap the pool per worker during the build.
 * Runtime (the live site) keeps Prisma's default pool.
 */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.NEXT_PHASE !== "phase-production-build") return undefined;
  try {
    const u = new URL(url);
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "2");
    return u.toString();
  } catch {
    return undefined;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
