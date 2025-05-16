import { retry } from "@reduxjs/toolkit/query/react";
import { api } from "./api";
import {
  GetMessagesInterface,
  MessageInterface,
} from "@com.synergy/frontend-backend-dashboard/message";
import {
  GetStepsInterface,
  StepInterface,
  GetStepInterface,
} from "@com.synergy/frontend-backend-dashboard/step";
import {
  ChatInterface,
  GetChatInterface,
  GetChatRequestInterface,
  GetChatsInterface,
  GetChatsRequestInterface,
} from "../../../db/models/chat";

// type MessageResponse = { success: boolean; data: MessageInterface[] };
// On modifications, we only send the modified message back as an object
// type MessageResponseMod = { success: boolean; data: MessageInterface };

// export interface User {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// }

export const chatApi = api.injectEndpoints({
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
    getChats: build.query<GetChatsInterface, GetChatsRequestInterface>({
      query: ({ submitId, stepId }) => ({
        url: stepId
          ? `dashboard/submits/${submitId}/chats?stepId=${stepId}`
          : `dashboard/submits/${submitId}/chats`,
      }),
      providesTags: (
        result = {
          success: false,
          data: { chats: [] },
        }
      ) => [
        ...result.data.chats.map(
          ({ _id }: { _id: string }) => ({ type: "Chats", id: _id }) as const
        ),
        { type: "Chats" as const, id: "LIST" },
      ],
    }),
    addChat: build.mutation<ChatInterface, Partial<ChatInterface>>({
      query: (body) => ({
        url: body.stepId
          ? `dashboard/sumbits/${body.submitId}/chats?stepId=${body.stepId}`
          : `dashboard/submits/${body.submitId}/chats`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Chats", id: "LIST" }],
    }),
    getChat: build.query<GetChatInterface, GetChatRequestInterface>({
      query: ({ submitId, chatId }) =>
        `dashboard/submits/${submitId}/chats/${chatId}`,
      providesTags: (_post, _err, { chatId }) => [
        { type: "Chats", id: chatId },
      ],
    }),
    updateChat: build.mutation<ChatInterface, Partial<ChatInterface>>({
      query(data) {
        const { _id, submitId, ...body } = data;
        return {
          url: `dashboard/submits/${submitId}/chats/${_id}`,
          method: "PUT",
          body: body,
        };
      },
      invalidatesTags: (post) => [{ type: "Chats", id: post?._id }],
    }),
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
  useGetChatQuery,
  useAddChatMutation,
  useGetChatsQuery,
  useUpdateChatMutation,
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
} = chatApi;

// export const {
//   endpoints: { getItem },
// } = postsApi;
