
import { Response } from "express";
import { DatabaseManager } from "./DatabaseManager.js";
import { QueryTypes } from "sequelize";
import type { WidgetConfig } from "../types/Types.js";
import createSubscriber from "pg-listen";

interface SSEClient {
  response: Response;
  widgets: WidgetConfig[];
}

interface NotificationPayload {
  table: string;
  operation: string;
  data?: any;
}

export class SSEManager {
  private static clients: Set<SSEClient> = new Set();
  private static subscribers: Map<string, any> = new Map();
  private static listenerSetup: Map<string, Set<string>> = new Map();

  static addClient(res: Response, widgets: WidgetConfig[]): void {
    const client: SSEClient = { response: res, widgets };
    this.clients.add(client);
    console.log(`📡 [SSE] Client connected. Total clients: ${this.clients.size}`);
  }

  static removeClient(res: Response): void {
    for (const client of this.clients) {
      if (client.response === res) {
        this.clients.delete(client);
        console.log(`📡 [SSE] Client disconnected. Total clients: ${this.clients.size}`);
        break;
      }
    }
  }

  static async initializeWatchers(widgets: WidgetConfig[]): Promise<void> {
    const validWidgets = widgets.filter(w => w.data.database && w.data.collection);
    
    const watchTargets = new Map<string, Set<string>>();

    for (const widget of validWidgets) {
      const { database, collection } = widget.data;
      
      if (!watchTargets.has(database)) {
        watchTargets.set(database, new Set());
      }
      watchTargets.get(database)!.add(collection);
    }

    for (const [database, collections] of watchTargets) {
      for (const collection of collections) {
        await this.startWatcher(database, collection);
      }
    }
  }

  private static async startWatcher(database: string, collection: string): Promise<void> {
    const key = `${database}:${collection}`;
    
    if (!this.subscribers.has(database)) {
      await this.createDatabaseSubscriber(database);
    }

    const existingTables = this.listenerSetup.get(database) || new Set();
    if (existingTables.has(collection)) {
      console.log(`⏭️ [SSE] Trigger already exists for ${key}`);
      return;
    }

    try {
      const db = DatabaseManager.getDatabase(database);
      if (!db) {
        console.error(`❌ [SSE] Database not found: ${database}`);
        return;
      }

      await this.createTriggerFunction(db);
      
      await this.createTableTrigger(db, collection);
      
      if (!this.listenerSetup.has(database)) {
        this.listenerSetup.set(database, new Set());
      }
      this.listenerSetup.get(database)!.add(collection);
      
      console.log(`✅ [SSE] Started watcher for ${key}`);
    } catch (error) {
      console.error(`❌ [SSE] Failed to start watcher for ${key}:`, error);
    }
  }

  private static async createDatabaseSubscriber(database: string): Promise<void> {
    const db = DatabaseManager.getDatabase(database);
    if (!db) return;

    const config = db.config as any;
    
    const subscriber = createSubscriber({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    subscriber.notifications.on("table_change", async (payload: NotificationPayload) => {
      console.log(`🔔 [SSE] Change detected in ${database}:${payload.table}:`, payload.operation);
      await this.broadcastChange(database, payload.table);
    });

    subscriber.events.on("error", (error: Error) => {
      console.error(`❌ [SSE] Subscriber error for ${database}:`, error);
    });

    await subscriber.connect();
    await subscriber.listenTo("table_change");
    
    this.subscribers.set(database, subscriber);
    console.log(`✅ [SSE] Created subscriber for ${database}`);
  }

  private static async createTriggerFunction(db: any): Promise<void> {
    const functionSQL = `
      CREATE OR REPLACE FUNCTION notify_table_change()
      RETURNS TRIGGER AS $$
      DECLARE
        payload JSON;
      BEGIN
        payload = json_build_object(
          'table', TG_TABLE_NAME,
          'operation', TG_OP,
          'data', row_to_json(COALESCE(NEW, OLD))
        );
        
        PERFORM pg_notify('table_change', payload::text);
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await db.query(functionSQL);
  }

  private static async createTableTrigger(db: any, tableName: string): Promise<void> {
    // Drop trigger if exists
    await db.query(`DROP TRIGGER IF EXISTS ${tableName}_notify ON "${tableName}"`);
    
    // Create trigger
    const triggerSQL = `
      CREATE TRIGGER ${tableName}_notify
      AFTER INSERT OR UPDATE OR DELETE
      ON "${tableName}"
      FOR EACH ROW
      EXECUTE FUNCTION notify_table_change()
    `;

    await db.query(triggerSQL);
  }

  private static async broadcastChange(database: string, collection: string): Promise<void> {
    const db = DatabaseManager.getDatabase(database);
    if (!db) return;

    for (const client of this.clients) {
      try {
        const matchingWidgets = client.widgets.filter(
          w => w.data.database === database && w.data.collection === collection
        );

        for (const widget of matchingWidgets) {
          // Build query
          let selectClause = "*";
          if (widget.data.projection && Object.keys(widget.data.projection).length > 0) {
            const fields = Object.keys(widget.data.projection).filter(
              key => widget.data.projection![key] === 1
            );
            if (fields.length > 0) {
              selectClause = fields.map(f => `"${f}"`).join(", ");
            }
          }

          let whereClause = "";
          const replacements: any = {};
          
          if (widget.data.query && Object.keys(widget.data.query).length > 0) {
            const conditions: string[] = [];
            let paramIndex = 1;
            
            for (const [key, value] of Object.entries(widget.data.query)) {
              const paramName = `param${paramIndex++}`;
              conditions.push(`"${key}" = :${paramName}`);
              replacements[paramName] = value;
            }
            
            if (conditions.length > 0) {
              whereClause = `WHERE ${conditions.join(" AND ")}`;
            }
          }

          const sql = `SELECT ${selectClause} FROM "${collection}" ${whereClause}`;
          
          const freshData = await db.query(sql, {
            replacements,
            type: QueryTypes.SELECT,
          });

          const payload = {
            widgetId: widget.id,
            data: freshData,
            timestamp: new Date().toISOString(),
          };

          client.response.write(`data: ${JSON.stringify(payload)}\n\n`);
          console.log(`📤 [SSE] Sent update for widget ${widget.id}`);
        }
      } catch (error) {
        console.error(`❌ [SSE] Error broadcasting change:`, error);
        this.removeClient(client.response);
      }
    }
  }

  static async closeAll(): Promise<void> {
    console.log("🔌 [SSE] Closing all subscribers...");
    
    for (const [database, subscriber] of this.subscribers.entries()) {
      try {
        await subscriber.close();
        console.log(`✅ [SSE] Closed subscriber: ${database}`);
      } catch (error) {
        console.error(`❌ [SSE] Error closing subscriber ${database}:`, error);
      }
    }
    
    this.subscribers.clear();
    this.listenerSetup.clear();
    this.clients.clear();
  }
}