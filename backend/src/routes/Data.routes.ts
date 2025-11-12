
import { Router } from "express";
import { DataController } from "../controllers/DataController.js";

const router = Router();


router.post("/fetch", DataController.fetchWidgetData);


router.get("/databases", DataController.getAvailableDatabases);


router.get("/databases/:database/collections", DataController.getSchemaCollections);


router.get("/stream-stats", DataController.streamStats);


router.get("/test", DataController.testEndpoint);

export default router;