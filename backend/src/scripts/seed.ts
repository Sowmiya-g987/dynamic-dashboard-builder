// backend/src/scripts/seed.ts

import { MongoClient } from "mongodb";

const SEED_DATA = [
  { branch: "Engineering", NofEmployee: 80, NofIntern: 45 },
  { branch: "Marketing", NofEmployee: 25, NofIntern: 15 },
  { branch: "Sales", NofEmployee: 40, NofIntern: 30 },
  { branch: "HR", NofEmployee: 15, NofIntern: 10 },
  { branch: "Pondy", NofEmployee: 50, NofIntern: 60 },
  { branch: "Hyderabad", NofEmployee: 30, NofIntern: 40 },
  { branch: "Pune", NofEmployee: 70, NofIntern: 20 },
  { branch: "Bangalore", NofEmployee: 55, NofIntern: 35 },
  { branch: "Chennai", NofEmployee: 45, NofIntern: 50 },
  { branch: "Finance", NofEmployee: 20, NofIntern: 5 }
];

const DATABASES = ["salesDB", "livedata", "dashboard"];
const COLLECTIONS = ["branchstats", "sales", "revenue"];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  for (const dbName of DATABASES) {
    const uri = `mongodb://localhost:27017/${dbName}`;
    const client = new MongoClient(uri);

    try {
      await client.connect();
      console.log(`📁 Connected to ${dbName}`);

      const db = client.db(dbName);

      for (const collectionName of COLLECTIONS) {
        // Drop existing collection
        try {
          await db.collection(collectionName).drop();
          console.log(`  🗑️  Dropped existing ${collectionName}`);
        } catch (err) {
          // Collection doesn't exist, that's okay
        }

        // Insert seed data
        await db.collection(collectionName).insertMany(SEED_DATA);
        console.log(`  ✅ Seeded ${collectionName} with ${SEED_DATA.length} documents`);
      }

      console.log(`✅ ${dbName} seeding complete\n`);
    } catch (error) {
      console.error(`❌ Error seeding ${dbName}:`, error);
    } finally {
      await client.close();
    }
  }

  // Seed layoutDB
  const layoutUri = "mongodb://localhost:27017/layoutDB";
  const layoutClient = new MongoClient(layoutUri);

  try {
    await layoutClient.connect();
    console.log("📁 Connected to layoutDB");

    const layoutDB = layoutClient.db("layoutDB");

    // Create savedlayouts collection if it doesn't exist
    const collections = await layoutDB.listCollections({ name: "savedlayouts" }).toArray();
    if (collections.length === 0) {
      await layoutDB.createCollection("savedlayouts");
      console.log("  ✅ Created savedlayouts collection");
    } else {
      console.log("  ℹ️  savedlayouts collection already exists");
    }

    console.log("✅ layoutDB setup complete\n");
  } catch (error) {
    console.error("❌ Error setting up layoutDB:", error);
  } finally {
    await layoutClient.close();
  }

  console.log("🎉 Database seeding completed!\n");
  console.log("📊 Summary:");
  console.log(`   - ${DATABASES.length} data databases seeded`);
  console.log(`   - ${COLLECTIONS.length} collections per database`);
  console.log(`   - ${SEED_DATA.length} documents per collection`);
  console.log(`   - 1 layout database initialized\n`);
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });