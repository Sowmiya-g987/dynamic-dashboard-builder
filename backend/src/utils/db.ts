// backend/src/utils/db.ts

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dashboard";

/**
 * 📡 Connect to MongoDB
 */
export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB connected successfully");
    console.log(`📍 Database: ${mongoose.connection.name}`);

    // Log collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Available collections: ${collections.map(c => c.name).join(", ")}`);

    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

/**
 * 🔌 Disconnect from MongoDB
 */
export async function disconnectDatabase() {
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
    throw error;
  }
}

/**
 * 🔍 Check database connection status
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Connection event listeners
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to database");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 Mongoose disconnected from database");
});