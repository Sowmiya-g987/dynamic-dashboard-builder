import type { QueryParams } from "../types/Types";
export declare class QueryService {
    /**
     * 🎯 Execute dynamic MongoDB query based on widget configuration
     * @param params - Widget query parameters (schemaName, xField, yField, branch)
     * @returns Array of query results
     */
    static executeQuery(params: QueryParams): Promise<any[]>;
    /**
     * 🔄 Execute queries for multiple widgets in parallel
     * @param widgets - Array of widget configurations
     * @returns Array of results for each widget
     */
    static executeMultipleQueries(widgets: any[]): Promise<any[]>;
    /**
     * 📊 Get available collections in database
     */
    static getAvailableSchemas(): Promise<string[]>;
    /**
     * 🔍 Get fields from a specific collection
     */
    static getSchemaFields(schemaName: string): Promise<string[]>;
}
//# sourceMappingURL=QueryService.d.ts.map