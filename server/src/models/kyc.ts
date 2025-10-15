import mongoose, { Document, Schema } from "mongoose";

/* ===== KYC Form Schema (Created by Admin) ===== */
export interface IKycField {
  label: string;
  type: "text" | "file";
  required: boolean;
}

export interface IKycForm extends Document {
  name: string;
  fields: IKycField[];
  status: "active" | "deactivated";
}

const KycFieldSchema = new Schema<IKycField>({
  label: { type: String, required: true },
  type: { type: String, enum: ["text", "file"], required: true },
  required: { type: Boolean, default: true },
});

const kycFormSchema = new Schema<IKycForm>(
  {
    name: { type: String, required: true },
    fields: { type: [KycFieldSchema], required: true },
    status: { type: String, enum: ["active", "deactivated"], default: "active" },
  },
  { timestamps: true }
);

/* ===== KYC Submission Schema (Submitted by User) ===== */
export interface IKycSubmissionField {
  label: string;
  value: string; // file path or text input
}

export interface IKycSubmission extends Document {
  user: mongoose.Schema.Types.ObjectId;
  form: mongoose.Schema.Types.ObjectId;
  fields: IKycSubmissionField[];
  status: "pending" | "approved" | "rejected";
  reason?: string; // reason for rejection
}

const kycSubmissionSchema = new Schema<IKycSubmission>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    form: { type: mongoose.Schema.Types.ObjectId, ref: "KycForm", required: true },
    fields: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reason: { type: String, default: "" }, // ✅ reason for rejection
  },
  { timestamps: true }
);

export const KycForm = mongoose.model<IKycForm>("KycForm", kycFormSchema);
export const KycSubmission = mongoose.model<IKycSubmission>(
  "KycSubmission",
  kycSubmissionSchema
);
