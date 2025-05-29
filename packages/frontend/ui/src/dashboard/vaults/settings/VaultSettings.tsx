"use client";
import { useEffect, useState } from "react";
import VaultsListSidecar from "../layout/VaultsListSidecar";
import SingleVaultTabs from "../tabs/SingleVaultTabs";
import { debounce } from "../../../shared/utils/debounce/Debounce";
import { IsUpdateVaultLoadingState } from "./VaultSubmitSettings";
import {
  useGetVaultQuery,
  useUpdateVaultMutation,
} from "@com.synergy/frontend-backend-dashboard/vaultApi";
import { Types } from "mongoose";
import { desc } from "framer-motion/client";
import SumbitMembersRights from "../../submits/members/SumbitMembersRights";

/* eslint-disable-next-line */
export interface VaultSettingsProps {
  params: { id: string; vaultId: string };
  saveVaultToggle: boolean;
  setSaveVaultToggle: (saveVaultToggle: boolean) => void;
  editVaultToggle: boolean;
  setEditVaultToggle: (editVaultToggle: boolean) => void;
  isUpdateVaultLoading: IsUpdateVaultLoadingState;
  setIsUpdateVaultLoading: React.Dispatch<
    React.SetStateAction<IsUpdateVaultLoadingState>
  >;
}

export const VaultSettings = (props: VaultSettingsProps) => {
  const {
    params,
    params: { id: submitId, vaultId },
    saveVaultToggle,
    setSaveVaultToggle,
    editVaultToggle,
    setEditVaultToggle,
    isUpdateVaultLoading,
    setIsUpdateVaultLoading,
  } = props;

  const [
    updateVault,
    { isLoading: isUpdateVaultMutationLoading, error: updateVaultMutationError },
  ] = useUpdateVaultMutation();

  const {
    data: vault,
    isLoading: isGetVaultLoading,
    error,
  } = useGetVaultQuery(
    { submitId: submitId, vaultId },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const [editVault, setEditVault] = useState<Partial<any>>({
    _id: new Types.ObjectId(vaultId),
    submitId: new Types.ObjectId(submitId),
    title: vault?.data.vault.title,
    description: vault?.data.vault.description,
  });

  useEffect(() => {
    console.log("editVaultEffect", editVault);
    setEditVault({
      ...editVault,
      _id: new Types.ObjectId(vaultId),
      submitId: new Types.ObjectId(submitId),
    });
  }, [vaultId, submitId]);

  useEffect(() => {
    setEditVault({
      ...editVault,
      title: vault?.data.vault.title,
      description: vault?.data.vault.description,
    });
  }, [vault]);

  console.log(
    "editVault",
    vault?.data.vault,
    editVault,
    "loading?",
    isUpdateVaultMutationLoading,
    isUpdateVaultLoading
  );

  useEffect(() => {
    console.log("saveVaultToggleBeforeIf", saveVaultToggle);
    if (saveVaultToggle) {
      console.log("saveVaultToggle", editVault);
      // Set the loading state at the beginning in order to make sure we are handling the loading state
      // correctly in StepSingle in case other loading states from isUpdateVaultLoading are false (due to no change)
      setIsUpdateVaultLoading({
        ...isUpdateVaultLoading,
        titleDesc: true,
      });
      updateVault(editVault);
    } else {
      // This is done in case we do not have any changes and the StepSubmit useEffect
      // needs the isUpdateVaultLoading state to be updated in order to reset the saveVaultToggle
      // and editVaultToggle states
      setIsUpdateVaultLoading({
        ...isUpdateVaultLoading,
        titleDesc: false,
      });
    }
  }, [saveVaultToggle]);

  useEffect(() => {
    if (isUpdateVaultMutationLoading && !isUpdateVaultLoading.titleDesc) {
      setIsUpdateVaultLoading({
        ...isUpdateVaultLoading,
        titleDesc: true,
      });
    } else if (!isUpdateVaultMutationLoading && isUpdateVaultLoading.titleDesc) {
      setIsUpdateVaultLoading({
        ...isUpdateVaultLoading,
        titleDesc: false,
      });
    }
  }, [isUpdateVaultMutationLoading]);

  return (
    <div className={`flex flex-col gap-2 overflow-y-scroll h-full pb-48`}>
      <div className="h-full overflow-y-scroll px-4 pb-4">
        {isGetVaultLoading ? (
          <div className="flex flex-col gap-2 animate-pulse px-4 pb-4">
            {Array.from({ length: 1 }).map((_, index) => (
              <div role="status" className="max-w-sm animate-pulse pt-2">
                <div className="h-6 bg-gray-200 rounded-lg dark:bg-gray-700 w-48 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                <span className="sr-only">Loading...</span>
              </div>
            ))}
          </div>
        ) : editVaultToggle ? (
          <>
            <input
              type="text"
              className="text-2xl font-bold rounded-lg border-none p-0"
              value={editVault?.title}
              onChange={(e) =>
                setEditVault({
                  ...editVault,
                  title: e.target.value,
                })
              }
            />
            <textarea
              className="w-full rounded-lg border border-gray-300 text-gray-700 p-2"
              value={editVault?.description}
              onChange={(e) =>
                setEditVault({
                  ...editVault,
                  description: e.target.value,
                })
              }
            />
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold">{vault?.data.vault.title}</h3>
            <p className="text-gray-700">{vault?.data.vault.description}</p>
          </>
        )}
        <SumbitMembersRights
          params={params}
          submit={vault?.data.vault}
          updateSubmit={updateVault}
          isGetSubmitLoading={isGetVaultLoading}
          isUpdateSubmitMutationLoading={isUpdateVaultMutationLoading}
          saveSubmitToggle={saveVaultToggle}
          setSaveSubmitToggle={setSaveVaultToggle}
          editSubmitToggle={editVaultToggle}
          setEditSubmitToggle={setEditVaultToggle}
          isUpdateSubmitLoading={isUpdateVaultLoading}
          setIsUpdateSubmitLoading={setIsUpdateVaultLoading}
          styles={{ containerClassName: "w-full mt-4" }}
        />
      </div>
    </div>
  );
};

export default VaultSettings;
