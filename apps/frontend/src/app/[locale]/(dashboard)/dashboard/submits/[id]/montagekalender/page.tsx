import { SubmitMontagekalender } from "@com.synergy/frontend-ui/SubmitMontagekalender";

export default function Page({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  return <SubmitMontagekalender params={params} />;
}
