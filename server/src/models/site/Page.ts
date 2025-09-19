import { Schema, model, Document } from "mongoose";

export interface IPage extends Document {
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
}

const PageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IPage>("Page", PageSchema);
