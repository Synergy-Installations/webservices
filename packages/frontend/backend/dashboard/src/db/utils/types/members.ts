import mongoose from "mongoose";

export interface MembersRights {
  userUid: mongoose.Types.ObjectId;
  userAuthId: string;
  rights: string[];
  modifiedAt: Date;
}
