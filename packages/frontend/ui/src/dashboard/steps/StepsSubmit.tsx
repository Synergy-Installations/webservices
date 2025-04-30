import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import StepsList from "./StepsList";

/* eslint-disable-next-line */
export interface StepsSubmitProps {
  params: { id: string };
}

export interface IsUpdateSubmitLoadingState {
  assets: boolean;
}

export const StepsSubmit = (props: StepsSubmitProps) => {
  const { params } = props;

  return (
    <div className="h-full">
      <SingleSubmitTabs params={params} />
      <StepsList className={"lg:mr-96"} params={params} />
    </div>
  );
};

export default StepsSubmit;
