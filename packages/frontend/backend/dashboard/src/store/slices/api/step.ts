import { retry } from "@reduxjs/toolkit/query/react";
import { api } from "./api";
import {
  GetMessagesInterface,
  MessageInterface,
} from "@com.synergy/frontend-backend-dashboard/message";
import {
  GetStepsInterface,
  StepInterface,
} from "@com.synergy/frontend-backend-dashboard/step";

// type MessageResponse = { success: boolean; data: MessageInterface[] };
// On modifications, we only send the modified message back as an object
// type MessageResponseMod = { success: boolean; data: MessageInterface };

// export interface User {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// }

export const stepApi = api.injectEndpoints({
  endpoints: (build) => ({
    // login: build.mutation<{ token: string; user: User }, any>({
    //   query: (credentials: any) => ({
    //     url: "login",
    //     method: "POST",
    //     body: credentials,
    //   }),
    //   extraOptions: {
    //     backoff: () => {
    //       // We intentionally error once on login, and this breaks out of retrying. The next login attempt will succeed.
    //       retry.fail({ fake: "error" });
    //     },
    //   },
    // }),
    getSteps: build.query<GetStepsInterface, string>({
      query: (id) => ({ url: `dashboard/submits/${id}/steps` }),
      providesTags: (
        result = {
          success: false,
          data: { steps: [] },
        }
      ) => [
        ...result.data.steps.map(
          ({ _id }: { _id: string }) => ({ type: "Steps", _id }) as const
        ),
        { type: "Steps" as const, id: "LIST" },
      ],
    }),
    addStep: build.mutation<StepInterface, Partial<StepInterface>>({
      query: (body) => ({
        url: `dashboard/submits/${body.submitId}/steps`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Steps", id: "LIST" }],
    }),
    // getSubmit: build.query<any, string>({
    //   query: (id) => `dashboard/submits/${id}`,
    //   providesTags: (_post, _err, id) => [{ type: "Submits", id }],
    // }),
    // updateSubmit: build.mutation<any, Partial<any>>({
    //   query(data) {
    //     const { _id, ...body } = data;
    //     return {
    //       url: `dashboard/submits/${_id}`,
    //       method: "PUT",
    //       body: body,
    //     };
    //   },
    //   invalidatesTags: (post) => [{ type: "Submits", id: post?._id }],
    // }),
    //     deleteItem: build.mutation<{ success: boolean; id: number }, number>({
    //       query(id) {
    //         return {
    //           url: `dashboard/items/${id}`,
    //           method: "DELETE",
    //         };
    //       },
    //       invalidatesTags: (post) => [{ type: "Items", id: post?.id }],
    //     }),
    //     getErrorProne: build.query<{ success: boolean }, void>({
    //       query: () => "error-prone",
    //     }),
  }),
});

export const {
  useGetStepsQuery,
  useAddStepMutation,
  // useAddMessageMutation,
  // useGetMessagesQuery,
  // useGetSubmitsQuery,
  // useGetSubmitQuery,
  // useUpdateSubmitMutation,
  //   useDeleteItemMutation,
  //   useGetItemQuery,
  //   useGetItemsQuery,
  //   useLoginMutation,
  //   useUpdateItemMutation,
  //   useGetErrorProneQuery,
} = stepApi;

// export const {
//   endpoints: { getItem },
// } = postsApi;
