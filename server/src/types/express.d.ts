import { IUser } from "../models/User";
import { Document } from "mongoose";

declare global {
  namespace Express {
    interface UserPayload extends Document {
      _id: string;
      email: string;
      role: string;
    }

    interface Request {
      user?: UserPayload; // 👈 Now everywhere req.user is typed
    }
  }
}
