import mongoose, { ObjectId } from "mongoose";

export interface MembersRightsPopulatedUserOrigin
  extends MembersRightsPopulatedUser {
  from: string;
}

export interface MembersRightsPopulatedUser
  extends mongoose.Document<ObjectId> {
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
}

export interface MembersRights {
  userUid: mongoose.Types.ObjectId;
  userAuthId: string;
  rights: string[];
  modifiedAt: Date;
}
