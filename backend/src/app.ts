// backend/src/app.ts

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dataRoutes from "./routes/Data.routes.js";
import savedLayoutsRoutes from "./routes/SavedLayouts.routes.js";

const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));


app.use("/api/data", dataRoutes);
app.use("/api/savedlayouts", savedLayoutsRoutes);


app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});


app.get("/", (req, res) => {
  res.json({
    message: "Dynamic Dashboard API",
    version: "1.0.0",
    endpoints: {
      data: "/api/data",
      layouts: "/api/savedlayouts",
      health: "/health",
    },
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  });
});


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(" [Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

export default app;