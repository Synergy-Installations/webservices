"use client";

import { useEffect, useMemo, useState } from "react";
import { extractSubmitFields } from "@com.synergy/frontend-backend-dashboard/montageSubmitFields";

interface Slot {
  startDate: string;
  endDate: string;
  workingDays: string[];
}

const RICHTWERT_NOTE =
  "Der angezeigte Termin ist ein Richtwert und wird anhand der verfügbaren " +
  "Montageteams sowie des hinterlegten Regelwerks (Dauer nach Anlagengröße, " +
  "Vorlaufzeit nach Materialumfang) bemessen. Abweichungen sind in beide " +
  "Richtungen möglich (z. B. Wetter, unvorhergesehene Einflüsse).";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

const ymd = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/**
 * Funnel form: lets the customer pick a buildable installation start day from
 * live availability. The value is stored on `form.selected.montageStartDate` and
 * booked (confirm-on-submit) after the Submit is created. Optional form — never
 * blocks funnel completion. Mirrors the wiring of the `calendly` form type.
 */
export function MontageDatePickerForm({
  questionElements,
  questionKey,
  formKey,
  setQuestionElements,
  debouncedCountFormsAndSet,
}: {
  questionElements: any;
  questionKey: string;
  formKey: string;
  setQuestionElements: (updater: (prev: any) => any) => void;
  debouncedCountFormsAndSet?: () => void;
}) {
  const form = questionElements[questionKey].form[formKey];
  const selected = form.selected ?? {};

  // kWp + components from the customer's own funnel answers (advisory; the
  // booking re-derives them server-side from the saved Submit).
  const { kWp, components } = useMemo(() => {
    const f = extractSubmitFields({ data: questionElements });
    return { kWp: f.kWp, components: f.components };
  }, [questionElements]);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [leadTimeWeeks, setLeadTimeWeeks] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      kWp: String(kWp),
      components: components.join(","),
    });
    fetch(`/api/funnel/montage/availability?${params.toString()}`)
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return;
        const s: Slot[] = body?.data?.slots ?? [];
        setSlots(s);
        setLeadTimeWeeks(body?.data?.leadTimeWeeks ?? null);
        if (s.length > 0 && !month) {
          const [y, m] = s[0].startDate.split("-").map(Number);
          setMonth({ y, m: m - 1 });
        }
      })
      .catch(() => {
        if (!cancelled) setError("Verfügbarkeit konnte nicht geladen werden.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kWp, components.join(",")]);

  const slotByStart = useMemo(() => {
    const map = new Map<string, Slot>();
    slots.forEach((s) => map.set(s.startDate, s));
    return map;
  }, [slots]);

  const pick = (startDate: string) => {
    const slot = slotByStart.get(startDate);
    if (!slot) return;
    setQuestionElements((prev) => {
      prev[questionKey].form[formKey].selected = {
        ...prev[questionKey].form[formKey].selected,
        montageStartDate: slot.startDate,
        montageEndDate: slot.endDate,
        montageWorkingDays: slot.workingDays.length,
      };
      return prev;
    });
    debouncedCountFormsAndSet?.();
  };

  const chosen = selected.montageStartDate as string | undefined;
  const chosenSlot = chosen ? slotByStart.get(chosen) : undefined;

  // Month grid (Mon-first).
  const grid = useMemo(() => {
    if (!month) return [];
    const first = new Date(month.y, month.m, 1);
    const lead = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(ymd(month.y, month.m, d));
    return cells;
  }, [month]);

  return (
    <div className="col-span-2">
      {loading && (
        <p className="text-sm text-gray-400">Verfügbare Termine werden geladen…</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && slots.length === 0 && (
        <p className="text-sm text-gray-500">
          Derzeit sind keine Montagetermine verfügbar. Ihre Anfrage wird trotzdem
          entgegengenommen — wir melden uns mit einem Terminvorschlag.
        </p>
      )}

      {month && slots.length > 0 && (
        <div className="mx-auto max-w-sm rounded-xl border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setMonth((mo) =>
                  mo
                    ? mo.m === 0
                      ? { y: mo.y - 1, m: 11 }
                      : { y: mo.y, m: mo.m - 1 }
                    : mo
                )
              }
              className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100"
              aria-label="Vorheriger Monat"
            >
              ‹
            </button>
            <span className="text-sm font-medium">
              {MONTHS[month.m]} {month.y}
            </span>
            <button
              type="button"
              onClick={() =>
                setMonth((mo) =>
                  mo
                    ? mo.m === 11
                      ? { y: mo.y + 1, m: 0 }
                      : { y: mo.y, m: mo.m + 1 }
                    : mo
                )
              }
              className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100"
              aria-label="Nächster Monat"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((key, i) => {
              if (!key) return <div key={`e${i}`} />;
              const buildable = slotByStart.has(key);
              const isChosen = key === chosen;
              const day = Number(key.split("-")[2]);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!buildable}
                  onClick={() => pick(key)}
                  className={`aspect-square rounded text-sm transition-colors ${
                    isChosen
                      ? "bg-synergy-light-blue text-white"
                      : buildable
                        ? "bg-synergy-light-blue/10 text-gray-800 hover:bg-synergy-light-blue/25"
                        : "text-gray-300"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {chosenSlot && (
        <p className="mt-3 text-center text-sm font-medium text-gray-800">
          Gewählter Termin: {chosenSlot.startDate} · voraussichtlich{" "}
          {chosenSlot.workingDays.length} Arbeitstage (bis {chosenSlot.endDate})
        </p>
      )}

      <p className="mt-3 text-xs text-gray-500">
        {leadTimeWeeks !== null && (
          <span className="mb-1 block font-medium text-gray-600">
            Vorlaufzeit: {leadTimeWeeks} Wochen
          </span>
        )}
        {RICHTWERT_NOTE}
      </p>
    </div>
  );
}

export default MontageDatePickerForm;
