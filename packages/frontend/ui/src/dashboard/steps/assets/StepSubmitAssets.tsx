"use client";

import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import StepsList from "../StepsList";
import SingleStepTabs from "../tabs/SingleStepTabs";
import StepSingle from "../StepSingle";
import MessageSubmit from "../../messages/MessageSubmit";
import StepAssetsList from "./StepAssetsList";
import { debounce } from "@com.synergy/frontend-ui/Debounce";
import { useEffect, useState } from "react";
import StepsListSidecar from "../layout/StepsListSidecar";
import { IsUpdateStepLoadingState } from "../StepSubmit";

/* eslint-disable-next-line */
export interface StepSubmitAssetsProps {
  params: { id: string; stepId: string };
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const StepSubmitAssets = (props: StepSubmitAssetsProps) => {
  const {
    params,
    STORAGE_ZONE_ACCESS_KEY,
    STORAGE_ZONE_REGION,
    STORAGE_ZONE_BASE_HOSTNAME,
    STORAGE_ZONE_NAME,
  } = props;

  const [saveStepToggle, setSaveStepToggle] = useState<boolean>(false);
  const [editStepToggle, setEditStepToggle] = useState<boolean>(false);
  const [stepsListOpen, setStepsListOpen] = useState(false);
  const [isUpdateStepLoading, setIsUpdateStepLoading] =
    useState<IsUpdateStepLoadingState>({
      titleAndStatus: false,
      description: false,
    });

  console.log("saveStepToggle", saveStepToggle);

  // This is a poor implementation of removing the saveStepToggle and editStepToggle
  // when the loading is done. This may cause jitter in the UI as the UI is not updated
  // synchronously.
  const debouncedResetSaveEditStepToggle = debounce(() => {
    if (
      saveStepToggle &&
      !isUpdateStepLoading.titleAndStatus &&
      !isUpdateStepLoading.description
    ) {
      console.log("debouncedResetSaveEditStepToggle");
      setSaveStepToggle(false);
      setEditStepToggle(false);
    } else {
      debouncedResetSaveEditStepToggle();
    }
  }, 50);

  useEffect(() => {
    debouncedResetSaveEditStepToggle();

    // This is used to make sure that the button gets disabled when the first
    // call to the debounce function did not trigger the reset and never will.
    setTimeout(() => {
      debouncedResetSaveEditStepToggle();
    }, 100);
  }, [isUpdateStepLoading]);

  return (
    <>
      <StepsListSidecar
        params={params}
        stepsListOpen={stepsListOpen}
        setStepsListOpen={setStepsListOpen}
      >
        <div className="w-full border-l border-gray-200">
          <SingleStepTabs
            params={params}
            SingleStepTabsEdit={{
              saveStepToggle: saveStepToggle,
              setSaveStepToggle: setSaveStepToggle,
              editStepToggle: editStepToggle,
              setEditStepToggle: setEditStepToggle,
              isUpdateStepLoading: isUpdateStepLoading,
              setIsUpdateStepLoading: setIsUpdateStepLoading,
            }}
          />
          <div className="flex flex-col justify-between relative h-full pb-12 md:pb-0">
            <StepAssetsList
              params={params}
              saveStepToggle={saveStepToggle}
              setSaveStepToggle={setSaveStepToggle}
              editStepToggle={editStepToggle}
              setEditStepToggle={setEditStepToggle}
              isUpdateStepLoading={isUpdateStepLoading}
              setIsUpdateStepLoading={setIsUpdateStepLoading}
              STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
              STORAGE_ZONE_REGION={STORAGE_ZONE_REGION}
              STORAGE_ZONE_BASE_HOSTNAME={STORAGE_ZONE_BASE_HOSTNAME}
              STORAGE_ZONE_NAME={STORAGE_ZONE_NAME}
            />
            {/* <MessageSubmit
            params={params}
            style={{ addMessageFormClassName: "pb-48" }}
          /> */}
          </div>
        </div>
      </StepsListSidecar>
    </>
  );
};

export default StepSubmitAssets;
