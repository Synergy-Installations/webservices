import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import StepsList from "./StepsList";
import SingleStepTabs from "./tabs/SingleStepTabs";
import StepSingle from "./StepSingle";

/* eslint-disable-next-line */
export interface StepSubmitProps {
  params: { id: string; stepId: string };
}

export const StepSubmit = (props: StepSubmitProps) => {
  const { params } = props;

  return (
    <div className="flex justify-between h-full lg:mr-96">
      <div className="h-full w-1/2">
        <SingleSubmitTabs params={params} />
        <StepsList className="" params={params} />
      </div>
      <div className="w-1/2 border-l border-gray-200">
        <SingleStepTabs params={params} />
        <StepSingle params={params} />
      </div>
    </div>
  );
};

export default StepSubmit;
