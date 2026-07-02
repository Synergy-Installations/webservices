import { api } from "./api";
import { SubmitFields } from "@com.synergy/frontend-backend-dashboard/montageSubmitFields";

export interface AvailableSlot {
  startDate: string;
  endDate: string;
  workingDays: string[];
}

export interface ExistingBooking {
  _id: string;
  startDate: string;
  endDate: string;
  workingDays: string[];
  teamIds: string[];
  teamCount: number;
  status: string;
  customerName?: string;
  address?: string;
  kWp?: number;
  components?: string[];
}

type AvailabilityResponse = {
  success: boolean;
  data: {
    fields: SubmitFields;
    teamCount: number;
    slots: AvailableSlot[];
    existingBooking: ExistingBooking | null;
    earliestStart: string;
    leadTimeWeeks: number;
  };
};

export const bookingApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAvailability: build.query<
      AvailabilityResponse,
      { submitId: string; teamCount?: number }
    >({
      query: ({ submitId, teamCount }) => ({
        url: "dashboard/montage/availability",
        params: teamCount ? { submitId, teamCount } : { submitId },
      }),
    }),
    scheduleBooking: build.mutation<
      any,
      { submitId: string; startDate: string; teamCount?: number }
    >({
      query: (body) => ({
        url: "dashboard/montage/bookings/schedule",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Calendar", id: "LIST" },
        { type: "Bookings", id: "LIST" },
      ],
    }),
    rescheduleBooking: build.mutation<
      any,
      { submitId: string; startDate: string; teamCount?: number }
    >({
      query: (body) => ({
        url: "dashboard/montage/bookings/reschedule",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Calendar", id: "LIST" },
        { type: "Bookings", id: "LIST" },
      ],
    }),
    cancelBooking: build.mutation<any, string>({
      query: (id) => ({
        url: `dashboard/montage/bookings/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Calendar", id: "LIST" },
        { type: "Bookings", id: "LIST" },
      ],
    }),
    reassignBooking: build.mutation<
      any,
      { id: string; fromTeamId: string; toTeamId: string }
    >({
      query: ({ id, ...body }) => ({
        url: `dashboard/montage/bookings/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Calendar", id: "LIST" }],
    }),
    createBlock: build.mutation<
      any,
      { teamId: string; from: string; to: string; reason?: string }
    >({
      query: (body) => ({
        url: "dashboard/montage/blocks",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Calendar", id: "LIST" }],
    }),
    deleteBlock: build.mutation<any, string>({
      query: (id) => ({
        url: `dashboard/montage/blocks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Calendar", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAvailabilityQuery,
  useLazyGetAvailabilityQuery,
  useScheduleBookingMutation,
  useRescheduleBookingMutation,
  useCancelBookingMutation,
  useReassignBookingMutation,
  useCreateBlockMutation,
  useDeleteBlockMutation,
} = bookingApi;
