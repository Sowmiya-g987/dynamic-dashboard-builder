
import { Router } from "express";
import { SavedLayoutsController } from "../controllers/SavedLayoutsController.js";

const router = Router();

// GET /api/savedlayouts - Get all saved layouts
router.get("/", SavedLayoutsController.getAllLayouts);

// GET /api/savedlayouts/:id - Get layout by ID
router.get("/:id", SavedLayoutsController.getLayoutById);

// POST /api/savedlayouts - Save new layout
router.post("/", SavedLayoutsController.saveLayout);

// PUT /api/savedlayouts/:id - Update layout widgets
router.put("/:id", SavedLayoutsController.updateLayout);

// PATCH /api/savedlayouts/:id/name - Update layout name
router.patch("/:id/name", SavedLayoutsController.updateLayoutName);

// DELETE /api/savedlayouts/:id - Delete layout
router.delete("/:id", SavedLayoutsController.deleteLayout);

export default router;