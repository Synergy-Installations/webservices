import mongoose, { Document } from "mongoose";

// export interface GetMessagesInterface {
//   success: boolean;
//   data: {
//     submit: {
//       emailAddress: string;
//     };
//     messages: MessagePopulatedUser[];
//   };
// }

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

export interface StepInterface extends Document<string> {
  order: number;
  title: string;
  description: string;
  assets?: string[];
  status: {
    message: string;
    code: string;
    color: string;
  };
  submitId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StepSchema = new mongoose.Schema<StepInterface>({
  order: { type: Number, required: true, default: 0 },
  title: { type: String, required: true, default: "Unnamed step" },
  description: { type: String, required: true, default: "No description" },
  assets: { type: [String], required: false },
  status: {
    message: { type: String, required: true, default: "No status" },
    code: { type: String, required: true, default: "no_status" },
    color: { type: String, required: true, default: "#000000" },
  },
  submitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Submit",
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Step || mongoose.model("Step", StepSchema);
