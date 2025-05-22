"use client";
import { useEffect, useState } from "react";
import { debounce } from "@com.synergy/frontend-ui/Debounce";
import MessageSubmit from "../messages/MessageSubmit";
import StepsListSidecar from "@com.synergy/frontend-ui/StepsListSidecar";
import { SingleVaultTabs } from "@com.synergy/frontend-ui/SingleVaultTabs";
import VaultsListSidecar from "./layout/VaultsListSidecar";
import { IsUpdateVaultLoadingState } from "./settings/VaultSubmitSettings";
import { SubmitAssetsList } from "@com.synergy/frontend-ui/SubmitAssetsList";

/* eslint-disable-next-line */
export interface VaultSubmitAssetsProps {
  params: { id: string; vaultId: string };
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const VaultSubmitAssets = (props: VaultSubmitAssetsProps) => {
  const {
    params,
    STORAGE_ZONE_ACCESS_KEY,
    STORAGE_ZONE_REGION,
    STORAGE_ZONE_BASE_HOSTNAME,
    STORAGE_ZONE_NAME,
  } = props;

  const [stepsListOpen, setStepsListOpen] = useState(false);
  const [editVaultToggle, setEditVaultToggle] = useState<boolean>(false);

  return (
    <>
      <VaultsListSidecar
        params={params}
        stepsListOpen={stepsListOpen}
        setStepsListOpen={setStepsListOpen}
      >
        <div className="w-full border-l border-gray-200">
          <SingleVaultTabs
            SingleVaultTabsEdit={{
              editVaultToggle: editVaultToggle,
              setEditVaultToggle: setEditVaultToggle,
            }}
            params={params}
          />
          <div className="flex flex-col justify-between relative h-screen">
            <SubmitAssetsList
              params={params}
              editSubmitToggle={editVaultToggle}
              setEditSubmitToggle={setEditVaultToggle}
              STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
              STORAGE_ZONE_REGION={STORAGE_ZONE_REGION}
              STORAGE_ZONE_BASE_HOSTNAME={STORAGE_ZONE_BASE_HOSTNAME}
              STORAGE_ZONE_NAME={STORAGE_ZONE_NAME}
            />
          </div>
        </div>
      </VaultsListSidecar>
    </>
  );
};

export default VaultSubmitAssets;
