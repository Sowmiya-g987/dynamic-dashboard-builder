// backend/src/controllers/DataController.ts
import { QueryService } from "../services/QueryService.js";
export class DataController {
    /**
     * 📊 POST /api/data/fetch
     * Fetch data for multiple widgets based on their configurations
     * Frontend sends: { widgets: [ { id, type, data: { schemaName, xField, yField, branch } } ] }
     * Backend returns: [ { widgetId, data: [...] } ]
     */
    static async fetchWidgetData(req, res) {
        try {
            const { widgets } = req.body;
            console.log("📥 [DataController] Fetch request received");
            console.log(`📊 [DataController] Processing ${widgets?.length || 0} widgets`);
            // Validate request
            if (!widgets || !Array.isArray(widgets) || widgets.length === 0) {
                return res.status(400).json({
                    error: "Invalid request: widgets array is required",
                });
            }
            // Execute all queries in parallel
            const results = await QueryService.executeMultipleQueries(widgets);
            console.log("✅ [DataController] All data fetched successfully");
            // Return results
            return res.status(200).json({
                success: true,
                results,
            });
        }
        catch (error) {
            console.error("❌ [DataController] Error fetching widget data:", error);
            return res.status(500).json({
                success: false,
                error: error.message || "Failed to fetch widget data",
            });
        }
    }
    /**
     * 📋 GET /api/data/schemas
     * Get list of available database collections
     */
    static async getAvailableSchemas(req, res) {
        try {
            console.log("📋 [DataController] Fetching available schemas");
            const schemas = await QueryService.getAvailableSchemas();
            console.log(`✅ [DataController] Found ${schemas.length} schemas`);
            return res.status(200).json({
                success: true,
                schemas,
            });
        }
        catch (error) {
            console.error("❌ [DataController] Error fetching schemas:", error);
            return res.status(500).json({
                success: false,
                error: error.message || "Failed to fetch schemas",
            });
        }
    }
    /**
     * 🔍 GET /api/data/schemas/:schemaName/fields
     * Get available fields for a specific collection
     */
    static async getSchemaFields(req, res) {
        try {
            const { schemaName } = req.params;
            console.log(`🔍 [DataController] Fetching fields for schema: ${schemaName}`);
            const fields = await QueryService.getSchemaFields(schemaName);
            console.log(`✅ [DataController] Found ${fields.length} fields`);
            return res.status(200).json({
                success: true,
                schema: schemaName,
                fields,
            });
        }
        catch (error) {
            console.error("❌ [DataController] Error fetching schema fields:", error);
            return res.status(500).json({
                success: false,
                error: error.message || "Failed to fetch schema fields",
            });
        }
    }
    /**
     * 🧪 GET /api/data/test
     * Test endpoint to verify backend is working
     */
    static async testEndpoint(req, res) {
        try {
            console.log("🧪 [DataController] Test endpoint called");
            return res.status(200).json({
                success: true,
                message: "Data controller is working!",
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
//# sourceMappingURL=DataController.js.map