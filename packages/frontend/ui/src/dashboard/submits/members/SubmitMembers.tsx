"use client";
import { IsUpdateSubmitLoadingState } from "../../steps/StepsSubmit";
import { useState, useEffect } from "react";
import { debounce } from "@com.synergy/frontend-ui/Debounce";
import { SubmitSingle } from "@com.synergy/frontend-ui/SubmitSingle";
import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import { SubmitAssetsList } from "@com.synergy/frontend-ui/SubmitAssetsList";
import SumbitMembersRights from "./SumbitMembersRights";

/* eslint-disable-next-line */
export interface SubmitMembersProps {
  params: { id: string };
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const SubmitMembers = (props: SubmitMembersProps) => {
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
      membersRights: false,
    });

  console.log("saveSubmitToggle", saveSubmitToggle);

  const debouncedResetSaveEditSubmitToggle = debounce(() => {
    if (saveSubmitToggle && !isUpdateSubmitLoading.membersRights) {
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
      <SumbitMembersRights
        params={params}
        saveSubmitToggle={saveSubmitToggle}
        setSaveSubmitToggle={setSaveSubmitToggle}
        editSubmitToggle={editSubmitToggle}
        setEditSubmitToggle={setEditSubmitToggle}
        isUpdateSubmitLoading={isUpdateSubmitLoading}
        setIsUpdateSubmitLoading={setIsUpdateSubmitLoading}
      />
      {/* <MessageSubmit
            params={params}
            style={{ addMessageFormClassName: "pb-48" }}
            /> */}
    </>
  );
};

export default SubmitMembers;
