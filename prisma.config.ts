import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Load .env / .env.local the same way Next.js does, so the CLI and the app
// read the same DATABASE_URL.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // ponytail: NEON_DATABASE_URL fallback keeps pre-Prisma deployments working; drop it once envs are renamed.
    url: process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL,
  },
});
