import mongoose, { Schema, Document } from "mongoose";

export interface IBranchStats extends Document {
  branch: string;
  NofEmployee: number;
  NofIntern: number;
}

const BranchStatsSchema: Schema = new Schema({
  branch: { type: String, required: true, unique: true },
  NofEmployee: { type: Number, required: true },
  NofIntern: { type: Number, required: true },
});

export default mongoose.model<IBranchStats>("BranchStats", BranchStatsSchema);
