import mongoose from "mongoose";
/**
 * 📡 Connect to MongoDB
 */
export declare function connectDatabase(): Promise<mongoose.Connection>;
/**
 * 🔌 Disconnect from MongoDB
 */
export declare function disconnectDatabase(): Promise<void>;
/**
 * 🔍 Check database connection status
 */
export declare function isDatabaseConnected(): boolean;
//# sourceMappingURL=db.d.ts.map