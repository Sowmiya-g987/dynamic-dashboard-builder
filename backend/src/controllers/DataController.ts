// backend/src/controllers/DataController.ts

import { Request, Response } from "express";
import { QueryService } from "../services/QueryService.js";
import type { FetchDataRequest } from "../types/Types.js";

export class DataController {
  
  static async fetchWidgetData(req: Request, res: Response) {
    try {
      const { widgets }: FetchDataRequest = req.body;

      console.log(" [DataController] Fetch request received");
      console.log(`[DataController] Processing ${widgets?.length || 0} widgets`);

      
      if (!widgets || !Array.isArray(widgets) || widgets.length === 0) {
        return res.status(400).json({
          error: "Invalid request: widgets array is required",
        });
      }

     
      const results = await QueryService.executeMultipleQueries(widgets);

      console.log(" [DataController] All data fetched successfully");

 
      return res.status(200).json({
        success: true,
        results,
      });
    } 
    catch (error: any) {
      console.error(" [DataController] Error fetching widget data:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch widget data",
      });
    }
  }

 
  static async getAvailableSchemas(req: Request, res: Response) {
    try {
      console.log(" [DataController] Fetching available schemas");

      const schemas = await QueryService.getAvailableSchemas();

      console.log(` [DataController] Found ${schemas.length} schemas`);

      return res.status(200).json({
        success: true,
        schemas,
      });
    } catch (error: any) {
      console.error(" [DataController] Error fetching schemas:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch schemas",
      });
    }
  }


  static async getSchemaFields(req: Request, res: Response) {
    try {
      const { schemaName } = req.params;

      console.log(` [DataController] Fetching fields for schema: ${schemaName}`);

      const fields = await QueryService.getSchemaFields(schemaName);

      console.log(` [DataController] Found ${fields.length} fields`);

      return res.status(200).json({
        success: true,
        schema: schemaName,
        fields,
      });
    } catch (error: any) {
      console.error(" [DataController] Error fetching schema fields:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch schema fields",
      });
    }
  }

 
  static async testEndpoint(req: Request, res: Response) {
    try {
      console.log(" [DataController] Test endpoint called");

      return res.status(200).json({
        success: true,
        message: "Data controller is working!",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}