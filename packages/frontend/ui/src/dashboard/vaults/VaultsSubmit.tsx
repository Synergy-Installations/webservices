import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import { SubmitSingle } from "@com.synergy/frontend-ui/SubmitSingle";
import ChatsList from "@com.synergy/frontend-ui/ChatsList";
import VaultsList from "@com.synergy/frontend-ui/VaultsList";

/* eslint-disable-next-line */
export interface VaultsSubmitProps {
  params: { id: string };
}

export interface IsUpdateSubmitLoadingState {
  assets?: boolean;
  membersRights?: boolean;
}

export const VaultsSubmit = (props: VaultsSubmitProps) => {
  const { params } = props;

  return (
    <>
      <SubmitSingle
        params={params}
        STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
      />
      <SingleSubmitTabs params={params} />
      <VaultsList className={""} params={params} />
    </>
  );
};

export default VaultsSubmit;
