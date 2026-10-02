import "dotenv/config";
import { z } from "zod";

// Fail fast on startup if an env variable is missing, instead of crashing on the first request.
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (Neon connection string)"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  // Comma separated list, e.g. "http://localhost:5173,https://cyber-shop.vercel.app"
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  // Public base URL of this API, used to build absolute URLs for images in /public.
  // Render sets RENDER_EXTERNAL_URL automatically.
  PUBLIC_URL: z.string().optional(),
  RENDER_EXTERNAL_URL: z.string().optional(),
  // Adds an artificial delay to every API response so loading states can be seen locally.
  SIMULATE_LATENCY_MS: z.coerce.number().default(0),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:");
  for (const issue of parsed.error.issues) console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

export const config = {
  ...parsed.data,
  clientOrigins: parsed.data.CLIENT_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean),
  isProd: parsed.data.NODE_ENV === "production",
  publicUrl: (
    parsed.data.PUBLIC_URL ?? parsed.data.RENDER_EXTERNAL_URL ?? `http://localhost:${parsed.data.PORT}`
  ).replace(/\/$/, ""),
};
