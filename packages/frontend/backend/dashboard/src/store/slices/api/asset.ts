import { retry } from "@reduxjs/toolkit/query/react";
import { api } from "./api";
import {
  GetAssetsInterface,
  AssetInterface,
} from "@com.synergy/frontend-backend-dashboard/asset";

type AssetResponse = { success: boolean; data: AssetInterface[] };
// On modifications, we only send the modified asset back as an object
type AssetResponseMod = { success: boolean; data: AssetInterface };

// export interface User {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// }

export const assetApi = api.injectEndpoints({
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
    getAssets: build.query<
      GetAssetsInterface,
      { submitId?: string; stepId?: string; vaultId?: string }
    >({
      query: ({ submitId, stepId, vaultId }) => ({
        url: vaultId
          ? `dashboard/submits/${submitId}/vaults/${vaultId}/assets`
          : stepId
            ? `dashboard/submits/${submitId}/steps/${stepId}/assets`
            : `dashboard/submits/${submitId}/assets`,
      }),
      providesTags: (
        result = {
          success: false,
          data: { submit: { emailAddress: "" }, assets: [] },
        }
      ) => [
        ...result.data.assets.map(
          ({ _id }: { _id: string }) => ({ type: "Assets", _id }) as const
        ),
        { type: "Assets" as const, id: "LIST" },
      ],
    }),
    addAsset: build.mutation<AssetInterface, Partial<AssetInterface>>({
      query: (body) => ({
        url: body.vaultId
          ? `dashboard/submits/${body.submitId}/vaults/${body.vaultId}/assets`
          : body.stepId
            ? `dashboard/submits/${body.submitId}/steps/${body.stepId}/assets`
            : `dashboard/submits/${body.submitId}/assets`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Assets", id: "LIST" }],
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
    deleteAsset: build.mutation<
      GetAssetsInterface,
      { submitId: string; vaultId: string; assetId: string }
    >({
      query({ submitId, vaultId, assetId }) {
        return {
          url: `dashboard/submits/${submitId}/vaults/${vaultId}/assets/${assetId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (post, _, { assetId }) => [
        { type: "Assets", id: assetId },
        { type: "Assets" as const, id: "LIST" },
      ],
    }),
    // getErrorProne: build.query<{ success: boolean }, void>({
    //   query: () => "error-prone",
    // }),
  }),
});

export const {
  useAddAssetMutation,
  useGetAssetsQuery,
  useDeleteAssetMutation,
  // useGetSubmitsQuery,
  // useGetSubmitQuery,
  // useUpdateSubmitMutation,
  //   useDeleteItemMutation,
  //   useGetItemQuery,
  //   useGetItemsQuery,
  //   useLoginMutation,
  //   useUpdateItemMutation,
  //   useGetErrorProneQuery,
} = assetApi;

// export const {
//   endpoints: { getItem },
// } = postsApi;
