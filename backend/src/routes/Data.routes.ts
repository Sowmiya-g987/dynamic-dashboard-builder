// backend/src/routes/Data.routes.ts

import { Router } from "express";
import { DataController } from "../controllers/DataController.js";

const router = Router();


router.post("/fetch", DataController.fetchWidgetData);


router.get("/schemas", DataController.getAvailableSchemas);


router.get("/schemas/:schemaName/fields", DataController.getSchemaFields);

router.get("/test", DataController.testEndpoint);

export default router;