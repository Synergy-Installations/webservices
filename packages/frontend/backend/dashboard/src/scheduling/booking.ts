import mongoose from "mongoose";
import Team from "../db/models/team";
import TeamDayOccupancy from "../db/models/teamDayOccupancy";
import Booking from "../db/models/booking";
import Submit from "../db/models/submit";
import { getConfig } from "./config";
import { calendarDays, leadTimeWeeks } from "./rules";
import { addDays, collectWorkingDays, isWorkingDay } from "./dates";
import { extractSubmitFields } from "./submitFields";

const { ObjectId } = mongoose.Types;

export type ConflictCode =
  | "SLOT_TAKEN"
  | "HOLD_EXPIRED"
  | "TARGET_TEAM_BUSY"
  | "ALREADY_BOOKED";

/** Raised on a scheduling conflict; API routes map this to HTTP 409. */
export class ConflictError extends Error {
  code: ConflictCode;
  constructor(code: ConflictCode) {
    super(code);
    this.name = "ConflictError";
    this.code = code;
  }
}

async function withTransaction<T>(
  fn: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result!;
  } finally {
    await session.endSession();
  }
}

export interface HoldResult {
  holdId: mongoose.Types.ObjectId;
  teamIds: mongoose.Types.ObjectId[];
  workingDays: string[];
  expiresAt: Date;
}

/**
 * Reserve the working days a job needs on `teamCount` free teams. The unique
 * `{teamId,dateKey}` index rejects the loser of any race (→ SLOT_TAKEN); the
 * hold's `expiresAt` lets abandoned checkouts self-heal via the TTL index.
 */
export async function createHold({
  inquiryId,
  startDate,
  teamCount = 1,
  kWp,
  components = [],
}: {
  inquiryId: string;
  startDate: string;
  teamCount?: number;
  kWp: number;
  components?: string[];
}): Promise<HoldResult> {
  const cfg = await getConfig();
  const need = collectWorkingDays(
    startDate,
    calendarDays(kWp, teamCount, cfg),
    cfg
  );
  const expiresAt = new Date(Date.now() + cfg.holdTtlMinutes * 60_000);
  const holdId = new ObjectId();

  try {
    let assigned: mongoose.Types.ObjectId[] = [];
    await withTransaction(async (session) => {
      const teams = await Team.find({ active: true }).session(session).lean();
      const occ = await TeamDayOccupancy.find({ dateKey: { $in: need } })
        .select({ teamId: 1, dateKey: 1 })
        .session(session)
        .lean();
      const busy = new Set(occ.map((o: any) => `${o.teamId}|${o.dateKey}`));
      const free = teams.filter((t: any) =>
        need.every((d) => !busy.has(`${t._id}|${d}`))
      );
      if (free.length < teamCount) throw new ConflictError("SLOT_TAKEN");
      assigned = free.slice(0, teamCount).map((t: any) => t._id);

      const docs = assigned.flatMap((teamId) =>
        need.map((dateKey) => ({
          teamId,
          dateKey,
          type: "hold" as const,
          holdId,
          inquiryId: new ObjectId(inquiryId),
          expiresAt,
        }))
      );
      await TeamDayOccupancy.insertMany(docs, { session, ordered: true });
    });
    return { holdId, teamIds: assigned, workingDays: need, expiresAt };
  } catch (e: any) {
    if (e?.code === 11000) throw new ConflictError("SLOT_TAKEN");
    throw e;
  }
}

export interface BookingSnapshot {
  teamCount: number;
  leadTimeWeeks: number;
  customerName: string;
  phone?: string;
  email?: string;
  address: string;
  kWp: number;
  components: string[];
  documentsUrl?: string;
  createdBy?: string;
}

/**
 * Promote a hold's day-docs into a permanent booking (drop `expiresAt` so the
 * TTL ignores them) and create the human-readable Booking record.
 */
