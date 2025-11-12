// backend/src/services/QueryService.ts

import { DatabaseManager } from "./DatabaseManager.js";
import { QueryTypes } from "sequelize";
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

      // Build SELECT clause from projection
      let selectClause = "*";
      if (projection && Object.keys(projection).length > 0) {
        const fields = Object.keys(projection).filter(key => projection[key] === 1);
        if (fields.length > 0) {
          selectClause = fields.map(f => `"${f}"`).join(", ");
        }
      }

      // Build WHERE clause from query
      let whereClause = "";
      const replacements: any = {};
      
      if (query && Object.keys(query).length > 0) {
        const conditions: string[] = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(query)) {
          if (typeof value === "object" && value !== null) {
            // Handle operators like $gt, $lt, $gte, $lte, $ne, $in
            for (const [op, opValue] of Object.entries(value)) {
              const paramName = `param${paramIndex++}`;
              switch (op) {
                case "$gt":
                  conditions.push(`"${key}" > :${paramName}`);
                  replacements[paramName] = opValue;
                  break;
                case "$gte":
                  conditions.push(`"${key}" >= :${paramName}`);
                  replacements[paramName] = opValue;
                  break;
                case "$lt":
                  conditions.push(`"${key}" < :${paramName}`);
                  replacements[paramName] = opValue;
                  break;
                case "$lte":
                  conditions.push(`"${key}" <= :${paramName}`);
                  replacements[paramName] = opValue;
                  break;
                case "$ne":
                  conditions.push(`"${key}" != :${paramName}`);
                  replacements[paramName] = opValue;
                  break;
                case "$in":
                  conditions.push(`"${key}" = ANY(:${paramName})`);
                  replacements[paramName] = Array.isArray(opValue) ? opValue : [opValue];
                  break;
              }
            }
          } else {
            const paramName = `param${paramIndex++}`;
            conditions.push(`"${key}" = :${paramName}`);
            replacements[paramName] = value;
          }
        }
        
        if (conditions.length > 0) {
          whereClause = `WHERE ${conditions.join(" AND ")}`;
        }
      }

      const sql = `SELECT ${selectClause} FROM "${collection}" ${whereClause}`;
      
      console.log(`📝 [QueryService] SQL:`, sql);
      console.log(`📝 [QueryService] Replacements:`, replacements);

      const results = await db.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

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