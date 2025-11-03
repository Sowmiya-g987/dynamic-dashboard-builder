// backend/seedData.js
// Run this file with: node seedData.js

import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb://localhost:27017";
const DB_NAME = "dashboard";

async function seedData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const collection = db.collection("branchstats");

    // Clear existing data
    await collection.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Insert sample data
    const sampleData = [
      { branch: "Pondy", NofEmployee: 50, NofIntern: 60 },
      { branch: "Hyderabad", NofEmployee: 30, NofIntern: 40 },
      { branch: "Pune", NofEmployee: 70, NofIntern: 20 },
      { branch: "Bangalore", NofEmployee: 55, NofIntern: 35 },
      { branch: "Chennai", NofEmployee: 45, NofIntern: 50 },
    ];

    const result = await collection.insertMany(sampleData);
    console.log(`✅ Inserted ${result.insertedCount} documents`);

    const count = await collection.countDocuments();
    console.log(`📊 Total documents in branchstats: ${count}`);

    const data = await collection.find({}).toArray();
    console.log("📋 Data in collection:", data);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Connection closed");
  }
}

seedData();
