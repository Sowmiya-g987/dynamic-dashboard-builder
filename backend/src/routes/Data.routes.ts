// ============================================================================
// FILE: backend/src/routes/Data.routes.ts
// ============================================================================

import { Router } from "express";
import { DataController } from "../controllers/DataController.js";

const router = Router();

// POST /api/data/fetch - Fetch widget data
router.post("/fetch", DataController.fetchWidgetData);

// GET /api/data/databases - Get available databases
router.get("/databases", DataController.getAvailableDatabases);

// GET /api/data/databases/:database/collections - Get collections for a database
router.get("/databases/:database/collections", DataController.getSchemaCollections);

// GET /api/data/stream-stats - SSE endpoint for real-time updates
router.get("/stream-stats", DataController.streamStats);

// GET /api/data/test - Test endpoint
router.get("/test", DataController.testEndpoint);

export default router;