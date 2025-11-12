// backend/src/config/database.config.ts

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const DATABASE_CONFIG = {
  // PostgreSQL connection for layouts storage
  layoutDB: {
    host: process.env.LAYOUT_DB_HOST || "localhost",
    port: parseInt(process.env.LAYOUT_DB_PORT || "5432"),
    database: process.env.LAYOUT_DB_NAME || "layoutDB",
    username: process.env.LAYOUT_DB_USER || "postgres",
    password: process.env.LAYOUT_DB_PASSWORD || "postgres",
    dialect: "postgres" as const,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  },
  
  // Data databases that widgets can query
  databases: [
    {
      name: "salesDB",
      host: process.env.SALES_DB_HOST || "localhost",
      port: parseInt(process.env.SALES_DB_PORT || "5432"),
      database: "salesDB",
      username: process.env.SALES_DB_USER || "postgres",
      password: process.env.SALES_DB_PASSWORD || "postgres",
      dialect: "postgres" as const,
      tables: ["branchstats", "sales", "revenue"],
    },
    {
      name: "livedata",
      host: process.env.LIVEDATA_DB_HOST || "localhost",
      port: parseInt(process.env.LIVEDATA_DB_PORT || "5432"),
      database: "livedata",
      username: process.env.LIVEDATA_DB_USER || "postgres",
      password: process.env.LIVEDATA_DB_PASSWORD || "postgres",
      dialect: "postgres" as const,
      tables: ["branchstats", "sales", "revenue"],
    },
    {
      name: "dashboard",
      host: process.env.DASHBOARD_DB_HOST || "localhost",
      port: parseInt(process.env.DASHBOARD_DB_PORT || "5432"),
      database: "dashboard",
      username: process.env.DASHBOARD_DB_USER || "postgres",
      password: process.env.DASHBOARD_DB_PASSWORD || "postgres",
      dialect: "postgres" as const,
      tables: ["branchstats", "sales", "revenue"],
    }
  ]
};