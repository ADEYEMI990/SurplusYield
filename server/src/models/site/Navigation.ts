import { Schema, model, Document } from "mongoose";

export interface INavigation extends Document {
  label: string;
  link: string;
  order: number;
  isActive: boolean;
}

const NavigationSchema = new Schema<INavigation>(
  {
    label: { type: String, required: true },
    link: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<INavigation>("Navigation", NavigationSchema);
