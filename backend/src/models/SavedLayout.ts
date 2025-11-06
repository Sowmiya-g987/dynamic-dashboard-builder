// ============================================================================
// FILE: backend/src/models/SavedLayout.ts (FIXED WITH PROPER TYPES)
// ============================================================================

import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISavedLayout extends Document {
  _id: Types.ObjectId;
  layoutName: string;
  widgets: any[];
  createdAt: Date;
  updatedAt: Date;
}

const SavedLayoutSchema = new Schema<ISavedLayout>(
  {
    layoutName: {
      type: String,
      required: true,
      trim: true,
    },
    widgets: {
      type: Schema.Types.Mixed,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const SavedLayout = mongoose.model<ISavedLayout>("SavedLayout", SavedLayoutSchema);