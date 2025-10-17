import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  message: string;
  type: "investment" | "transaction" | "kyc" | "security" | "system";
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["investment", "transaction", "kyc", "security", "system"],
      default: "system",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
