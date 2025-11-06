// backend/src/services/SSEManager.ts

import { Response } from "express";
import { 
  ChangeStream, 
  ChangeStreamDocument, 
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
  ChangeStreamReplaceDocument,
  ChangeStreamDeleteDocument,
  Document 
} from "mongodb";
import { DatabaseManager } from "./DatabaseManager.js";
import type { WidgetConfig } from "../types/Types.js";

interface SSEClient {
  response: Response;
  widgets: WidgetConfig[];
}

export class SSEManager {
  private static clients: Set<SSEClient> = new Set();
  private static changeStreams: Map<string, ChangeStream> = new Map();

  static addClient(res: Response, widgets: WidgetConfig[]): void {
    const client: SSEClient = { response: res, widgets };
    this.clients.add(client);
    console.log(`[SSE] Client connected. Total clients: ${this.clients.size}`);
  }

  static removeClient(res: Response): void {
    for (const client of this.clients) {
      if (client.response === res) {
        this.clients.delete(client);
        console.log(` [SSE] Client disconnected. Total clients: ${this.clients.size}`);
        break;
      }
    }
  }

  static async initializeWatchers(widgets: WidgetConfig[]): Promise<void> {
      // Filter widgets that have database and collection configured
    const validWidgets = widgets.filter(w => w.data.database && w.data.collection);
    
    // Group widgets by database and collection
    const watchTargets = new Map<string, Set<string>>();

    for (const widget of validWidgets) {
      const { database, collection } = widget.data;
      const key = `${database}:${collection}`;
      
      if (!this.changeStreams.has(key)) {
        if (!watchTargets.has(database)) {
          watchTargets.set(database, new Set());
        }
        watchTargets.get(database)!.add(collection);
      }
    }

    // Start watchers for new database/collection combinations
    for (const [database, collections] of watchTargets) {
      for (const collection of collections) {
        await this.startWatcher(database, collection);
      }
    }
  }

  private static async startWatcher(database: string, collection: string): Promise<void> {
    const key = `${database}:${collection}`;
    
    if (this.changeStreams.has(key)) {
      console.log(`⏭️ [SSE] Watcher already exists for ${key}`);
      return;
    }

    try {
      const db = DatabaseManager.getDatabase(database);
      if (!db) {
        console.error(`❌ [SSE] Database not found: ${database}`);
        return;
      }

      const col = db.collection(collection);
      const changeStream = col.watch([], { fullDocument: "updateLookup" });

      changeStream.on("change", async (change: ChangeStreamDocument<Document>) => {
        console.log(`🔔 [SSE] Change detected in ${key}:`, change.operationType);



        console.log("📝 [SSE] FULL CHANGE OBJECT:", JSON.stringify(change, null, 2));

if (change.operationType === "update") {
  console.log("🟡 [SSE] Updated fields:", change.updateDescription?.updatedFields);
  console.log("🟡 [SSE] Removed fields:", change.updateDescription?.removedFields);
}

if (change.operationType === "insert") {
  console.log("🟢 [SSE] Inserted document:", change.fullDocument);
}

if (change.operationType === "replace") {
  console.log("🔵 [SSE] Replaced document:", change.fullDocument);
}

if (change.operationType === "delete") {
  console.log("🔴 [SSE] Deleted document key:", change.documentKey);
}


        // Handle different change types
        if (this.isInsertChange(change) || this.isUpdateChange(change) || this.isReplaceChange(change)) {
          if (change.fullDocument) {
            await this.broadcastChange(database, collection, change.fullDocument);
          }
        } else if (this.isDeleteChange(change)) {
          await this.broadcastDelete(database, collection, change.documentKey);
        }
      });

      changeStream.on("error", (error) => {
        console.error(`❌ [SSE] Change stream error for ${key}:`, error);
        this.changeStreams.delete(key);
      });

      this.changeStreams.set(key, changeStream);
      console.log(`✅ [SSE] Started watcher for ${key}`);
    } catch (error) {
      console.error(`❌ [SSE] Failed to start watcher for ${key}:`, error);
    }
  }

  private static isInsertChange(change: ChangeStreamDocument): change is ChangeStreamInsertDocument {
    return change.operationType === "insert";
  }

  private static isUpdateChange(change: ChangeStreamDocument): change is ChangeStreamUpdateDocument {
    return change.operationType === "update";
  }

  private static isReplaceChange(change: ChangeStreamDocument): change is ChangeStreamReplaceDocument {
    return change.operationType === "replace";
  }

  private static isDeleteChange(change: ChangeStreamDocument): change is ChangeStreamDeleteDocument {
    return change.operationType === "delete";
  }

  private static async broadcastChange(
    database: string,
    collection: string,
    document: Document
  ): Promise<void> {
    for (const client of this.clients) {
      try {
        const matchingWidgets = client.widgets.filter(
          w => w.data.database === database && w.data.collection === collection
        );

        for (const widget of matchingWidgets) {
          const matches = this.documentMatchesQuery(document, widget.data.query || {});
          
          if (matches) {
            const db = DatabaseManager.getDatabase(database);
            if (!db) continue;

            const col = db.collection(collection);
            const freshData = await col
              .find(widget.data.query || {}, { projection: widget.data.projection || {} })
              .toArray();

            const payload = {
              widgetId: widget.id,
              data: freshData,
              timestamp: new Date().toISOString()
            };

            client.response.write(`data: ${JSON.stringify(payload)}\n\n`);
            console.log(`📤 [SSE] Sent update for widget ${widget.id}`);
          }
        }
      } catch (error) {
        console.error(`❌ [SSE] Error broadcasting to client:`, error);
        this.removeClient(client.response);
      }
    }
  }

  private static async broadcastDelete(
    database: string,
    collection: string,
    documentKey: any
  ): Promise<void> {
    console.log(`🗑️ [SSE] Document deleted in ${database}:${collection}`);
    
    for (const client of this.clients) {
      try {
        const matchingWidgets = client.widgets.filter(
          w => w.data.database === database && w.data.collection === collection
        );

        for (const widget of matchingWidgets) {
          const db = DatabaseManager.getDatabase(database);
          if (!db) continue;

          const col = db.collection(collection);
          const freshData = await col
            .find(widget.data.query || {}, { projection: widget.data.projection || {} })
            .toArray();

          const payload = {
            widgetId: widget.id,
            data: freshData,
            timestamp: new Date().toISOString()
          };

          client.response.write(`data: ${JSON.stringify(payload)}\n\n`);
          console.log(`📤 [SSE] Sent delete update for widget ${widget.id}`);
        }
      } catch (error) {
        console.error(`❌ [SSE] Error broadcasting delete:`, error);
        this.removeClient(client.response);
      }
    }
  }

  private static documentMatchesQuery(document: Document, query: any): boolean {
    if (!query || Object.keys(query).length === 0) return true;

    for (const [key, value] of Object.entries(query)) {
      if (document[key] !== value) {
        return false;
      }
    }

    return true;
  }

  static closeAll(): void {
    console.log("🔌 [SSE] Closing all change streams...");
    
    for (const [key, stream] of this.changeStreams) {
      try {
        stream.close();
        console.log(`✅ [SSE] Closed stream: ${key}`);
      } catch (error) {
        console.error(`❌ [SSE] Error closing stream ${key}:`, error);
      }
    }
    
    this.changeStreams.clear();
    this.clients.clear();
  }
}