// Prisma CLI config (migrate, seed, studio). The running app reads DATABASE_URL in src/db.js.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Migrations should use Neon's direct (non-pooled) connection when available.
    url: process.env.DIRECT_URL || env("DATABASE_URL"),
  },
});
