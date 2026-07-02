import mongoose, { Document, Schema } from "mongoose";

export interface TeamInterface extends Document<string> {
  name: string;
  active: boolean;
  color: string; // hex colour used to tint the team's calendar events
  createdAt: Date;
}

export interface GetTeams {
  success: boolean;
  data: TeamInterface[];
}

const TeamSchema = new Schema<TeamInterface>({
  name: { type: String, required: true },
  active: { type: Boolean, required: true, default: true },
  color: { type: String, required: true, default: "#0CC0DF" },
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
