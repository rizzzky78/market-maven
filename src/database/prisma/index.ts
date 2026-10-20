import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma client over node-postgres (`@prisma/adapter-pg`), usable with any
 * PostgreSQL-compatible database: self-hosted, Neon, Supabase and similar.
 */
const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({
      // ponytail: NEON_DATABASE_URL fallback keeps pre-Prisma deployments working; drop it once envs are renamed.
      connectionString:
        process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL,
    }),
  });

// Reuse one client (and its connection pool) across dev hot reloads.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
