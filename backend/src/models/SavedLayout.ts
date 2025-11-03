// backend/src/models/SavedLayout.ts

import mongoose, { Document, Schema } from "mongoose";


export interface ISavedLayout extends Document {
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
  },
  {
    timestamps: true,
    collection: "savedlayouts",
  }
);

SavedLayoutSchema.index({ createdAt: -1 });


export const SavedLayout = mongoose.model<ISavedLayout>(
  "SavedLayout",
  SavedLayoutSchema
);