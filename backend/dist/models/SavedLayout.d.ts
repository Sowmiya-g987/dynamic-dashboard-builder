import mongoose, { Document } from "mongoose";
/**
 * 💾 Saved Layout Interface
 */
export interface ISavedLayout extends Document {
    layoutName: string;
    widgets: any[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const SavedLayout: mongoose.Model<ISavedLayout, {}, {}, {}, mongoose.Document<unknown, {}, ISavedLayout> & ISavedLayout & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=SavedLayout.d.ts.map