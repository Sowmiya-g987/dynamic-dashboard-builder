// backend/src/server.ts
import mongoose from "mongoose";
import app from "./app.js";
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dashboard";
/**
 * 🚀 Start Server
 */
async function startServer() {
    try {
        console.log("📡 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected successfully");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 API endpoints:`);
            console.log(`   - POST http://localhost:${PORT}/api/data/fetch`);
            console.log(`   - GET  http://localhost:${PORT}/api/data/schemas`);
            console.log(`   - GET  http://localhost:${PORT}/api/savedlayouts`);
            console.log(`   - GET  http://localhost:${PORT}/api/savedlayouts/:id`);
            console.log(`   - POST http://localhost:${PORT}/api/savedlayouts`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await mongoose.connection.close();
    process.exit(0);
});
// Start the server
startServer();
//# sourceMappingURL=server.js.map