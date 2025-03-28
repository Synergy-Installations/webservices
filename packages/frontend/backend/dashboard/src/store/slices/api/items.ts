import { retry } from "@reduxjs/toolkit/query/react";
import { api } from "./api";

export interface Item {
  id: number;
  name: string;
  description: string;
  fetched_at: string;
}

type PostsResponse = Item[];

// export interface User {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// }

export const postsApi = api.injectEndpoints({
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
    getItems: build.query<PostsResponse, void>({
      query: () => ({ url: "dashboard/items" }),
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Items", id }) as const),
        { type: "Items" as const, id: "LIST" },
      ],
    }),
    addItem: build.mutation<Item, Partial<Item>>({
      query: (body) => ({
        url: `dashboard/items`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Items", id: "LIST" }],
    }),
    getItem: build.query<Item, number>({
      query: (id) => `dashboard/items/${id}`,
      providesTags: (_post, _err, id) => [{ type: "Items", id }],
    }),
    updateItem: build.mutation<Item, Partial<Item>>({
      query(data) {
        const { id, ...body } = data;
        return {
          url: `dashboard/items/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (post) => [{ type: "Items", id: post?.id }],
    }),
    deleteItem: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `dashboard/items/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (post) => [{ type: "Items", id: post?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => "error-prone",
    }),
  }),
});

export const {
  useAddItemMutation,
  useDeleteItemMutation,
  useGetItemQuery,
  useGetItemsQuery,
  //   useLoginMutation,
  useUpdateItemMutation,
  useGetErrorProneQuery,
} = postsApi;

export const {
  endpoints: { getItem },
} = postsApi;
