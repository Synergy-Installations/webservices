"use client";

import { useEffect, useState } from "react";
import { debounce } from "../../../shared/utils/debounce/Debounce";
import VaultsListSidecar from "../layout/VaultsListSidecar";
import SingleVaultTabs from "../tabs/SingleVaultTabs";
import VaultSettings from "./VaultSettings";

export interface IsUpdateVaultLoadingState {
  titleDesc?: boolean;
  membersRights?: boolean;
}

/* eslint-disable-next-line */
export interface VaultSubmitSettingsProps {
  params: { id: string; vaultId: string };
}

export const VaultSubmitSettings = (props: VaultSubmitSettingsProps) => {
  const { params } = props;

  const [saveVaultToggle, setSaveVaultToggle] = useState<boolean>(false);
  const [editVaultToggle, setEditVaultToggle] = useState<boolean>(false);
  const [vaultsListOpen, setVaultsListOpen] = useState(false);
  const [isUpdateVaultLoading, setIsUpdateVaultLoading] =
    useState<IsUpdateVaultLoadingState>({
      titleDesc: false,
      membersRights: false,
    });

  console.log("saveVaultToggle", saveVaultToggle);

  const debouncedResetSaveEditVaultToggle = debounce(() => {
    if (
      saveVaultToggle &&
      !isUpdateVaultLoading.titleDesc &&
      !isUpdateVaultLoading.membersRights
    ) {
      console.log("debouncedResetSaveEditVaultToggle");
      setSaveVaultToggle(false);
      setEditVaultToggle(false);
    } else {
      debouncedResetSaveEditVaultToggle();
    }
  }, 50);

  useEffect(() => {
    debouncedResetSaveEditVaultToggle();
  }, [isUpdateVaultLoading]);

  return (
    <>
      <VaultsListSidecar
        params={params}
        stepsListOpen={vaultsListOpen}
        setStepsListOpen={setVaultsListOpen}
      >
        <div className="w-full border-l border-gray-200">
          <SingleVaultTabs
            params={params}
            SingleVaultTabsEdit={{
              saveVaultToggle: saveVaultToggle,
              setSaveVaultToggle: setSaveVaultToggle,
              editVaultToggle: editVaultToggle,
              setEditVaultToggle: setEditVaultToggle,
              isUpdateVaultLoading: isUpdateVaultLoading,
              setIsUpdateVaultLoading: setIsUpdateVaultLoading,
            }}
          />
          <VaultSettings
            params={params}
            saveVaultToggle={saveVaultToggle}
            setSaveVaultToggle={setSaveVaultToggle}
            editVaultToggle={editVaultToggle}
            setEditVaultToggle={setEditVaultToggle}
            isUpdateVaultLoading={isUpdateVaultLoading}
            setIsUpdateVaultLoading={setIsUpdateVaultLoading}
          />
        </div>
      </VaultsListSidecar>
    </>
  );
};

export default VaultSubmitSettings;
