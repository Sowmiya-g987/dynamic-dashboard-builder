import { Request, Response } from "express";
export declare class SavedLayoutsController {
    /**
     * 📋 GET /api/savedlayouts
     * Get all saved layouts (list view only - no data)
     */
    static getAllLayouts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 📂 GET /api/savedlayouts/:id
     * Get specific layout with LIVE data for all widgets
     */
    static getLayoutById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 💾 POST /api/savedlayouts
     * Save new layout (saves configuration only, not data)
     */
    static saveLayout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 🗑️ DELETE /api/savedlayouts/:id
     * Delete a saved layout
     */
    static deleteLayout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=SavedLayoutsController.d.ts.map