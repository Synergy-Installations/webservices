import { useEffect, useState } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "@com.synergy/frontend-backend-dashboard/hooks";
import {
  decrement,
  increment,
  incrementAsync,
  incrementByAmount,
  incrementIfOdd,
  selectCount,
  selectStatus,
} from "@com.synergy/frontend-backend-dashboard/counterSlice";
import {
  useGetItemsQuery,
  useAddItemMutation,
} from "@com.synergy/frontend-backend-dashboard/items";
import SubmitList from "@com.synergy/frontend-ui/SubmitList";
import { SubmitSingle } from "@com.synergy/frontend-ui/SubmitSingle";
import { MessageSubmit } from "@com.synergy/frontend-ui/MessageSubmit";
import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";

export default function Page({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  return (
    <>
      <SubmitSingle
        params={params}
        STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
      />
      <SingleSubmitTabs params={params} />
      <MessageSubmit
        params={params}
        STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
        STORAGE_ZONE_REGION={process.env.STORAGE_ZONE_REGION}
        STORAGE_ZONE_BASE_HOSTNAME={process.env.STORAGE_ZONE_BASE_HOSTNAME}
        STORAGE_ZONE_NAME={process.env.STORAGE_ZONE_NAME}
        style={{
          addMessageFormClassName: "",
          messageEndClassName: "",
        }}
      />
    </>
  );
}
