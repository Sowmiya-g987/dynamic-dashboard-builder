// backend/src/routes/BranchStats.routes.ts
import express from "express";
import {
  getDynamicData,
  getAllBranches,
  getAllEmployeeCounts,
  getAllInternCounts,
  getBranchStats,
  filterByBranchAndType,
} from "../controllers/BranchStatsController.js";

const router = express.Router();


router.get("/query", getDynamicData);


router.get("/all", getAllBranches);
router.get("/employee", getAllEmployeeCounts);
router.get("/intern", getAllInternCounts);
router.get("/stats/:branch", getBranchStats);
router.get("/filter", filterByBranchAndType);

export default router;