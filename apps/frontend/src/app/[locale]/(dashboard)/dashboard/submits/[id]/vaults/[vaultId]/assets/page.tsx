import VaultSubmitAssets from "@com.synergy/frontend-ui/VaultSubmitAssets";

export default function Page({
  params,
}: {
  params: { id: string; vaultId: string };
}): JSX.Element {
  return (
    <VaultSubmitAssets
      params={params}
      STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
      STORAGE_ZONE_REGION={process.env.STORAGE_ZONE_REGION}
      STORAGE_ZONE_BASE_HOSTNAME={process.env.STORAGE_ZONE_BASE_HOSTNAME}
      STORAGE_ZONE_NAME={process.env.STORAGE_ZONE_NAME}
    />
  );
}
