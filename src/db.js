import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

// One PrismaClient (= one connection pool) for the whole process.
// DB_POOL_MAX=1 is needed for the local `prisma dev` database, which can't handle
// several connections at once. Neon handles the default pool size fine.
export function createPrisma(connectionString = process.env.DATABASE_URL) {
  const max = process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : undefined;
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, ...(max && { max }) }) });
}

export const prisma = createPrisma();
