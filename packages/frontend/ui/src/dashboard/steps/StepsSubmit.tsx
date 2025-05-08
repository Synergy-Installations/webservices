import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import StepsList from "./StepsList";
import { SubmitSingle } from "@com.synergy/frontend-ui/SubmitSingle";

/* eslint-disable-next-line */
export interface StepsSubmitProps {
  params: { id: string };
}

export interface IsUpdateSubmitLoadingState {
  assets?: boolean;
  membersRights?: boolean;
}

export const StepsSubmit = (props: StepsSubmitProps) => {
  const { params } = props;

  return (
    <>
      <SubmitSingle
        params={params}
        STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
      />
      <SingleSubmitTabs params={params} />
      <StepsList className={"lg:mr-96"} params={params} />
    </>
  );
};

export default StepsSubmit;
