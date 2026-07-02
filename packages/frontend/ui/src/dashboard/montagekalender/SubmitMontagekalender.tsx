"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CalendarPlus, MapPin } from "lucide-react";
import { SubmitSingle } from "@com.synergy/frontend-ui/SubmitSingle";
import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import {
  useLazyGetAvailabilityQuery,
  useCancelBookingMutation,
} from "@com.synergy/frontend-backend-dashboard/bookingApi";
import { PlanModal } from "@com.synergy/frontend-ui/Montagekalender";

/* eslint-disable-next-line */
export interface SubmitMontagekalenderProps {
  params: { id: string };
}

/**
 * Per-Submit Montagekalender tab: shows this inquiry's booking. Montage-admins
 * can schedule / reschedule / cancel it (reusing the main PlanModal locked to
 * this submit); non-admin members see the read-only summary.
 */
export const SubmitMontagekalender = (props: SubmitMontagekalenderProps) => {
  const { params } = props;
  const submitId = params.id;

  const { user } = useUser();
  const accessRights = user?.publicMetadata?.accessRights;
  const isAdmin =
    Array.isArray(accessRights) &&
    (accessRights.includes("all:*") || accessRights.includes("montage:*"));

  const [fetchAvailability, { data: availRes, isFetching }] =
    useLazyGetAvailabilityQuery();
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();
  const [planOpen, setPlanOpen] = useState(false);

  useEffect(() => {
    fetchAvailability({ submitId });
  }, [fetchAvailability, submitId]);

  const booking = availRes?.data?.existingBooking;
  const mapsUrl = booking?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        booking.address
      )}`
    : null;

  return (
    <>
      <SubmitSingle
        params={params}
        STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
      />
      <SingleSubmitTabs params={params} />

      <div className="h-full overflow-y-auto p-4">
        <div className="mx-auto max-w-lg">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-bold">Montagetermin</h1>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setPlanOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-synergy-light-blue px-3 py-2 text-sm font-medium text-white hover:bg-synergy-light-blue/90"
              >
                <CalendarPlus className="h-4 w-4" />
                {booking ? "Termin ändern" : "Termin planen"}
              </button>
            )}
          </div>

          {isFetching && (
            <p className="text-sm text-gray-400">Termin wird geladen…</p>
          )}

          {!isFetching && !booking && (
            <p className="text-sm text-gray-500">
              Für diese Anfrage ist noch kein Montagetermin geplant.
            </p>
          )}

          {booking && (
            <div className="rounded-xl border border-synergy-light-grey bg-white p-4">
              <Row label="Zeitraum" value={`${booking.startDate} – ${booking.endDate}`} />
              <Row
                label="Arbeitstage"
                value={String(booking.workingDays?.length ?? "")}
              />
              {typeof booking.kWp === "number" && (
                <Row label="Leistung" value={`${booking.kWp} kWp`} />
              )}
              {booking.components && booking.components.length > 0 && (
                <Row label="Komponenten" value={booking.components.join(", ")} />
              )}
              {booking.address && (
                <div className="flex items-start gap-1 py-1 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-synergy-light-blue hover:underline"
                    >
                      {booking.address}
                    </a>
                  ) : (
                    <span>{booking.address}</span>
                  )}
                </div>
              )}
              <Row label="Teams" value={String(booking.teamCount ?? 1)} />
              <Row label="Status" value={booking.status} />

              {isAdmin && (
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={async () => {
                    await cancelBooking(String(booking._id));
                    fetchAvailability({ submitId });
                  }}
                  className="mt-3 w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Termin stornieren
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {planOpen && (
        <PlanModal
          lockedSubmitId={submitId}
          onClose={() => {
            setPlanOpen(false);
            fetchAvailability({ submitId });
          }}
        />
      )}
    </>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default SubmitMontagekalender;