export async function confirmBooking({
  holdId,
  snapshot,
}: {
  holdId: string;
  snapshot: BookingSnapshot;
}): Promise<{ bookingId: mongoose.Types.ObjectId }> {
  try {
    return await withTransaction(async (session) => {
    const occ = await TeamDayOccupancy.find({
      holdId: new ObjectId(holdId),
      type: "hold",
    })
      .session(session)
      .lean();
    if (occ.length === 0) throw new ConflictError("HOLD_EXPIRED");

    const bookingId = new ObjectId();
    const teamIds = Array.from(
      new Set(occ.map((o: any) => String(o.teamId)))
    ).map((id) => new ObjectId(id));
    const days = Array.from(
      new Set(occ.map((o: any) => o.dateKey as string))
    ).sort();

    await TeamDayOccupancy.updateMany(
      { holdId: new ObjectId(holdId) },
      { $set: { type: "booking", bookingId }, $unset: { expiresAt: "", holdId: "" } },
      { session }
    );

    await Booking.create(
      [
        {
          _id: bookingId,
          inquiryId: occ[0].inquiryId,
          teamIds,
          startDate: days[0],
          endDate: days[days.length - 1],
          workingDays: days,
          durationDays: days.length,
          teamCount: snapshot.teamCount,
          leadTimeWeeks: snapshot.leadTimeWeeks,
          status: "confirmed",
          customerName: snapshot.customerName,
          phone: snapshot.phone,
          email: snapshot.email,
          address: snapshot.address,
          kWp: snapshot.kWp,
          components: snapshot.components,
          documentsUrl: snapshot.documentsUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: snapshot.createdBy,
        },
      ],
      { session }
    );

    return { bookingId };
    });
  } catch (e: any) {
    // Partial-unique {inquiryId} where status:"confirmed" — this Submit already
    // has an active booking. Surface it immediately so the UI can offer "keep or
    // change" instead of a delayed generic failure.
    if (e?.code === 11000) throw new ConflictError("ALREADY_BOOKED");
    throw e;
  }
}

/**
 * Admin one-shot: schedule an existing Submit onto a team/start day. Derives
 * kWp / components / contact from the Submit's funnel data, holds the days, then
 * confirms — making the calendar useful before any customer-facing flow exists.
 */
export async function scheduleSubmit({
  submitId,
  startDate,
  teamCount = 1,
  createdBy,
}: {
  submitId: string;
  startDate: string;
  teamCount?: number;
  createdBy?: string;
}): Promise<{ bookingId: mongoose.Types.ObjectId }> {
  const submit = await Submit.findById(submitId).lean();
  if (!submit) throw new Error("SUBMIT_NOT_FOUND");

  const fields = extractSubmitFields(submit);
  const cfg = await getConfig();

  const hold = await createHold({
    inquiryId: submitId,
    startDate,
    teamCount,
    kWp: fields.kWp,
    components: fields.components,
  });

  return confirmBooking({
    holdId: String(hold.holdId),
    snapshot: {
      teamCount,
      leadTimeWeeks: leadTimeWeeks(fields.components, cfg),
      customerName: fields.customerName,
      phone: fields.phone,
      email: fields.email,
      address: fields.address,
      kWp: fields.kWp,
      components: fields.components,
      createdBy,
    },
  });
}

/** The current confirmed booking for an inquiry, or null. */
export async function getSubmitBooking(submitId: string) {
  return Booking.findOne({
    inquiryId: new ObjectId(submitId),
    status: "confirmed",
  }).lean();
}

/**
 * Re-schedule a Submit onto a new start day: within a single transaction cancel
 * the existing confirmed booking (free its occupancy) and book the new span, so
 * the slot is never briefly unbooked. Derives kWp/components from the Submit.
 */
