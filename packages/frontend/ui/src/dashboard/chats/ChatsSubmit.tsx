import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import { SubmitSingle } from "@com.synergy/frontend-ui/SubmitSingle";
import ChatsList from "@com.synergy/frontend-ui/ChatsList";

/* eslint-disable-next-line */
export interface StepsSubmitProps {
  params: { id: string };
}

export interface IsUpdateSubmitLoadingState {
  assets?: boolean;
  membersRights?: boolean;
}

export const ChatsSubmit = (props: StepsSubmitProps) => {
  const { params } = props;

  return (
    <>
      <SubmitSingle
        params={params}
        STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
      />
      <SingleSubmitTabs params={params} />
      <ChatsList className={""} params={params} />
    </>
  );
};

export default ChatsSubmit;
