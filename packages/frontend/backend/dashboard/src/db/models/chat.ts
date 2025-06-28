import mongoose, { Document } from "mongoose";
import { MembersRights } from "@com.synergy/frontend-backend-dashboard/membersTypes";

interface DefaultResponse {
  success: boolean;
}

export interface GetChatsRequestInterface {
  submitId: string;
  stepId?: string;
}

export interface GetChatRequestInterface {
  submitId: string;
  chatId?: string;
}

export interface GetChatsInterface extends DefaultResponse {
  data: {
    chats: ChatInterface[];
  };
}

export interface GetChatInterface extends DefaultResponse {
  data: {
    chat: ChatInterface;
  };
}

// interface MessagePopulatedUser extends Document<string> {
//   sentByUserId: {
//     firstName: string;
//     lastName: string;
//     emailAddress: string;
//   };
//   submitId: mongoose.Types.ObjectId;
//   message: string;
//   assets?: string[];
//   createdAt: Date;
// }

export interface ChatInterface extends Document<string> {
  order: number;
  title: string;
  description?: string;
  submitId: mongoose.Types.ObjectId;
  stepId?: mongoose.Types.ObjectId;
  createdAt: Date;
  visibility: string;
  members?: MembersRights[];
}

const Chatschema = new mongoose.Schema<ChatInterface>({
  order: { type: Number, required: true, default: 0 },
  title: { type: String, required: true, default: "Unnamed Chat" },
  description: {
    type: String,
    required: false,
  },
  submitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Submit",
  },
  stepId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Step",
  },
  createdAt: { type: Date, default: Date.now, required: true },
  visibility: { type: String, required: true, default: "private" },
  members: { type: Array<MembersRights>, required: false },
});

export default mongoose.models.Chat || mongoose.model("Chat", Chatschema);
