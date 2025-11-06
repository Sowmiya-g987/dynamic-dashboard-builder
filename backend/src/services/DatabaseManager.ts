// backend/src/services/DatabaseManager.ts

import { MongoClient, Db } from "mongodb";
import mongoose from "mongoose";
import { DATABASE_CONFIG } from "../config/database.config.js";

export class DatabaseManager {
  private static clients: Map<string, MongoClient> = new Map();
  private static databases: Map<string, Db> = new Map();
  private static layoutConnection: typeof mongoose | null = null;

  static async connectAll(): Promise<void> {
    console.log("🔌 [DatabaseManager] Connecting to all databases...");

    // Connect to layoutDB using Mongoose (for Mongoose models)
    try {
      await mongoose.connect(DATABASE_CONFIG.layoutDB.uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      this.layoutConnection = mongoose;
      console.log(`✅ [DatabaseManager] Connected to layoutDB (Mongoose)`);
    } catch (error) {
      console.error(`❌ [DatabaseManager] Failed to connect to layoutDB:`, error);
      throw error;
    }

    // Connect to data databases using native MongoDB driver
    for (const dbConfig of DATABASE_CONFIG.databases) {
      try {
        const client = new MongoClient(dbConfig.uri);
        await client.connect();
        
        this.clients.set(dbConfig.name, client);
        this.databases.set(dbConfig.name, client.db(dbConfig.name));
        
        console.log(`✅ [DatabaseManager] Connected to: ${dbConfig.name}`);
      } catch (error) {
        console.error(`❌ [DatabaseManager] Failed to connect to ${dbConfig.name}:`, error);
      }
    }

    console.log(`✅ [DatabaseManager] Connected to ${this.databases.size} data databases + layoutDB`);
  }

  static getDatabase(dbName: string): Db | null {
    const db = this.databases.get(dbName);
    if (!db) {
      console.error(`❌ [DatabaseManager] Database not found: ${dbName}`);
      return null;
    }
    return db;
  }

  static getAllDatabases(): string[] {
    return Array.from(this.databases.keys());
  }

  static async getCollections(dbName: string): Promise<string[]> {
    const db = this.getDatabase(dbName);
    if (!db) return [];

    try {
      const collections = await db.listCollections().toArray();
      return collections.map(col => col.name);
    } catch (error) {
      console.error(`❌ [DatabaseManager] Error listing collections for ${dbName}:`, error);
      return [];
    }
  }

  static getLayoutConnection(): typeof mongoose {
    if (!this.layoutConnection) {
      throw new Error("Layout database not connected");
    }
    return this.layoutConnection;
  }

  static async closeAll(): Promise<void> {
    console.log("🔌 [DatabaseManager] Closing all database connections...");
    
    // Close data database connections
    for (const [name, client] of this.clients.entries()) {
      try {
        await client.close();
        console.log(`✅ [DatabaseManager] Closed: ${name}`);
      } catch (error) {
        console.error(`❌ [DatabaseManager] Error closing ${name}:`, error);
      }
    }
    
    // Close layout database connection
    if (this.layoutConnection) {
      try {
        await this.layoutConnection.connection.close();
        console.log(`✅ [DatabaseManager] Closed: layoutDB`);
      } catch (error) {
        console.error(`❌ [DatabaseManager] Error closing layoutDB:`, error);
      }
    }
    
    this.clients.clear();
    this.databases.clear();
    this.layoutConnection = null;
  }
}