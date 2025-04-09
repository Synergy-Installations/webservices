"use client";

import { useGetSubmitQuery } from "@com.synergy/frontend-backend-dashboard/submitApi";
import { DefaultFunnel } from "@com.synergy/frontend-ui/DefaultFunnel";

/* eslint-disable-next-line */
export interface SubmitSingleProps {
  params: { id: string };
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const SubmitSingle = (props: SubmitSingleProps) => {
  const { STORAGE_ZONE_ACCESS_KEY } = props;

  console.log("SubmitSingle", props.params.id);

  const { data: submit, isLoading } = useGetSubmitQuery(props.params.id, {
    skip: !props.params,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log("submit", submit.data[0].data);

  return (
    <div>
      <DefaultFunnel
        questionElementsRaw={submit.data[0].data}
        STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
        config={{
          format: { useUid: true, useStrings: false, useSelected: true },
        }}
      />
    </div>
  );
};

export default SubmitSingle;
