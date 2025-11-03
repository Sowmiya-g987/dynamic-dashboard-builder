// backend/src/services/QueryService.ts

import mongoose from "mongoose";
import type { QueryParams } from "../types/Types";

export class QueryService {

  static async executeQuery(params: QueryParams): Promise<any[]> {
    try {
      const { schemaName, xField, yField, branch } = params;

      console.log(" [QueryService] Executing query:", params);

  
      if (!schemaName || !xField || !yField) {
        throw new Error("Missing required query parameters");
      }

     
      const collection = mongoose.connection.db.collection(schemaName);

      
      const projection: any= { _id: 0 };
      projection[xField] = 1;
      projection[yField] = 1;

     
      const filter: any = {};
      if (branch && branch !== "All") {
        filter[xField] = branch;
      }

      console.log("[QueryService] Filter:", JSON.stringify(filter));
      console.log("[QueryService] Projection:", JSON.stringify(projection));

   
      const results = await collection
        .find(filter, { projection })
        .toArray();

      console.log(`[QueryService] Query successful: ${results.length} records`);

      return results;
    } catch (error) {
      console.error(" [QueryService] Query failed:", error);
      throw error;
    }
  }

  static async executeMultipleQueries(widgets: any[]): Promise<any[]> {
    console.log(` [QueryService] Executing ${widgets.length} queries in parallel`);

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
      } catch (error: any) {
        console.error(` [QueryService] Error for widget ${widget.id}:`, error);
        return {
          widgetId: widget.id,
          data: [],
          error: error.message || "Query failed",
        };
      }
    });

    const results = await Promise.all(queryPromises);
    console.log(" [QueryService] All queries completed");
    return results;
  }


  static async getAvailableSchemas(): Promise<string[]> {
    try {
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();

      return collections.map((col) => col.name);
    } catch (error) {
      console.error(" [QueryService] Error fetching schemas:", error);
      throw error;
    }
  }


  static async getSchemaFields(schemaName: string): Promise<string[]> {
    try {
      const collection = mongoose.connection.db.collection(schemaName);
      const sample = await collection.findOne({});

      if (!sample) {
        return [];
      }

     
      return Object.keys(sample).filter((key) => key !== "_id");
    } catch (error) {
      console.error(" [QueryService] Error fetching schema fields:", error);
      throw error;
    }
  }
}