export async function rescheduleSubmit({
  submitId,
  startDate,
  teamCount = 1,
  createdBy,
}: {
  submitId: string;
  startDate: string;
  teamCount?: number;
  createdBy?: string;
}): Promise<{ bookingId: mongoose.Types.ObjectId }> {
  const submit = await Submit.findById(submitId).lean();
  if (!submit) throw new Error("SUBMIT_NOT_FOUND");

  const fields = extractSubmitFields(submit);
  const cfg = await getConfig();
  const inquiryId = new ObjectId(submitId);
  const need = collectWorkingDays(
    startDate,
    calendarDays(fields.kWp, teamCount, cfg),
    cfg
  );

  try {
    const bookingId = new ObjectId();
    await withTransaction(async (session) => {
      // 1) Cancel the existing confirmed booking + free its days.
      const existing = await Booking.find({
        inquiryId,
        status: "confirmed",
      }).session(session);
      for (const b of existing) {
        b.status = "cancelled";
        b.updatedAt = new Date();
        await b.save({ session });
      }
      await TeamDayOccupancy.deleteMany(
        { bookingId: { $in: existing.map((b) => b._id) } },
        { session }
      );

      // 2) Recompute free teams for the new span and book them.
      const teams = await Team.find({ active: true }).session(session).lean();
      const occ = await TeamDayOccupancy.find({ dateKey: { $in: need } })
        .select({ teamId: 1, dateKey: 1 })
        .session(session)
        .lean();
      const busy = new Set(occ.map((o: any) => `${o.teamId}|${o.dateKey}`));
      const free = teams.filter((t: any) =>
        need.every((d) => !busy.has(`${t._id}|${d}`))
      );
      if (free.length < teamCount) throw new ConflictError("SLOT_TAKEN");
      const assigned = free.slice(0, teamCount).map((t: any) => t._id);

      const docs = assigned.flatMap((teamId: any) =>
        need.map((dateKey) => ({
          teamId,
          dateKey,
          type: "booking" as const,
          bookingId,
          inquiryId,
        }))
      );
      await TeamDayOccupancy.insertMany(docs, { session, ordered: true });

      await Booking.create(
        [
          {
            _id: bookingId,
            inquiryId,
            teamIds: assigned,
            startDate: need[0],
            endDate: need[need.length - 1],
            workingDays: need,
            durationDays: need.length,
            teamCount,
            leadTimeWeeks: leadTimeWeeks(fields.components, cfg),
            status: "confirmed",
            customerName: fields.customerName,
            phone: fields.phone,
            email: fields.email,
            address: fields.address,
            kWp: fields.kWp,
            components: fields.components,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy,
          },
        ],
        { session }
      );
    });
    return { bookingId };
  } catch (e: any) {
    if (e?.code === 11000) throw new ConflictError("SLOT_TAKEN");
    throw e;
  }
}

/** Cancel a booking and free its team-days (delete the occupancy docs). */
export async function cancelBooking(
  bookingId: string
): Promise<{ ok: true }> {
  return withTransaction(async (session) => {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new Error("BOOKING_NOT_FOUND");
    booking.status = "cancelled";
    booking.updatedAt = new Date();
    await booking.save({ session });
    await TeamDayOccupancy.deleteMany(
      { bookingId: new ObjectId(bookingId) },
      { session }
    );
    return { ok: true };
  });
}

/**
 * Reassign a (single-team) booking to another team. The unique index prevents
 * colliding with the target team's existing occupancy (→ TARGET_TEAM_BUSY).
 */
export async function reassignBooking({
  bookingId,
  fromTeamId,
  toTeamId,
}: {
  bookingId: string;
  fromTeamId: string;
  toTeamId: string;
}): Promise<{ ok: true }> {
  try {
    return await withTransaction(async (session) => {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      await TeamDayOccupancy.updateMany(
        { bookingId: new ObjectId(bookingId), teamId: new ObjectId(fromTeamId) },
        { $set: { teamId: new ObjectId(toTeamId) } },
        { session }
      );
      booking.teamIds = booking.teamIds.map((id: mongoose.Types.ObjectId) =>
        String(id) === fromTeamId ? new ObjectId(toTeamId) : id
      );
      booking.updatedAt = new Date();
      await booking.save({ session });
      return { ok: true };
    });
  } catch (e: any) {
    if (e?.code === 11000) throw new ConflictError("TARGET_TEAM_BUSY");
    throw e;
  }
}

/** Expand a date range into working-day block docs for a team. */
export async function createBlock({
  teamId,
  from,
  to,
  reason,
}: {
  teamId: string;
  from: string;
  to: string;
  reason?: string;
}): Promise<{ created: number }> {
  const cfg = await getConfig();
  const days: string[] = [];
  for (let k = from; k <= to; k = addDays(k, 1)) {
    if (isWorkingDay(k, cfg)) days.push(k);
  }
  try {
    const docs = days.map((dateKey) => ({
      teamId: new ObjectId(teamId),
      dateKey,
      type: "block" as const,
      reason,
    }));
    const res = await TeamDayOccupancy.insertMany(docs, { ordered: true });
    return { created: res.length };
  } catch (e: any) {
    if (e?.code === 11000) throw new ConflictError("SLOT_TAKEN");
    throw e;
  }
}

/** Remove a single block occupancy doc by its id. */
export async function deleteBlock(
  occupancyId: string
): Promise<{ ok: true }> {
  await TeamDayOccupancy.deleteOne({
    _id: new ObjectId(occupancyId),
    type: "block",
  });
  return { ok: true };
}
