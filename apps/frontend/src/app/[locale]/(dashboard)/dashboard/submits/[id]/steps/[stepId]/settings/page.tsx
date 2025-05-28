import StepSubmitSettings from "@com.synergy/frontend-ui/StepSubmitSettings";

export default function Page({
  params,
}: {
  params: { id: string; stepId: string };
}): JSX.Element {
  return <StepSubmitSettings params={params} />;
}
