import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./router";
import { validateEnvironment, logEnvironmentStatus } from "./utils/env";

const app = express();
const PORT = process.env.PORT || 4000;

// Validate environment on startup
logEnvironmentStatus();
if (!validateEnvironment() && process.env.NODE_ENV === "production") {
  console.error("❌ Environment validation failed in production mode");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Health check with detailed status
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    services: {
      ai: process.env.AUTHORIZATION_TOKEN ? "configured" : "not configured",
    },
  });
});

// tRPC endpoint with enhanced error logging
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    onError: ({ error, path }) => {
      console.error(`tRPC Error on ${path}:`, error.message);
      if (process.env.NODE_ENV === "development") {
        console.error("Stack:", error.stack);
      }
    },
  })
);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const server = app
  .listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`tRPC endpoint: http://localhost:${PORT}/trpc`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully`);
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
