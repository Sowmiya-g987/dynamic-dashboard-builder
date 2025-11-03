import { Request, Response } from "express";
export declare class DataController {
    /**
     * 📊 POST /api/data/fetch
     * Fetch data for multiple widgets based on their configurations
     * Frontend sends: { widgets: [ { id, type, data: { schemaName, xField, yField, branch } } ] }
     * Backend returns: [ { widgetId, data: [...] } ]
     */
    static fetchWidgetData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 📋 GET /api/data/schemas
     * Get list of available database collections
     */
    static getAvailableSchemas(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 🔍 GET /api/data/schemas/:schemaName/fields
     * Get available fields for a specific collection
     */
    static getSchemaFields(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 🧪 GET /api/data/test
     * Test endpoint to verify backend is working
     */
    static testEndpoint(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=DataController.d.ts.map