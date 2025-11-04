// backend/src/routes/Data.routes.ts

import { Router } from "express";
import { DataController,streamStats } from "../controllers/DataController.js";

const router = Router();

router.post("/fetch", DataController.fetchWidgetData);
router.get("/stream-stats", streamStats);

router.get("/schemas", DataController.getAvailableSchemas);

router.get("/schemas/:schemaName/fields", DataController.getSchemaFields);

router.get("/test", DataController.testEndpoint);

export default router;
