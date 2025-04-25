import { StepSubmit } from "@com.synergy/frontend-ui/StepSubmit";

export default function Page({
  params,
}: {
  params: { id: string; stepId: string };
}): JSX.Element {
  return <StepSubmit params={params} />;
}
