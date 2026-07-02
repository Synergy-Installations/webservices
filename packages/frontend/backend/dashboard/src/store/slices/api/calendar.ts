import { api } from "./api";
import { TeamInterface } from "@com.synergy/frontend-backend-dashboard/team";
import { BookingInterface } from "@com.synergy/frontend-backend-dashboard/booking";

export interface CalendarBlock {
  _id: string;
  teamId: string;
  dateKey: string;
  type: "block";
  reason?: string;
}

export interface CalendarData {
  teams: TeamInterface[];
  bookings: BookingInterface[];
  blocks: CalendarBlock[];
}

type CalendarResponse = { success: boolean; data: CalendarData };

export const calendarApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCalendar: build.query<
      CalendarResponse,
      { from: string; to: string; teamId?: string }
    >({
      query: ({ from, to, teamId }) => ({
        url: "dashboard/montage/calendar",
        params: teamId ? { from, to, teamId } : { from, to },
      }),
      providesTags: [{ type: "Calendar", id: "LIST" }],
    }),
  }),
});

export const { useGetCalendarQuery } = calendarApi;
