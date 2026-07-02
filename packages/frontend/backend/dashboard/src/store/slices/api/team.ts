import { api } from "./api";
import { TeamInterface } from "@com.synergy/frontend-backend-dashboard/team";

type TeamsResponse = { success: boolean; data: TeamInterface[] };

export const teamApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTeams: build.query<TeamsResponse, void>({
      query: () => ({ url: "dashboard/montage/teams" }),
      providesTags: (result) => [
        ...(result?.data ?? []).map(
          ({ _id }: any) => ({ type: "Teams", id: _id }) as const
        ),
        { type: "Teams" as const, id: "LIST" },
      ],
    }),
    addTeam: build.mutation<any, Partial<TeamInterface>>({
      query: (body) => ({
        url: "dashboard/montage/teams",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Teams", id: "LIST" },
        { type: "Calendar", id: "LIST" },
      ],
    }),
    updateTeam: build.mutation<any, Partial<TeamInterface> & { _id: string }>({
      query({ _id, ...body }) {
        return { url: `dashboard/montage/teams/${_id}`, method: "PATCH", body };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "Teams", id: arg._id },
        { type: "Teams", id: "LIST" },
        { type: "Calendar", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetTeamsQuery, useAddTeamMutation, useUpdateTeamMutation } =
  teamApi;
