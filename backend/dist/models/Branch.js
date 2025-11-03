import mongoose, { Schema } from "mongoose";
const BranchStatsSchema = new Schema({
    branch: { type: String, required: true, unique: true },
    NofEmployee: { type: Number, required: true },
    NofIntern: { type: Number, required: true },
});
export default mongoose.model("BranchStats", BranchStatsSchema);
//# sourceMappingURL=Branch.js.map