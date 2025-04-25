import StepsSubmitMessages from "@com.synergy/frontend-ui/StepsSubmitMessages";

export default function Page({
  params,
}: {
  params: { id: string; stepId: string };
}): JSX.Element {
  return <StepsSubmitMessages params={params} />;
}
