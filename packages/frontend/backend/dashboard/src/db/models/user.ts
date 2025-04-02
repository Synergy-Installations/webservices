import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["missing_requirements", "complete", "abandoned"],
    required: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: false },
  createdAt: { type: Date, default: Date.now, required: true },
  emailAddress: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  verifications: {
    emailAddress: { type: Boolean, default: false },
    phoneNumber: { type: Boolean, default: false },
  },
  createdUserAuthId: { type: String, required: false, unique: true },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
