// server/src/models/Template.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITemplate extends Document {
  type: "email" | "sms" | "push";
  name: string;
  subject?: string;
  content: string;
}

const templateSchema = new Schema<ITemplate>(
  {
    type: { type: String, enum: ["email", "sms", "push"], required: true },
    name: { type: String, required: true, unique: true },
    subject: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Template = mongoose.model<ITemplate>("Template", templateSchema);
