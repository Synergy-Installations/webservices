import { retry } from "@reduxjs/toolkit/query/react";
import { api } from "./api";
import { SubmitInterface } from "@com.synergy/frontend-backend-dashboard/submit";

type SubmitResponse = { success: boolean; data: SubmitInterface };

// export interface User {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// }

export const submitApi = api.injectEndpoints({
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
    getSubmits: build.query<any, void>({
      query: () => ({ url: "dashboard/submits" }),
      providesTags: (result = { success: false, data: [] }) => [
        ...result.data.map(
          ({ _id }: { _id: string }) => ({ type: "Items", _id }) as const
        ),
        { type: "Items" as const, id: "LIST" },
      ],
    }),
    addSubmit: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: `dashboard/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Submit", id: "LIST" }],
    }),
    //     getItem: build.query<Item, number>({
    //       query: (id) => `dashboard/items/${id}`,
    //       providesTags: (_post, _err, id) => [{ type: "Items", id }],
    //     }),
    //     updateItem: build.mutation<Item, Partial<Item>>({
    //       query(data) {
    //         const { _id, ...body } = data;
    //         return {
    //           url: `dashboard/items/${_id}`,
    //           method: "PUT",
    //           body,
    //         };
    //       },
    //       invalidatesTags: (post) => [{ type: "Items", id: post?._id }],
    //     }),
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
  useAddSubmitMutation,
  useGetSubmitsQuery,
  //   useDeleteItemMutation,
  //   useGetItemQuery,
  //   useGetItemsQuery,
  //   useLoginMutation,
  //   useUpdateItemMutation,
  //   useGetErrorProneQuery,
} = submitApi;

// export const {
//   endpoints: { getItem },
// } = postsApi;
