"use client";

import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import StepsList from "./StepsList";
import SingleStepTabs from "./tabs/SingleStepTabs";
import StepSingle from "./StepSingle";
import { useEffect, useState } from "react";
import { debounce } from "@com.synergy/frontend-ui/Debounce";

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
    }
  }, 1000);

  useEffect(() => {
    debouncedResetSaveEditStepToggle();
  }, [isUpdateStepLoading]);

  return (
    <div className="flex justify-between h-full lg:mr-96">
      <div className="h-full w-1/2">
        <SingleSubmitTabs params={params} />
        <StepsList className="" params={params} />
      </div>
      <div className="w-1/2 border-l border-gray-200">
        <SingleStepTabs
          saveStepToggle={saveStepToggle}
          setSaveStepToggle={setSaveStepToggle}
          editStepToggle={editStepToggle}
          setEditStepToggle={setEditStepToggle}
          isUpdateStepLoading={isUpdateStepLoading}
          setIsUpdateStepLoading={setIsUpdateStepLoading}
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
    </div>
  );
};

export default StepSubmit;
