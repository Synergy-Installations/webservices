"use client";

import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import StepsList from "./StepsList";
import SingleStepTabs from "./tabs/SingleStepTabs";
import StepSingle from "./StepSingle";
import { useEffect, useState } from "react";
import { debounce } from "@com.synergy/frontend-ui/Debounce";
import SubmitSingle from "../submits/SubmitSingle";
import StepsListSidecar from "./layout/StepsListSidecar";

/* eslint-disable-next-line */
export interface StepSubmitProps {
  params: { id: string; stepId: string };
}

export interface IsUpdateStepLoadingState {
  titleAndStatus: boolean;
  description: boolean;
}

export const StepSubmit = (props: StepSubmitProps) => {
  const { params } = props;

  const [saveStepToggle, setSaveStepToggle] = useState<boolean>(false);
  const [editStepToggle, setEditStepToggle] = useState<boolean>(false);
  const [stepsListOpen, setStepsListOpen] = useState(false);
  const [isUpdateStepLoading, setIsUpdateStepLoading] = useState<{
    titleAndStatus: boolean;
    description: boolean;
  }>({
    titleAndStatus: false,
    description: false,
  });

  console.log("saveStepToggle", saveStepToggle);

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
  }, [isUpdateStepLoading]);

  return (
    <StepsListSidecar
      params={params}
      stepsListOpen={stepsListOpen}
      setStepsListOpen={setStepsListOpen}
    >
      <div className="w-full md:w-1/2 border-l border-gray-200">
        <SingleStepTabs
          SingleStepTabsEdit={{
            saveStepToggle: saveStepToggle,
            setSaveStepToggle: setSaveStepToggle,
            editStepToggle: editStepToggle,
            setEditStepToggle: setEditStepToggle,
            isUpdateStepLoading: isUpdateStepLoading,
            setIsUpdateStepLoading: setIsUpdateStepLoading,
          }}
          params={params}
        />
        <StepSingle
          saveStepToggle={saveStepToggle}
          setSaveStepToggle={setSaveStepToggle}
          editStepToggle={editStepToggle}
          setEditStepToggle={setEditStepToggle}
          isUpdateStepLoading={isUpdateStepLoading}
          setIsUpdateStepLoading={setIsUpdateStepLoading}
          params={params}
        />
      </div>
    </StepsListSidecar>
  );
};

export default StepSubmit;
