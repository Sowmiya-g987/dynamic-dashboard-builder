// ============================================================================
// FILE: backend/src/routes/SavedLayouts.routes.ts
// ============================================================================

import { Router } from "express";
import { SavedLayoutsController } from "../controllers/SavedLayoutsController.js";

const router = Router();

// Get all layouts
router.get("/", SavedLayoutsController.getAllLayouts);

// Get layout by ID
router.get("/:id", SavedLayoutsController.getLayoutById);

// Create new layout (NO ID in URL)
router.post("/", SavedLayoutsController.saveLayout);

// Update layout widgets
router.put("/:id", SavedLayoutsController.updateLayout);

// Update layout name only
router.patch("/:id/name", SavedLayoutsController.updateLayoutName);

// Delete layout
router.delete("/:id", SavedLayoutsController.deleteLayout);

export default router;
