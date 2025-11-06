// backend/src/services/QueryService.ts

import { DatabaseManager } from "./DatabaseManager.js";
import type { WidgetConfig, QueryResult } from "../types/Types.js";

export class QueryService {
  static async executeCustomQuery(widget: WidgetConfig): Promise<any[]> {
    try {
      const { database, collection, query = {}, projection = {} } = widget.data;

      // Skip if no database or collection configured
      if (!database || !collection) {
        console.log(`⏭️ [QueryService] Skipping widget ${widget.id} - no database/collection configured`);
        return [];
      }

      console.log(`🔍 [QueryService] Executing query for widget ${widget.id}:`, {
        database,
        collection,
        query,
        projection
      });

      const db = DatabaseManager.getDatabase(database);
      if (!db) {
        throw new Error(`Database not found: ${database}`);
      }

      const col = db.collection(collection);
      const results = await col.find(query, { projection }).toArray();

      console.log(`✅ [QueryService] Query successful: ${results.length} records for widget ${widget.id}`);
      return results;
    } catch (error: any) {
      console.error(`❌ [QueryService] Query failed for widget ${widget.id}:`, error);
      throw error;
    }
  }

  static async executeMultipleQueries(widgets: WidgetConfig[]): Promise<QueryResult[]> {
    // Filter widgets that have database and collection configured
    const validWidgets = widgets.filter(w => w.data.database && w.data.collection);
    
    console.log(`🔄 [QueryService] Executing ${validWidgets.length} queries (${widgets.length - validWidgets.length} skipped)`);
    
    const queryPromises = validWidgets.map(async (widget) => {
      try {
        const data = await this.executeCustomQuery(widget);

        return {
          widgetId: widget.id,
          data,
          error: null,
        };
      } catch (error: any) {
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

  static async getAvailableDatabases(): Promise<string[]> {
    return DatabaseManager.getAllDatabases();
  }

  static async getSchemaCollections(database: string): Promise<string[]> {
    return DatabaseManager.getCollections(database);
  }
}