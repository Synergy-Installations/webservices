import mongoose, { Document, Schema } from "mongoose";

/**
 * The human-readable Montagetermin — the source of truth for display. The
 * occupancy docs remain the source of truth for availability; a booking
 * denormalises the job-card fields so the calendar never needs a join.
 */
export interface BookingInterface extends Document<string> {
  inquiryId: mongoose.Types.ObjectId; // the Submit this booking realises
  teamIds: mongoose.Types.ObjectId[]; // 1 or 2 teams
  startDate: string; // date-key "YYYY-MM-DD"
  endDate: string;
  workingDays: string[]; // date-keys occupied
  durationDays: number;
  teamCount: number;
  leadTimeWeeks: number;
  status: "confirmed" | "cancelled";
  // Snapshot for the job card (denormalised):
  customerName: string;
  phone?: string;
  email?: string;
  address: string;
  geo?: { lat: number; lng: number };
  kWp: number;
  components: string[];
  documentsUrl?: string; // Bunny.net
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Clerk user id
}

export interface GetBookings {
  success: boolean;
  data: BookingInterface[];
}

const BookingSchema = new Schema<BookingInterface>({
  inquiryId: { type: Schema.Types.ObjectId, ref: "Submit", required: true },
  teamIds: { type: [Schema.Types.ObjectId], ref: "Team", required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  workingDays: { type: [String], required: true },
  durationDays: { type: Number, required: true },
  teamCount: { type: Number, required: true },
  leadTimeWeeks: { type: Number, required: true },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    required: true,
    default: "confirmed",
  },
  customerName: { type: String, required: true },
  phone: { type: String, required: false },
  email: { type: String, required: false },
  address: { type: String, required: true },
  geo: {
    type: { lat: { type: Number }, lng: { type: Number } },
    required: false,
  },
  kWp: { type: Number, required: true },
  components: { type: [String], required: true, default: [] },
  documentsUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  createdBy: { type: String, required: false },
});

// One active (confirmed) booking per inquiry; cancelled ones don't block a re-book.
BookingSchema.index(
  { inquiryId: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);
BookingSchema.index({ teamIds: 1, startDate: 1 });

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
