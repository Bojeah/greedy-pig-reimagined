import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/authRoutes.js";
import profileRoutes from "./modules/progression/profileRoutes.js";
import statsRoutes from "./modules/stats/statsRoutes.js";
import leaderboardRoutes from "./modules/leaderboard/leaderboardRoutes.js";
import historyRoutes from "./modules/history/historyRoutes.js";
import roomRoutes from "./modules/rooms/roomRoutes.js";

export const app = express();

// Render puts a proxy in front of us. Without this every user looks like one IP.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: "10kb" }));
app.use(requestLogger);

// Registered before the rate limiter so hosting health checks are never blocked.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/matches", historyRoutes);
app.use("/api/rooms", roomRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
