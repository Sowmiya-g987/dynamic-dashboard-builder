
// ============================================================================
// FILE: backend/src/app.ts
// ============================================================================

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dataRoutes from "./routes/Data.routes.js";
import savedLayoutsRoutes from "./routes/SavedLayouts.routes.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Routes
app.use("/api/data", dataRoutes);
app.use("/api/savedlayouts", savedLayoutsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Multi-Database Dynamic Dashboard API",
    version: "2.0.0",
    endpoints: {
      data: "/api/data",
      databases: "/api/data/databases",
      stream: "/api/data/stream-stats",
      health: "/health",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ [Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

export default app;