// backend/src/routes/SavedLayouts.routes.ts

import { Router } from "express";
import { SavedLayoutsController } from "../controllers/SavedLayoutsController.js";

const router = Router();

router.get("/", SavedLayoutsController.getAllLayouts);

router.get("/:id", SavedLayoutsController.getLayoutById);

router.post("/", SavedLayoutsController.saveLayout);

router.put("/:id", SavedLayoutsController.updateLayout);

router.patch("/:id", SavedLayoutsController.updateLayoutName);

router.delete("/:id", SavedLayoutsController.deleteLayout);

export default router;
