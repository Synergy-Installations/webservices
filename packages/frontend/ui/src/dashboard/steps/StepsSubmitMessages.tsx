"use client";
import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import StepsList from "./StepsList";
import SingleStepTabs from "./tabs/SingleStepTabs";
import StepSingle from "./StepSingle";
import MessageSubmit from "../messages/MessageSubmit";
import StepsListSidecar from "./layout/StepsListSidecar";
import { useState } from "react";

/* eslint-disable-next-line */
export interface StepsSubmitMessagesProps {
  params: { id: string; stepId: string };
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const StepsSubmitMessages = (props: StepsSubmitMessagesProps) => {
  const {
    params,
    STORAGE_ZONE_ACCESS_KEY,
    STORAGE_ZONE_REGION,
    STORAGE_ZONE_BASE_HOSTNAME,
    STORAGE_ZONE_NAME,
  } = props;

  const [stepsListOpen, setStepsListOpen] = useState(false);

  return (
    <>
      <StepsListSidecar
        params={params}
        stepsListOpen={stepsListOpen}
        setStepsListOpen={setStepsListOpen}
      >
        <div className="w-full md:w-1/2 border-l border-gray-200">
          <SingleStepTabs params={params} />
          <div className="flex flex-col justify-between relative h-full pb-12 md:pb-0">
            <MessageSubmit
              params={params}
              style={{ addMessageFormClassName: "pb-48" }}
              STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
              STORAGE_ZONE_REGION={STORAGE_ZONE_REGION}
              STORAGE_ZONE_BASE_HOSTNAME={STORAGE_ZONE_BASE_HOSTNAME}
              STORAGE_ZONE_NAME={STORAGE_ZONE_NAME}
            />
          </div>
        </div>
      </StepsListSidecar>
    </>
  );
};

export default StepsSubmitMessages;
