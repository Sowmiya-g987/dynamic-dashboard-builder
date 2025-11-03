// backend/src/routes/Data.routes.ts
import { Router } from "express";
import { DataController } from "../controllers/DataController.js";
const router = Router();
/**
 * 📊 POST /api/data/fetch
 * Fetch data for multiple widgets based on their configurations
 * Body: { widgets: [ { id, type, data: { schemaName, xField, yField, branch } } ] }
 */
router.post("/fetch", DataController.fetchWidgetData);
/**
 * 📋 GET /api/data/schemas
 * Get list of available database collections
 */
router.get("/schemas", DataController.getAvailableSchemas);
/**
 * 🔍 GET /api/data/schemas/:schemaName/fields
 * Get available fields for a specific collection
 */
router.get("/schemas/:schemaName/fields", DataController.getSchemaFields);
/**
 * 🧪 GET /api/data/test
 * Test endpoint
 */
router.get("/test", DataController.testEndpoint);
export default router;
//# sourceMappingURL=Data.routes.js.map