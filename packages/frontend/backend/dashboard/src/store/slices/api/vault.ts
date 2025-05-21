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
  VaultInterface,
  GetVaultInterface,
  GetVaultRequestInterface,
  GetVaultsInterface,
  GetVaultsRequestInterface,
} from "../../../db/models/vault";

// type MessageResponse = { success: boolean; data: MessageInterface[] };
// On modifications, we only send the modified message back as an object
// type MessageResponseMod = { success: boolean; data: MessageInterface };

// export interface User {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
// }

export const vaultApi = api.injectEndpoints({
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
    getVaults: build.query<GetVaultsInterface, GetVaultsRequestInterface>({
      query: ({ submitId, stepId }) => ({
        url: stepId
          ? `dashboard/submits/${submitId}/vaults?stepId=${stepId}`
          : `dashboard/submits/${submitId}/vaults`,
      }),
      providesTags: (
        result = {
          success: false,
          data: { vaults: [] },
        }
      ) => [
        ...result.data.vaults.map(
          ({ _id }: { _id: string }) => ({ type: "Vaults", id: _id }) as const
        ),
        { type: "Vaults" as const, id: "LIST" },
      ],
    }),
    addVault: build.mutation<VaultInterface, Partial<VaultInterface>>({
      query: (body) => ({
        url: body.stepId
          ? `dashboard/sumbits/${body.submitId}/vaults?stepId=${body.stepId}`
          : `dashboard/submits/${body.submitId}/vaults`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Vaults", id: "LIST" }],
    }),
    getVault: build.query<GetVaultInterface, GetVaultRequestInterface>({
      query: ({ submitId, vaultId }) =>
        `dashboard/submits/${submitId}/vaults/${vaultId}`,
      providesTags: (_post, _err, { vaultId }) => [
        { type: "Vaults", id: vaultId },
      ],
    }),
    updateVault: build.mutation<VaultInterface, Partial<VaultInterface>>({
      query(data) {
        const { _id, submitId, ...body } = data;
        return {
          url: `dashboard/submits/${submitId}/vaults/${_id}`,
          method: "PUT",
          body: body,
        };
      },
      invalidatesTags: (post) => [{ type: "Vaults", id: post?._id }],
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
  useGetVaultsQuery,
  useGetVaultQuery,
  useAddVaultMutation,
  useUpdateVaultMutation,
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
} = vaultApi;

// export const {
//   endpoints: { getItem },
// } = postsApi;
