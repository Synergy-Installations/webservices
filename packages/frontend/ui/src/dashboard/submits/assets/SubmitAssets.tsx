"use client";

import { IsUpdateSubmitLoadingState } from "../../steps/StepsSubmit";
import { useEffect, useState } from "react";
import { debounce } from "@com.synergy/frontend-ui/Debounce";
import SingleSubmitTabs from "../tabs/SingleSubmitTabs";
import SubmitAssetsList from "./SubmitAssetsList";
import SubmitSingle from "../SubmitSingle";

/* eslint-disable-next-line */
export interface SubmitAssetsProps {
  params: { id: string };
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const SubmitAssets = (props: SubmitAssetsProps) => {
  const {
    params,
    STORAGE_ZONE_ACCESS_KEY,
    STORAGE_ZONE_REGION,
    STORAGE_ZONE_BASE_HOSTNAME,
    STORAGE_ZONE_NAME,
  } = props;

  const [saveSubmitToggle, setSaveSubmitToggle] = useState<boolean>(false);
  const [editSubmitToggle, setEditSubmitToggle] = useState<boolean>(false);
  const [isUpdateSubmitLoading, setIsUpdateSubmitLoading] =
    useState<IsUpdateSubmitLoadingState>({
      assets: false,
    });

  console.log("saveSubmitToggle", saveSubmitToggle);

  const debouncedResetSaveEditSubmitToggle = debounce(() => {
    if (saveSubmitToggle && !isUpdateSubmitLoading.assets) {
      console.log("debouncedResetSaveEditSubmitToggle");
      setSaveSubmitToggle(false);
      setEditSubmitToggle(false);
    } else {
      debouncedResetSaveEditSubmitToggle();
    }
  }, 50);

  useEffect(() => {
    debouncedResetSaveEditSubmitToggle();
  }, [isUpdateSubmitLoading]);

  return (
    <>
      <SubmitSingle
        params={params}
        STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
      />
      <SingleSubmitTabs
        SingleStepTabsEdit={{
          saveStepToggle: saveSubmitToggle,
          setSaveStepToggle: setSaveSubmitToggle,
          editStepToggle: editSubmitToggle,
          setEditStepToggle: setEditSubmitToggle,
          isUpdateStepLoading: isUpdateSubmitLoading,
          setIsUpdateStepLoading: setIsUpdateSubmitLoading,
        }}
        params={params}
      />
      <SubmitAssetsList
        params={params}
        saveSubmitToggle={saveSubmitToggle}
        setSaveSubmitToggle={setSaveSubmitToggle}
        editSubmitToggle={editSubmitToggle}
        setEditSubmitToggle={setEditSubmitToggle}
        isUpdateSubmitLoading={isUpdateSubmitLoading}
        setIsUpdateSubmitLoading={setIsUpdateSubmitLoading}
        STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
        STORAGE_ZONE_REGION={STORAGE_ZONE_REGION}
        STORAGE_ZONE_BASE_HOSTNAME={STORAGE_ZONE_BASE_HOSTNAME}
        STORAGE_ZONE_NAME={STORAGE_ZONE_NAME}
      />
      {/* <MessageSubmit
            params={params}
            style={{ addMessageFormClassName: "pb-48" }}
            /> */}
    </>
  );
};

export default SubmitAssets;
