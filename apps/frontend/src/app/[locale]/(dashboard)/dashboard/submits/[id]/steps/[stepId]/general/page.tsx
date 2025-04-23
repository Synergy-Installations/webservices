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
import { StepSubmit } from "@com.synergy/frontend-ui/StepSubmit";

export default function Page({
  params,
}: {
  params: { id: string; stepId: string };
}): JSX.Element {
  return <StepSubmit params={params} />;
}
