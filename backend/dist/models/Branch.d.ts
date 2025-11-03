import mongoose, { Document } from "mongoose";
export interface IBranchStats extends Document {
    branch: string;
    NofEmployee: number;
    NofIntern: number;
}
declare const _default: mongoose.Model<IBranchStats, {}, {}, {}, mongoose.Document<unknown, {}, IBranchStats> & IBranchStats & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Branch.d.ts.map