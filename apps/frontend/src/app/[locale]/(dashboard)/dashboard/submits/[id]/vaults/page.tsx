import VaultsSubmit from "@com.synergy/frontend-ui/VaultsSubmit";

export default function Page({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  return <VaultsSubmit params={params} />;
}
