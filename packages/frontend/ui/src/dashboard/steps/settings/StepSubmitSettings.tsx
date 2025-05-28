"use client";
import { useEffect, useState } from "react";
import { IsUpdateStepLoadingState } from "../StepSubmit";
import { debounce } from "../../../shared/utils/debounce/Debounce";
import StepsListSidecar from "../layout/StepsListSidecar";
import SingleStepTabs from "../tabs/SingleStepTabs";
import StepSettings from "./StepSettings";

/* eslint-disable-next-line */
export interface StepSubmitSettingsProps {
  params: { id: string; stepId: string };
}

export const StepSubmitSettings = (props: StepSubmitSettingsProps) => {
  const { params } = props;

  const [saveStepToggle, setSaveStepToggle] = useState<boolean>(false);
  const [editStepToggle, setEditStepToggle] = useState<boolean>(false);
  const [stepsListOpen, setStepsListOpen] = useState(false);
  const [isUpdateStepLoading, setIsUpdateStepLoading] =
    useState<IsUpdateStepLoadingState>({
      membersRights: false,
    });

  console.log("saveStepToggle", saveStepToggle);

  const debouncedResetSaveEditStepToggle = debounce(() => {
    if (saveStepToggle && !isUpdateStepLoading.membersRights) {
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
          <StepSettings
            params={params}
            saveStepToggle={saveStepToggle}
            setSaveStepToggle={setSaveStepToggle}
            editStepToggle={editStepToggle}
            setEditStepToggle={setEditStepToggle}
            isUpdateStepLoading={isUpdateStepLoading}
            setIsUpdateStepLoading={setIsUpdateStepLoading}
          />
        </div>
      </StepsListSidecar>
    </>
  );
};

export default StepSubmitSettings;
