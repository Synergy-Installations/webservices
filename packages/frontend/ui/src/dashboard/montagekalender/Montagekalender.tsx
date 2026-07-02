"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  View,
} from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { de } from "date-fns/locale";
import { X, CalendarPlus, Ban, MapPin, FileText, Info } from "lucide-react";
import { useGetSubmitsQuery } from "@com.synergy/frontend-backend-dashboard/submitApi";
import { extractSubmitFields } from "@com.synergy/frontend-backend-dashboard/montageSubmitFields";
import {
  useGetTeamsQuery,
  useAddTeamMutation,
} from "@com.synergy/frontend-backend-dashboard/teamApi";
import { useGetCalendarQuery } from "@com.synergy/frontend-backend-dashboard/calendarApi";
import {
  useLazyGetAvailabilityQuery,
  useScheduleBookingMutation,
  useRescheduleBookingMutation,
  useCancelBookingMutation,
  useReassignBookingMutation,
  useCreateBlockMutation,
  useDeleteBlockMutation,
  AvailableSlot,
  ExistingBooking,
} from "@com.synergy/frontend-backend-dashboard/bookingApi";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { de },
});

const toKey = (d: Date) => format(d, "yyyy-MM-dd");
/** "YYYY-MM-DD" + hour → local Date (installs are shown as an 08–16 block). */
const keyToDate = (key: string, hour: number) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, hour);
};

interface CalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  type: "booking" | "block";
  color: string;
  booking?: any;
  block?: any;
}

/* eslint-disable-next-line */
export interface MontagekalenderProps {}

