// server/src/models/Admin.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  role: "superadmin" | "admin"; // extendable
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", AdminSchema);