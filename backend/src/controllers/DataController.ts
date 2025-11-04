import { Request, Response } from "express";
import { QueryService } from "../services/QueryService.js";
import type { FetchDataRequest } from "../types/Types.js";
import mongoose from "mongoose";
import EventEmitter from "events";

const dbChangeEmitter = new EventEmitter();
const clientWidgets = new Map<Response, string[]>();


export const streamStats = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  console.log(" [SSE] Client connected for stats");

  const widgetIds = req.query.widgets
    ? String(req.query.widgets)
        .split(",")
        .map((id) => id.trim())
    : [];

  console.log("[SSE] Watching widgets:", widgetIds);

  clientWidgets.set(res, widgetIds);
  const onUpdate = (payload: any) => {
    if (!payload?.results) return;

    console.log("🔵 [SSE] Sending update to client:", payload.results);

    const eventData = JSON.stringify({ success: true, results: payload.results });
    res.write(`data: ${eventData}\n\n`);
  };


  dbChangeEmitter.on("stats-updated", onUpdate);

  req.on("close", () => {
    console.log("[SSE] Client disconnected");
    clientWidgets.delete(res);
    dbChangeEmitter.removeListener("stats-updated", onUpdate);
  });
};


export async function watchBranchStats() {
  try {
    await mongoose.connection.asPromise();
    const db = mongoose.connection.db!;
    const collection = db.collection("branchstats");

    console.log(" Starting MongoDB Change Stream on branchstats...");

    const changeStream = collection.watch([], { fullDocument: "updateLookup" });

    changeStream.on("change", async (change) => {
      console.log("[MongoDB] Change detected:", change);
      const allData = await collection.find({}).toArray();
      for (const [res, widgetIds] of clientWidgets.entries()) {
        if (!widgetIds.length) continue;

        const results = widgetIds.map((id) => ({
          widgetId: id,
          data: allData,
          error: null,
        }));

        const payload = { success: true, results };

        console.log("📡 Emitting stats-updated for widgets:", widgetIds);
        dbChangeEmitter.emit("stats-updated", payload);
      }
    });

    changeStream.on("error", (err) => {
      console.error("⚠️ Change stream error:", err.message);
      changeStream.close();
    });

    console.log("Watching branchstats collection using Change Stream.");
  } catch (err) {
    console.error(" Error watching branchstats:", err);
  }
}
export class DataController {
  static async fetchWidgetData(req: Request, res: Response) {
    try {
      const { widgets }: FetchDataRequest = req.body;

      console.log(" [DataController] Fetch request received");
      console.log(
        `[DataController] Processing ${widgets?.length || 0} widgets`
      );

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
    } catch (error: any) {
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
      return res.status(200).json({ success: true, schemas });
    } catch (error: any) {
      console.error(" [DataController] Error fetching schemas:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch schemas",
      });
    }
  }

  // Get fields for a specific schema
  static async getSchemaFields(req: Request, res: Response) {
    try {
      const { schemaName } = req.params;

      console.log(
        ` [DataController] Fetching fields for schema: ${schemaName}`
      );
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

  // Simple test endpoint
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
