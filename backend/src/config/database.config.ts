// backend/src/config/database.config.ts

export const DATABASE_CONFIG = {
  // MongoDB connection for layouts storage
  layoutDB: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/layoutDB",
    name: "layoutDB"
  },
  
  // Data databases that widgets can query
  databases: [
    {
      name: "salesDB",
      uri: "mongodb://localhost:27017/salesDB",
      collections: ["branchstats", "sales", "revenue"]
    },
    {
      name: "livedata",
      uri: "mongodb://localhost:27017/livedata",
      collections: ["branchstats", "sales", "revenue"]
    },
    {
      name: "dashboard",
      uri: "mongodb://localhost:27017/dashboard",
      collections: ["branchstats", "sales", "revenue"]
    }
  ]
};