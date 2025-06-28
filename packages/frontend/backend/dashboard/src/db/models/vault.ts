import mongoose, { Document } from "mongoose";
import { MembersRights } from "@com.synergy/frontend-backend-dashboard/membersTypes";

interface DefaultResponse {
  success: boolean;
}

export interface GetVaultsRequestInterface {
  submitId: string;
  stepId?: string;
}

export interface GetVaultRequestInterface {
  submitId: string;
  vaultId?: string;
}

export interface GetVaultsInterface extends DefaultResponse {
  data: {
    vaults: VaultInterface[];
  };
}

export interface GetVaultInterface extends DefaultResponse {
  data: {
    vault: VaultInterface;
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

export interface VaultInterface extends Document<string> {
  order: number;
  title: string;
  description?: string;
  submitId: mongoose.Types.ObjectId;
  stepId?: mongoose.Types.ObjectId;
  createdAt: Date;
  visibility: string;
  members?: MembersRights[];
}

const VaultSchema = new mongoose.Schema<VaultInterface>({
  order: { type: Number, required: true, default: 0 },
  title: { type: String, required: true, default: "Unnamed Vault" },
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

export default mongoose.models.Vault || mongoose.model("Vault", VaultSchema);
