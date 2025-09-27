// src/models/site/Footer.ts
import { Schema, model, Document } from "mongoose";

export interface IFooter extends Document {
  section: string; // e.g. "About", "Quick Links", "Contact"
  links?: { label: string; url: string }[];
  content?: string;
}

const FooterSchema = new Schema<IFooter>(
  {
    section: { type: String, required: true },
    links: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    content: { type: String },
  },
  { timestamps: true }
);

export default model<IFooter>("Footer", FooterSchema);
