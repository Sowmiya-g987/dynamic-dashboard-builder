
import app from "./app.js";
import { DatabaseManager } from "./services/DatabaseManager.js";
import { SSEManager } from "./services/SSEManager.js";

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    console.log("🚀 Starting Multi-Database Dashboard Server...\n");
    
   
    await DatabaseManager.connectAll();
    
    console.log("\n✅ All databases connected successfully");

    app.listen(PORT, () => {
      console.log(`\n🌐 Server running on http://localhost:${PORT}`);
      console.log(`\n📋 API Endpoints:`);
      console.log(`   Data Endpoints:`);
      console.log(`   - POST http://localhost:${PORT}/api/data/fetch`);
      console.log(`   - GET  http://localhost:${PORT}/api/data/databases`);
      console.log(`   - GET  http://localhost:${PORT}/api/data/databases/:database/collections`);
      console.log(`   - GET  http://localhost:${PORT}/api/data/stream-stats`);
      console.log(`\n   Layout Endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/api/savedlayouts`);
      console.log(`   - GET  http://localhost:${PORT}/api/savedlayouts/:id`);
      console.log(`   - POST http://localhost:${PORT}/api/savedlayouts`);
      console.log(`   - PUT  http://localhost:${PORT}/api/savedlayouts/:id`);
      console.log(`   - PATCH http://localhost:${PORT}/api/savedlayouts/:id/name`);
      console.log(`   - DELETE http://localhost:${PORT}/api/savedlayouts/:id`);
      console.log(`\n   - GET  http://localhost:${PORT}/health`);
      console.log(`\n✅ Server ready!\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}


process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  SSEManager.closeAll();
  await DatabaseManager.closeAll();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  SSEManager.closeAll();
  await DatabaseManager.closeAll();
  process.exit(0);
});

startServer();