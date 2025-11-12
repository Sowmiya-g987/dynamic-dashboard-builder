// backend/src/services/DatabaseManager.ts

import { Sequelize, QueryTypes } from "sequelize";
import { DATABASE_CONFIG } from "../config/database.config.js";
import { initSavedLayoutModel } from "../models/SavedLayout.js";

export let layoutSequelize: Sequelize;

export class DatabaseManager {
  private static dataConnections: Map<string, Sequelize> = new Map();
  private static layoutConnection: Sequelize | null = null;

  static async connectAll(): Promise<void> {
    console.log("🔌 [DatabaseManager] Connecting to all databases...");

    // Connect to layoutDB using Sequelize
    try {
      const { host, port, database, username, password, dialect, pool, logging } = DATABASE_CONFIG.layoutDB;
      
      layoutSequelize = new Sequelize(database, username, password, {
        host,
        port,
        dialect,
        pool,
        logging,
      });

      await layoutSequelize.authenticate();
      this.layoutConnection = layoutSequelize;
      
      // Initialize models
      initSavedLayoutModel();
      
      // Sync models (create tables if they don't exist)
      await layoutSequelize.sync({ alter: false });
      
      console.log(`✅ [DatabaseManager] Connected to layoutDB (Sequelize)`);
    } catch (error) {
      console.error(`❌ [DatabaseManager] Failed to connect to layoutDB:`, error);
      throw error;
    }

    // Connect to data databases using Sequelize
    for (const dbConfig of DATABASE_CONFIG.databases) {
      try {
        const connection = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
          host: dbConfig.host,
          port: dbConfig.port,
          dialect: dbConfig.dialect,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
          logging: false,
        });

        await connection.authenticate();
        this.dataConnections.set(dbConfig.name, connection);
        
        console.log(`✅ [DatabaseManager] Connected to: ${dbConfig.name}`);
      } catch (error) {
        console.error(`❌ [DatabaseManager] Failed to connect to ${dbConfig.name}:`, error);
      }
    }

    console.log(`✅ [DatabaseManager] Connected to ${this.dataConnections.size} data databases + layoutDB`);
  }

  static getDatabase(dbName: string): Sequelize | null {
    const db = this.dataConnections.get(dbName);
    if (!db) {
      console.error(`❌ [DatabaseManager] Database not found: ${dbName}`);
      return null;
    }
    return db;
  }

  static getAllDatabases(): string[] {
    return Array.from(this.dataConnections.keys());
  }

  static async getCollections(dbName: string): Promise<string[]> {
    const db = this.getDatabase(dbName);
    if (!db) return [];

    try {
      const tables = await db.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_type = 'BASE TABLE'`,
        { type: QueryTypes.SELECT }
      ) as Array<{ table_name: string }>;
      
     return tables.map((t:any) => t[0]);
  
    } catch (error) {
      console.error(`❌ [DatabaseManager] Error listing tables for ${dbName}:`, error);
      return [];
    }
  }

  static getLayoutConnection(): Sequelize {
    if (!this.layoutConnection) {
      throw new Error("Layout database not connected");
    }
    return this.layoutConnection;
  }

  static async closeAll(): Promise<void> {
    console.log("🔌 [DatabaseManager] Closing all database connections...");
    
    // Close data database connections
    for (const [name, connection] of this.dataConnections.entries()) {
      try {
        await connection.close();
        console.log(`✅ [DatabaseManager] Closed: ${name}`);
      } catch (error) {
        console.error(`❌ [DatabaseManager] Error closing ${name}:`, error);
      }
    }
    
    // Close layout database connection
    if (this.layoutConnection) {
      try {
        await this.layoutConnection.close();
        console.log(`✅ [DatabaseManager] Closed: layoutDB`);
      } catch (error) {
        console.error(`❌ [DatabaseManager] Error closing layoutDB:`, error);
      }
    }
    
    this.dataConnections.clear();
    this.layoutConnection = null;
  }
}