export const Montagekalender = (props: MontagekalenderProps) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  // Visible range (from/to as date-keys) for the calendar query — derived from
  // the current date + view so it is correct on first render (react-big-calendar
  // does not fire onRangeChange on mount, only on navigation).
  const range = useMemo(() => {
    const mon = { weekStartsOn: 1 as const };
    if (view === Views.MONTH) {
      return {
        from: toKey(startOfWeek(startOfMonth(date), mon)),
        to: toKey(endOfWeek(endOfMonth(date), mon)),
      };
    }
    if (view === Views.WEEK) {
      return {
        from: toKey(startOfWeek(date, mon)),
        to: toKey(endOfWeek(date, mon)),
      };
    }
    return { from: toKey(date), to: toKey(date) };
  }, [date, view]);

  const { data: teamsRes, isSuccess: teamsLoaded } = useGetTeamsQuery();
  const teams = teamsRes?.data ?? [];
  const { data: calRes, isFetching } = useGetCalendarQuery(range);

  const teamById = useMemo(() => {
    const map = new Map<string, any>();
    teams.forEach((t: any) => map.set(String(t._id), t));
    return map;
  }, [teams]);

  const events: CalEvent[] = useMemo(() => {
    const data = calRes?.data;
    if (!data) return [];
    const out: CalEvent[] = [];

    for (const b of data.bookings as any[]) {
      const color = teamById.get(String(b.teamIds?.[0]))?.color ?? "#0CC0DF";
      for (const teamId of b.teamIds ?? []) {
        for (const day of b.workingDays ?? []) {
          out.push({
            id: `${b._id}-${teamId}-${day}`,
            title: `${b.customerName || "Kunde"} · ${b.kWp ?? "?"} kWp`,
            start: keyToDate(day, 8),
            end: keyToDate(day, 16),
            resourceId: String(teamId),
            type: "booking",
            color,
            booking: b,
          });
        }
      }
    }

    for (const bl of data.blocks as any[]) {
      out.push({
        id: `block-${bl._id}`,
        title: bl.reason ? `Blockiert: ${bl.reason}` : "Blockiert",
        start: keyToDate(bl.dateKey, 8),
        end: keyToDate(bl.dateKey, 16),
        resourceId: String(bl.teamId),
        type: "block",
        color: "#9CA3AF",
        block: bl,
      });
    }

    if (teamFilter !== "all") {
      return out.filter((e) => e.resourceId === teamFilter);
    }
    return out;
  }, [calRes, teamById, teamFilter]);

  const resources = useMemo(() => {
    const list =
      teamFilter === "all"
        ? teams
        : teams.filter((t: any) => String(t._id) === teamFilter);
    return list.map((t: any) => ({
      resourceId: String(t._id),
      resourceTitle: t.name,
    }));
  }, [teams, teamFilter]);

  return (
    <div className="flex flex-col gap-3 p-4 mt-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Montagekalender</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="rounded-lg border border-synergy-light-grey px-3 py-2 text-sm"
          >
            <option value="all">Alle Teams</option>
            {teams.map((t: any) => (
              <option key={t._id} value={String(t._id)}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setBlockOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-synergy-light-grey px-3 py-2 text-sm font-medium text-gray-700 hover:bg-synergy-light-grey"
          >
            <Ban className="h-4 w-4" /> Blockieren
          </button>
          <button
            type="button"
            onClick={() => setPlanOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-synergy-light-blue px-3 py-2 text-sm font-medium text-white hover:bg-synergy-light-blue/90"
          >
            <CalendarPlus className="h-4 w-4" /> Termin planen
          </button>
        </div>
      </div>

      {!teamsLoaded && (
        <p className="text-xs text-gray-400">Teams werden geladen…</p>
      )}
      {teamsLoaded && teams.length === 0 && <TeamBootstrap />}

      {teams.length > 0 && <Legend teams={teams} />}

      <div
        className="rounded-xl border border-synergy-light-grey bg-white p-2"
        style={{ height: "70vh" }}
      >
        <Calendar
          localizer={localizer}
          culture="de"
          events={events}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          resources={
            view === Views.DAY && resources.length > 0 ? resources : undefined
          }
          resourceIdAccessor="resourceId"
          resourceTitleAccessor="resourceTitle"
          onSelectEvent={(e: CalEvent) => setSelected(e)}
          min={new Date(1970, 0, 1, 6, 0)}
          max={new Date(1970, 0, 1, 20, 0)}
          eventPropGetter={(e: CalEvent) => ({
            style: {
              backgroundColor: e.color,
              borderColor: e.color,
              opacity: e.type === "block" ? 0.6 : 1,
            },
          })}
          messages={{
            today: "Heute",
            previous: "Zurück",
            next: "Weiter",
            day: "Tag",
            week: "Woche",
            month: "Monat",
            noEventsInRange: "Keine Termine in diesem Zeitraum.",
          }}
        />
      </div>

      {isFetching && (
        <p className="text-xs text-gray-400">Kalender wird geladen…</p>
      )}

      {selected && (
        <JobCard event={selected} teams={teams} onClose={() => setSelected(null)} />
      )}
      {planOpen && <PlanModal onClose={() => setPlanOpen(false)} />}
      {blockOpen && (
        <BlockModal teams={teams} onClose={() => setBlockOpen(false)} />
      )}
    </div>
  );
};

/* ---------- Colour legend ---------- */
function Legend({ teams }: { teams: any[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
      <span className="font-medium text-gray-500">Legende:</span>
      {teams.map((t: any) => (
        <span key={t._id} className="inline-flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: t.color ?? "#0CC0DF" }}
          />
          {t.name}
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <span
          className="inline-block h-3 w-3 rounded-sm"
          style={{ backgroundColor: "#9CA3AF" }}
        />
        Blockiert
      </span>
    </div>
  );
}

/* ---------- Why-so-far transparency note ---------- */
const RICHTWERT_NOTE =
  "Der angezeigte Termin ist ein Richtwert und wird anhand der verfügbaren " +
  "Montageteams sowie des hinterlegten Regelwerks (Dauer nach Anlagengröße, " +
  "Vorlaufzeit nach Materialumfang) bemessen. Abweichungen sind in beide " +
  "Richtungen möglich (z. B. Wetter, unvorhergesehene Einflüsse).";

function WhyInfo({ earliestStart, leadTimeWeeks }: { earliestStart?: string; leadTimeWeeks?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        aria-label="Warum ist der früheste Termin so weit entfernt?"
      >
        <Info className="h-4 w-4" /> Warum?
      </button>
      {open && (
        <span className="absolute right-0 top-6 z-10 w-72 rounded-lg border border-synergy-light-grey bg-white p-3 text-xs text-gray-600 shadow-lg">
          {typeof leadTimeWeeks === "number" && (
            <span className="mb-1 block font-medium text-gray-700">
              Vorlaufzeit: {leadTimeWeeks} Wochen
              {earliestStart ? ` (frühestens ab ${earliestStart})` : ""}
            </span>
          )}
          {RICHTWERT_NOTE}
          <span className="mt-1 block text-gray-400">
            Es werden nur Tage angeboten, an denen ein Montageteam frei ist.
          </span>
        </span>
      )}
    </span>
  );
}

/* ---------- Team bootstrap (shown when no teams exist yet) ---------- */
function TeamBootstrap() {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0CC0DF");
  const [addTeam, { isLoading }] = useAddTeamMutation();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-synergy-light-grey bg-gray-50 p-3">
      <p className="text-sm font-medium text-gray-700">
        Noch keine Montageteams. Legen Sie das erste Team an:
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Team-Name"
        className="rounded-lg border border-synergy-light-grey px-3 py-2 text-sm"
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-9 w-12 rounded border border-synergy-light-grey"
      />
      <button
        type="button"
        disabled={isLoading || !name}
        onClick={() => {
          addTeam({ name, color });
          setName("");
        }}
        className="rounded-lg bg-synergy-light-blue px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Team anlegen
      </button>
    </div>
  );
}

/* ---------- Job card side panel ---------- */
function JobCard({
  event,
  teams,
  onClose,
}: {
  event: CalEvent;
  teams: any[];
  onClose: () => void;
}) {
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();
  const [reassign, { isLoading: reassigning }] = useReassignBookingMutation();
  const [deleteBlock, { isLoading: deletingBlock }] = useDeleteBlockMutation();
  const [reassignError, setReassignError] = useState<string | null>(null);

  if (event.type === "block") {
    const bl = event.block;
    return (
      <Panel title="Blockierung" onClose={onClose}>
        <Row label="Team" value={teamName(teams, bl.teamId)} />
        <Row label="Tag" value={bl.dateKey} />
        {bl.reason && <Row label="Grund" value={bl.reason} />}
        <button
          type="button"
          disabled={deletingBlock}
          onClick={async () => {
            await deleteBlock(String(bl._id));
            onClose();
          }}
          className="mt-3 w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Blockierung aufheben
        </button>
      </Panel>
    );
  }

  const b = event.booking;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    b.address || ""
  )}`;
  const currentTeamId = String(event.resourceId);
  const otherTeams = teams.filter((t: any) => String(t._id) !== currentTeamId);

  return (
    <Panel title={b.customerName || "Termin"} onClose={onClose}>
      <Row label="Zeitraum" value={`${b.startDate} – ${b.endDate}`} />
      <Row label="Arbeitstage" value={String(b.workingDays?.length ?? "")} />
      <Row label="Leistung" value={`${b.kWp ?? "?"} kWp`} />
      {b.components?.length > 0 && (
        <Row label="Komponenten" value={b.components.join(", ")} />
      )}
      {b.address && (
        <div className="flex items-start gap-1 py-1 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-synergy-light-blue hover:underline"
          >
            {b.address}
          </a>
        </div>
      )}
      {b.phone && <Row label="Telefon" value={b.phone} />}
      {b.email && <Row label="E-Mail" value={b.email} />}
      {b.documentsUrl && (
        <a
          href={b.documentsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 py-1 text-sm text-synergy-light-blue hover:underline"
        >
          <FileText className="h-4 w-4" /> Dokumente
        </a>
      )}
      <Row label="Team" value={teamName(teams, currentTeamId)} />

      {otherTeams.length > 0 && (
        <div className="mt-3">
          <label className="text-xs font-medium text-gray-500">
            Team neu zuweisen
          </label>
          <select
            defaultValue=""
            disabled={reassigning}
            onChange={async (e) => {
              const toTeamId = e.target.value;
              if (!toTeamId) return;
              setReassignError(null);
              const res: any = await reassign({
                id: String(b._id),
                fromTeamId: currentTeamId,
                toTeamId,
              });
              if (res?.error) {
                setReassignError(
                  res.error?.data?.error === "TARGET_TEAM_BUSY"
                    ? "Zielteam ist an diesen Tagen belegt."
                    : "Zuweisung fehlgeschlagen."
                );
              } else {
                onClose();
              }
            }}
            className="mt-1 w-full rounded-lg border border-synergy-light-grey px-3 py-2 text-sm"
          >
            <option value="">Team auswählen…</option>
            {otherTeams.map((t: any) => (
              <option key={t._id} value={String(t._id)}>
                {t.name}
              </option>
            ))}
          </select>
          {reassignError && (
            <p className="mt-1 text-xs text-red-600">{reassignError}</p>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={cancelling}
        onClick={async () => {
          await cancelBooking(String(b._id));
          onClose();
        }}
        className="mt-3 w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Termin stornieren
      </button>
    </Panel>
  );
}

/* ---------- Plan (schedule-from-submit) modal ---------- */
export function PlanModal({
  onClose,
  lockedSubmitId,
}: {
  onClose: () => void;
  lockedSubmitId?: string;
}) {
  const { data: submitsRes, isLoading: submitsLoading } = useGetSubmitsQuery(
    undefined,
    { skip: Boolean(lockedSubmitId) }
  );
  const submits = Array.isArray(submitsRes?.data) ? submitsRes.data : [];
  const [submitId, setSubmitId] = useState(lockedSubmitId ?? "");
  const [teamCount, setTeamCount] = useState(1);
  const [fetchAvailability, { data: availRes, isFetching }] =
    useLazyGetAvailabilityQuery();
  const [schedule, { isLoading: scheduling }] = useScheduleBookingMutation();
  const [reschedule, { isLoading: rescheduling }] =
    useRescheduleBookingMutation();
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [changeMode, setChangeMode] = useState(false);

  const slots: AvailableSlot[] = availRes?.data?.slots ?? [];
  const fields = availRes?.data?.fields;
  const existingBooking: ExistingBooking | null | undefined =
    availRes?.data?.existingBooking;
  const busy = scheduling || rescheduling;

  // Human-readable option labels: Name · Ort (fallback e-mail).
  const submitOptions = useMemo(
    () =>
      submits.map((s: any) => {
        const f = extractSubmitFields(s);
        const label =
          [f.customerName, f.address].filter(Boolean).join(" · ") ||
          s.emailAddress ||
          s._id;
        return { id: s._id, label };
      }),
    [submits]
  );

  const runCheck = (id: string) => {
    setError(null);
    setChangeMode(false);
    setVisibleCount(6);
    fetchAvailability({ submitId: id, teamCount });
  };

  // Locked to a single submit (per-submit tab) → check on mount.
  useEffect(() => {
    if (lockedSubmitId) runCheck(lockedSubmitId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedSubmitId]);

  const pickSlot = async (startDate: string) => {
    setError(null);
    const res: any = existingBooking
      ? await reschedule({ submitId, startDate, teamCount })
      : await schedule({ submitId, startDate, teamCount });
    if (res?.error) {
      const code = res.error?.data?.error;
      setError(
        code === "SLOT_TAKEN"
          ? "Dieser Termin wurde soeben vergeben. Bitte neu prüfen."
          : code === "ALREADY_BOOKED"
            ? "Diese Anfrage hat bereits einen Termin. Bitte neu laden."
            : "Planung fehlgeschlagen."
      );
      fetchAvailability({ submitId, teamCount });
    } else {
      onClose();
    }
  };

  const showSlots = !existingBooking || changeMode;

  return (
    <Panel title="Termin planen" onClose={onClose} wide>
      {!lockedSubmitId && (
        <>
          <label className="text-xs font-medium text-gray-500">Anfrage</label>
          {submitsLoading ? (
            <p className="mt-1 mb-3 text-sm text-gray-400">
              Anfragen werden geladen…
            </p>
          ) : (
            <select
              value={submitId}
              onChange={(e) => setSubmitId(e.target.value)}
              className="mt-1 mb-3 w-full rounded-lg border border-synergy-light-grey px-3 py-2 text-sm"
            >
              <option value="">Anfrage auswählen…</option>
              {submitOptions.map((o: { id: string; label: string }) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </>
      )}

      <div className="mb-3 flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">Teams</label>
        <select
          value={teamCount}
          onChange={(e) => setTeamCount(Number(e.target.value))}
          className="rounded-lg border border-synergy-light-grey px-2 py-1 text-sm"
        >
          <option value={1}>1 Team</option>
          <option value={2}>2 Teams (halbe Dauer)</option>
        </select>
        <button
          type="button"
          disabled={!submitId || isFetching}
          onClick={() => runCheck(submitId)}
          className="ml-auto rounded-lg border border-synergy-light-grey px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-synergy-light-grey disabled:opacity-50"
        >
          Verfügbarkeit prüfen
        </button>
      </div>

      {fields && (
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {fields.kWp} kWp
            {fields.components?.length
              ? ` · ${fields.components.join(", ")}`
              : ""}
          </p>
          <WhyInfo
            earliestStart={availRes?.data?.earliestStart}
            leadTimeWeeks={availRes?.data?.leadTimeWeeks}
          />
        </div>
      )}

      {existingBooking && (
        <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-800">
            Diese Anfrage ist bereits geplant.
          </p>
          <p className="mt-1 text-amber-700">
            {existingBooking.startDate} – {existingBooking.endDate} (
            {existingBooking.workingDays.length} AT)
          </p>
          {!changeMode && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-synergy-light-grey px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white"
              >
                Behalten
              </button>
              <button
                type="button"
                onClick={() => setChangeMode(true)}
                className="rounded-lg bg-synergy-light-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-synergy-light-blue/90"
              >
                Termin ändern
              </button>
            </div>
          )}
          {changeMode && (
            <p className="mt-2 text-xs text-amber-700">
              Wählen Sie einen neuen Tag — der alte Termin wird storniert.
            </p>
          )}
        </div>
      )}

      {isFetching && <p className="text-sm text-gray-400">Suche Termine…</p>}
      {!isFetching && availRes && showSlots && slots.length === 0 && (
        <p className="text-sm text-gray-500">
          Keine buchbaren Termine im Horizont gefunden.
        </p>
      )}

      {showSlots && (
        <div className="flex flex-col gap-1">
          {slots.slice(0, visibleCount).map((slot) => (
            <button
              key={slot.startDate}
              type="button"
              disabled={busy}
              onClick={() => pickSlot(slot.startDate)}
              className="flex items-center justify-between rounded-lg border border-synergy-light-grey px-3 py-2 text-sm hover:bg-synergy-light-grey disabled:opacity-50"
            >
              <span className="font-medium">{slot.startDate}</span>
              <span className="text-gray-500">
                → {slot.endDate} ({slot.workingDays.length} AT)
              </span>
            </button>
          ))}
          <div className="mt-1 flex gap-2">
            {slots.length > visibleCount && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 6)}
                className="text-xs font-medium text-synergy-light-blue hover:underline"
              >
                Mehr Termine anzeigen ({slots.length - visibleCount} weitere)
              </button>
            )}
            {visibleCount > 6 && (
              <button
                type="button"
                onClick={() => setVisibleCount(6)}
                className="text-xs text-gray-400 hover:underline"
              >
                Weniger anzeigen
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </Panel>
  );
}

/* ---------- Block creation modal ---------- */
function BlockModal({
  teams,
  onClose,
}: {
  teams: any[];
  onClose: () => void;
}) {
  const [teamId, setTeamId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [createBlock, { isLoading }] = useCreateBlockMutation();
  const [error, setError] = useState<string | null>(null);

  return (
    <Panel title="Team blockieren" onClose={onClose}>
      <label className="text-xs font-medium text-gray-500">Team</label>
      <select
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        className="mt-1 mb-3 w-full rounded-lg border border-synergy-light-grey px-3 py-2 text-sm"
      >
        <option value="">Team auswählen…</option>
        {teams.map((t: any) => (
          <option key={t._id} value={String(t._id)}>
            {t.name}
          </option>
        ))}
      </select>
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-500">Von</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-synergy-light-grey px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-500">Bis</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-synergy-light-grey px-3 py-2 text-sm"
          />
        </div>
      </div>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Grund (z. B. Urlaub)"
        className="mb-3 w-full rounded-lg border border-synergy-light-grey px-3 py-2 text-sm"
      />
      <button
        type="button"
        disabled={isLoading || !teamId || !from || !to}
        onClick={async () => {
          setError(null);
          const res: any = await createBlock({ teamId, from, to, reason });
          if (res?.error) {
            setError(
              res.error?.data?.error === "SLOT_TAKEN"
                ? "Ein Tag im Zeitraum ist bereits belegt."
                : "Blockieren fehlgeschlagen."
            );
          } else {
            onClose();
          }
        }}
        className="w-full rounded-lg bg-synergy-light-blue px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Blockieren
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </Panel>
  );
}

/* ---------- Shared UI bits ---------- */
function Panel({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div
        className={`h-full ${wide ? "w-full max-w-md" : "w-full max-w-sm"} overflow-y-auto bg-white p-4 shadow-xl`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-synergy-light-grey"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function teamName(teams: any[], teamId: any): string {
  return (
    teams.find((t: any) => String(t._id) === String(teamId))?.name ??
    "Unbekannt"
  );
}

export default Montagekalender;
