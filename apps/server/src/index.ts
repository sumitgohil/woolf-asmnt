import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./router";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// tRPC endpoint
app.use("/trpc", trpcExpress.createExpressMiddleware({
  router: appRouter,
  onError: ({ error, path }) => {
    console.error(`tRPC Error on ${path}:`, error.message);
  },
}));

// Error handlers
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully');
  process.exit(0);
});
