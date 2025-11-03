// backend/src/services/QueryService.ts
import mongoose from "mongoose";
export class QueryService {
    /**
     * 🎯 Execute dynamic MongoDB query based on widget configuration
     * @param params - Widget query parameters (schemaName, xField, yField, branch)
     * @returns Array of query results
     */
    static async executeQuery(params) {
        try {
            const { schemaName, xField, yField, branch } = params;
            console.log("🔍 [QueryService] Executing query:", params);
            // Validate required parameters
            if (!schemaName || !xField || !yField) {
                throw new Error("Missing required query parameters");
            }
            // Get MongoDB collection dynamically
            const collection = mongoose.connection.db.collection(schemaName);
            // Build projection (which fields to return)
            const projection = { _id: 0 };
            projection[xField] = 1;
            projection[yField] = 1;
            // Build filter (optional branch filter)
            const filter = {};
            if (branch && branch !== "All") {
                filter[xField] = branch;
            }
            console.log("📋 [QueryService] Filter:", JSON.stringify(filter));
            console.log("📋 [QueryService] Projection:", JSON.stringify(projection));
            // Execute MongoDB query
            const results = await collection
                .find(filter, { projection })
                .toArray();
            console.log(`✅ [QueryService] Query successful: ${results.length} records`);
            return results;
        }
        catch (error) {
            console.error("❌ [QueryService] Query failed:", error);
            throw error;
        }
    }
    /**
     * 🔄 Execute queries for multiple widgets in parallel
     * @param widgets - Array of widget configurations
     * @returns Array of results for each widget
     */
    static async executeMultipleQueries(widgets) {
        console.log(`🚀 [QueryService] Executing ${widgets.length} queries in parallel`);
        const queryPromises = widgets.map(async (widget) => {
            try {
                const data = await this.executeQuery({
                    schemaName: widget.data.schemaName,
                    xField: widget.data.xField,
                    yField: widget.data.yField,
                    branch: widget.data.branch,
                });
                return {
                    widgetId: widget.id,
                    data,
                    error: null,
                };
            }
            catch (error) {
                console.error(`❌ [QueryService] Error for widget ${widget.id}:`, error);
                return {
                    widgetId: widget.id,
                    data: [],
                    error: error.message || "Query failed",
                };
            }
        });
        const results = await Promise.all(queryPromises);
        console.log("✅ [QueryService] All queries completed");
        return results;
    }
    /**
     * 📊 Get available collections in database
     */
    static async getAvailableSchemas() {
        try {
            const collections = await mongoose.connection.db
                .listCollections()
                .toArray();
            return collections.map((col) => col.name);
        }
        catch (error) {
            console.error("❌ [QueryService] Error fetching schemas:", error);
            throw error;
        }
    }
    /**
     * 🔍 Get fields from a specific collection
     */
    static async getSchemaFields(schemaName) {
        try {
            const collection = mongoose.connection.db.collection(schemaName);
            const sample = await collection.findOne({});
            if (!sample) {
                return [];
            }
            // Get all keys except _id
            return Object.keys(sample).filter((key) => key !== "_id");
        }
        catch (error) {
            console.error("❌ [QueryService] Error fetching schema fields:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=QueryService.js.map