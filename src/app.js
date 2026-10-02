import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import favoriteRoutes from "./routes/favorites.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";

export const app = express();

app.set("trust proxy", 1); // Render sits behind a proxy; needed for correct client IPs in rate limiting
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No origin = curl / server-to-server. Otherwise the origin must be in CLIENT_ORIGIN.
      callback(null, !origin || config.clientOrigins.includes(origin));
    },
  }),
);
// Product photos stored in the repo. Cross-origin policy lets the Vercel site load them in <img>.
app.use(
  "/static",
  helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
  express.static("public", { maxAge: "30d", immutable: true }),
);
app.use(express.json({ limit: "100kb" }));
app.use(morgan(config.isProd ? "combined" : "dev"));

if (config.SIMULATE_LATENCY_MS > 0) {
  app.use((req, res, next) => setTimeout(next, config.SIMULATE_LATENCY_MS));
}

app.get("/api/health", async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
