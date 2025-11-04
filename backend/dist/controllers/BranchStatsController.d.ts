import type { Request, Response } from "express";
/**
 * 🎯 Dynamic Schema Query Handler (always based on xField and yField)
 * Fetches data from any collection using only xField & yField
 */
export declare function getDynamicData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * 🔄 Legacy endpoints (kept for backward compatibility)
 */
export declare function getAllBranches(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getAllEmployeeCounts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getAllInternCounts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBranchStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function filterByBranchAndType(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=BranchStatsController.d.ts.map