import mongoose, { Document } from "mongoose";
// import User from "@com.synergy/frontend-backend-dashboard/user";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { AssetInterface as SingleAssetInterface } from "./step";
var User = require("@com.synergy/frontend-backend-dashboard/user");

export interface GetAssetsInterface {
  success: boolean;
  data: {
    submit: {
      emailAddress: string;
    };
    assets: AssetPopulatedUser[];
  };
}

interface AssetPopulatedUser extends Document<string> {
  createdByUserId: {
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  submitId: mongoose.Types.ObjectId;
  description?: string;
  asset: SingleAssetInterface;
  createdAt: Date;
}

export interface AssetInterface extends Document<string> {
  createdByUserId: mongoose.Types.ObjectId;
  submitId: mongoose.Types.ObjectId;
  description?: string;
  asset: SingleAssetInterface;
  stepId?: mongoose.Types.ObjectId;
  vaultId: mongoose.Types.ObjectId;
}

const AssetSchema = new mongoose.Schema<AssetInterface>({
  createdByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  submitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Submit",
  },
  description: { type: String, required: false },
  asset: { type: Object, required: true },
  stepId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Step",
  },
  vaultId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Chat",
  },
});

export default mongoose.models.Asset || mongoose.model("Asset", AssetSchema);
