
// ============================================================================
// FILE: backend/src/routes/Data.routes.ts
// ============================================================================

import { Router } from "express";
import { DataController } from "../controllers/DataController.js";

const router = Router();

// Fetch widget data
router.post("/fetch", DataController.fetchWidgetData);

// SSE endpoint for real-time updates
router.get("/stream-stats", DataController.streamStats);

// Get available databases
router.get("/databases", DataController.getAvailableDatabases);

// Get collections for a specific database
router.get("/databases/:database/collections", DataController.getSchemaCollections);

// Test endpoint
router.get("/test", DataController.testEndpoint);

export default router;
