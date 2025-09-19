// server/src/models/Setting.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: any;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, unique: true, required: true },
    value: { type: Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export const Setting = mongoose.model<ISetting>("Setting", settingSchema);
