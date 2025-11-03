// backend/src/models/SavedLayout.ts
import mongoose, { Schema } from "mongoose";
/**
 * 📋 Saved Layout Schema
 */
const SavedLayoutSchema = new Schema({
    layoutName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    widgets: {
        type: Schema.Types.Mixed,
        required: true,
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    collection: "savedlayouts",
});
// Create index for faster queries
SavedLayoutSchema.index({ createdAt: -1 });
// Export model
export const SavedLayout = mongoose.model("SavedLayout", SavedLayoutSchema);
//# sourceMappingURL=SavedLayout.js.map