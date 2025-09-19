import { Schema, model, Document } from "mongoose";

interface ISection {
  title: string;
  content: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export interface ILanding extends Document {
  sectionName: string; // hero, calculator, faq, etc.
  sections: ISection[];
}

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const LandingSchema = new Schema<ILanding>(
  {
    sectionName: { type: String, required: true, unique: true },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

export default model<ILanding>("Landing", LandingSchema);
