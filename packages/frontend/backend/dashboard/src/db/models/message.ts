import mongoose, { Document } from "mongoose";
// import User from "@com.synergy/frontend-backend-dashboard/user";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
var User = require("@com.synergy/frontend-backend-dashboard/user");

export interface GetMessagesInterface {
  success: boolean;
  data: {
    submit: {
      emailAddress: string;
    };
    messages: MessagePopulatedUser[];
  };
}

interface MessagePopulatedUser extends Document<string> {
  sentByUserId: {
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  submitId: mongoose.Types.ObjectId;
  message: string;
  assets?: string[];
  createdAt: Date;
}

export interface MessageInterface extends Document<string> {
  sentByUserId: mongoose.Types.ObjectId;
  submitId: mongoose.Types.ObjectId;
  message: string;
  assets?: string[];
  createdAt: Date;
  stepId?: mongoose.Types.ObjectId;
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
  stepId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Step",
  },
});

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
