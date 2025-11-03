// backend/src/routes/SavedLayouts.routes.ts
import { Router } from "express";
import { SavedLayoutsController } from "../controllers/SavedLayoutsController.js";
const router = Router();
/**
 * 📋 GET /api/savedlayouts
 * Get all saved layouts (list only)
 */
router.get("/", SavedLayoutsController.getAllLayouts);
/**
 * 📂 GET /api/savedlayouts/:id
 * Get specific layout with LIVE data
 */
router.get("/:id", SavedLayoutsController.getLayoutById);
/**
 * 💾 POST /api/savedlayouts
 * Save new layout
 */
router.post("/", SavedLayoutsController.saveLayout);
/**
 * 🗑️ DELETE /api/savedlayouts/:id
 * Delete a saved layout
 */
router.delete("/:id", SavedLayoutsController.deleteLayout);
export default router;
//# sourceMappingURL=SavedLayouts.routes.js.map