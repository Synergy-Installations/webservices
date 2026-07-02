import mongoose, { Document, Schema } from "mongoose";

/**
 * The heart of the scheduling system. Exactly one document exists per
 * (team, working day) that is taken — whether by a temporary hold, a confirmed
 * booking, or an admin block. Concurrency correctness lives here, not in
 * application logic: the unique compound index on `{ teamId, dateKey }` makes a
 * double-booking physically impossible, and the TTL index on `expiresAt`
 * self-heals abandoned holds.
 */
export interface TeamDayOccupancyInterface extends Document<string> {
  teamId: mongoose.Types.ObjectId;
  dateKey: string; // "YYYY-MM-DD" in Europe/Vienna
  type: "hold" | "booking" | "block";
  inquiryId?: mongoose.Types.ObjectId; // for hold / booking (a Submit)
  bookingId?: mongoose.Types.ObjectId; // for booking
  holdId?: mongoose.Types.ObjectId; // groups a hold's day-docs
  expiresAt?: Date; // ONLY on type "hold" → drives the TTL
  reason?: string; // for block (e.g. "Urlaub")
}

const TeamDayOccupancySchema = new Schema<TeamDayOccupancyInterface>({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  dateKey: { type: String, required: true },
  type: {
    type: String,
    enum: ["hold", "booking", "block"],
    required: true,
  },
  inquiryId: { type: Schema.Types.ObjectId, ref: "Submit", required: false },
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: false },
  holdId: { type: Schema.Types.ObjectId, required: false },
  expiresAt: { type: Date, required: false },
  reason: { type: String, required: false },
});

// Correctness backbone: a team-day can be claimed at most once.
TeamDayOccupancySchema.index({ teamId: 1, dateKey: 1 }, { unique: true });
// Self-healing holds: delete expired holds; bookings/blocks have no expiresAt.
TeamDayOccupancySchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $exists: true } },
  }
);
TeamDayOccupancySchema.index({ holdId: 1 });
TeamDayOccupancySchema.index({ bookingId: 1 });
TeamDayOccupancySchema.index({ inquiryId: 1 });

export default mongoose.models.TeamDayOccupancy ||
  mongoose.model("TeamDayOccupancy", TeamDayOccupancySchema);
