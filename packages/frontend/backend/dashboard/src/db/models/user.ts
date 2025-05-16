import mongoose, { Document, Schema } from "mongoose";

export interface GetUsers {
  success: boolean;
  data: UserInterface[];
}

export interface UserInterface extends Document<string> {
  status: "missing_requirements" | "complete" | "abandoned";
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  emailAddress: string;
  phoneNumber: string | null;
  verifications: {
    emailAddress: boolean;
    phoneNumber: boolean;
  };
  createdUserAuthId: string | null;
}

const UserSchema = new Schema<UserInterface>({
  status: {
    type: String,
    enum: ["missing_requirements", "complete", "abandoned"],
    required: true,
  },
  firstName: { type: String, required: false, default: null },
  lastName: { type: String, required: false, default: null },
  createdAt: { type: Date, default: Date.now, required: true },
  emailAddress: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  verifications: {
    emailAddress: { type: Boolean, default: false },
    phoneNumber: { type: Boolean, default: false },
  },
  createdUserAuthId: { type: String, required: false },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
