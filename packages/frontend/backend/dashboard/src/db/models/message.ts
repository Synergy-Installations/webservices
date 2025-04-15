import mongoose, { Document } from "mongoose";

export interface MessageInterface extends Document<string> {
  sentByUserId: mongoose.Types.ObjectId;
  submitId: mongoose.Types.ObjectId;
  message: string;
  assets?: string[];
  createdAt: Date;
}

const MessageSchema = new mongoose.Schema<MessageInterface>({
  sentByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  submitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Submit",
  },
  message: { type: String, required: true },
  assets: { type: [String], required: false },
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
