import { retry } from "@reduxjs/toolkit/query/react";
import { api } from "./api";
import { SubmitInterface } from "@com.synergy/frontend-backend-dashboard/submit";
import { GetUsers } from "../../../db/models/user";

type SubmitResponse = { success: boolean; data: SubmitInterface };

// export interface User {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// }

export const userApi = api.injectEndpoints({
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
    searchUsers: build.query<GetUsers, string>({
      query: (searchValue) => ({
        url: `dashboard/users/searchUsers?searchValue=${searchValue}`,
      }),
      //   providesTags: (result = { success: false, data: [] }) => [
      //     ...result.data.map(
      //       ({ _id }: { _id: string }) => ({ type: "Submits", _id }) as const
      //     ),
      //     { type: "Submits" as const, id: "LIST" },
      //   ],
    }),
    // addSubmit: build.mutation<any, Partial<any>>({
    //   query: (body) => ({
    //     url: `dashboard/submits`,
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: [{ type: "Submits", id: "LIST" }],
    // }),
    getUser: build.query<any, string>({
      query: (id) => `dashboard/users/${id}`,
      providesTags: (_post, _err, id) => [{ type: "Users", id }],
    }),
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
  useSearchUsersQuery,
  useGetUserQuery,
  //   useAddSubmitMutation,
  //   useGetSubmitsQuery,
  //   useGetSubmitQuery,
  //   useUpdateSubmitMutation,
  //   useDeleteItemMutation,
  //   useGetItemQuery,
  //   useGetItemsQuery,
  //   useLoginMutation,
  //   useUpdateItemMutation,
  //   useGetErrorProneQuery,
} = userApi;

// export const {
//   endpoints: { getItem },
// } = postsApi;
