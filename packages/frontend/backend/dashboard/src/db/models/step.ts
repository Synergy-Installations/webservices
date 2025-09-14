import mongoose, { Document } from "mongoose";
import { MembersRights } from "../utils/types/members";

interface DefaultResponse {
  success: boolean;
}

export interface GetStepsInterface extends DefaultResponse {
  data: {
    steps: StepInterface[];
  };
}

export interface GetStepInterface extends DefaultResponse {
  data: {
    step: StepInterface;
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

export interface AssetInterface {
  name: string;
  size: number;
  type: string;
  filePath: string;
  status: string;
  createdAt: Date;
}

export interface StepInterface extends Document<string> {
  order: number;
  title: string;
  description?: JSON;
  assets?: AssetInterface[];
  status: {
    message: string;
    code: string;
    color: string;
  };
  submitId: mongoose.Types.ObjectId;
  createdAt: Date;
  visibility: string;
  members?: MembersRights[];
}

const StepSchema = new mongoose.Schema<StepInterface>({
  order: { type: Number, required: true, default: 0 },
  title: { type: String, required: true, default: "Unnamed step" },
  description: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  assets: { type: Array<AssetInterface>, required: false },
  status: {
    message: { type: String, required: false, default: "No status" },
    code: { type: String, required: false, default: "no_status" },
    color: { type: String, required: false, default: "CornflowerBlue" },
  },
  submitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Submit",
  },
  createdAt: { type: Date, default: Date.now, required: true },
  visibility: { type: String, required: true, default: "private" },
  members: { type: Array<MembersRights>, required: false },
});

export default mongoose.models.Step || mongoose.model("Step", StepSchema);
