import { retry } from "@reduxjs/toolkit/query/react";
import { api } from "./api";
import {
  GetMessagesInterface,
  MessageInterface,
} from "@com.synergy/frontend-backend-dashboard/message";

type MessageResponse = { success: boolean; data: MessageInterface[] };
// On modifications, we only send the modified message back as an object
type MessageResponseMod = { success: boolean; data: MessageInterface };

// export interface User {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// }

export const messageApi = api.injectEndpoints({
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
    getMessages: build.query<GetMessagesInterface, string>({
      query: (id) => ({ url: `dashboard/submits/${id}/messages` }),
      providesTags: (
        result = {
          success: false,
          data: { submit: { emailAddress: "" }, messages: [] },
        }
      ) => [
        ...result.data.messages.map(
          ({ _id }: { _id: string }) => ({ type: "Messages", _id }) as const
        ),
        { type: "Messages" as const, id: "LIST" },
      ],
    }),
    addMessage: build.mutation<MessageInterface, Partial<MessageInterface>>({
      query: (body) => ({
        url: `dashboard/submits/${body.submitId}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Messages", id: "LIST" }],
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
  useAddMessageMutation,
  useGetMessagesQuery,
  // useGetSubmitsQuery,
  // useGetSubmitQuery,
  // useUpdateSubmitMutation,
  //   useDeleteItemMutation,
  //   useGetItemQuery,
  //   useGetItemsQuery,
  //   useLoginMutation,
  //   useUpdateItemMutation,
  //   useGetErrorProneQuery,
} = messageApi;

// export const {
//   endpoints: { getItem },
// } = postsApi;
