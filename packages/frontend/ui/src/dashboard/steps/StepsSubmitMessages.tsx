import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import StepsList from "./StepsList";
import SingleStepTabs from "./tabs/SingleStepTabs";
import StepSingle from "./StepSingle";
import MessageSubmit from "../messages/MessageSubmit";

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

  return (
    <div className="flex justify-between h-full lg:mr-96">
      <div className="h-full w-1/2">
        <SingleSubmitTabs params={params} />
        <StepsList className="" params={params} />
      </div>
      <div className="w-1/2 border-l border-gray-200">
        <SingleStepTabs params={params} />
        <div className="flex flex-col justify-between relative h-full">
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
    </div>
  );
};

export default StepsSubmitMessages;
