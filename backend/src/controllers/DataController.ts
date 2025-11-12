
import { Request, Response } from "express";
import { QueryService } from "../services/QueryService.js";
import { SSEManager } from "../services/SSEManager.js";
import type { FetchDataRequest, WidgetConfig } from "../types/Types.js";

export class DataController {
  static async fetchWidgetData(req: Request, res: Response) {
    try {
      const { widgets }: FetchDataRequest = req.body;

      console.log("📥 [DataController] Fetch request received");
      console.log(`📊 [DataController] Processing ${widgets?.length || 0} widgets`);

      if (!widgets || !Array.isArray(widgets) || widgets.length === 0) {
        return res.status(400).json({
          error: "Invalid request: widgets array is required",
        });
      }

      const results = await QueryService.executeMultipleQueries(widgets);

      console.log("✅ [DataController] All data fetched successfully");

      return res.status(200).json({
        success: true,
        results,
      });
    } catch (error: any) {
      console.error("❌ [DataController] Error fetching widget data:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch widget data",
      });
    }
  }

  static async getAvailableDatabases(req: Request, res: Response) {
    try {
      console.log("📚 [DataController] Fetching available databases");
      const databases = await QueryService.getAvailableDatabases();

      console.log(`✅ [DataController] Found ${databases.length} databases`);
      return res.status(200).json({ success: true, databases });
    } catch (error: any) {
      console.error("❌ [DataController] Error fetching databases:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch databases",
      });
    }
  }

  static async getSchemaCollections(req: Request, res: Response) {
    try {
      const { database } = req.params;

      console.log(`📚 [DataController] Fetching collections for database: ${database}`);
      const collections = await QueryService.getSchemaCollections(database);

      console.log(`✅ [DataController] Found ${collections.length} collections`);
      return res.status(200).json({
        success: true,
        database,
        collections,
      });
    } catch (error: any) {
      console.error("❌ [DataController] Error fetching collections:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch collections",
      });
    }
  }

  static async streamStats(req: Request, res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    console.log("📡 [SSE] Client connected for real-time updates");

    try {
      // Parse widgets from query parameter
      const widgetsParam = req.query.widgets as string;
      let widgets: WidgetConfig[] = [];

      if (widgetsParam) {
        widgets = JSON.parse(decodeURIComponent(widgetsParam));
      }

      console.log(`📡 [SSE] Watching ${widgets.length} widgets`);

   
      SSEManager.addClient(res, widgets);

      
      await SSEManager.initializeWatchers(widgets);

    
      res.write(`data: ${JSON.stringify({ type: "connected", message: "SSE connection established" })}\n\n`);

    } catch (error: any) {
      console.error("❌ [SSE] Error setting up stream:", error);
      res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
    }

    req.on("close", () => {
      console.log("📡 [SSE] Client disconnected");
      SSEManager.removeClient(res);
    });
  }

  static async testEndpoint(req: Request, res: Response) {
    try {
      console.log("✅ [DataController] Test endpoint called");
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