import VaultSubmitSettings from "@com.synergy/frontend-ui/VaultSubmitSettings";

export default function Page({
  params,
}: {
  params: { id: string; vaultId: string };
}): JSX.Element {
  return <VaultSubmitSettings params={params} />;
}
