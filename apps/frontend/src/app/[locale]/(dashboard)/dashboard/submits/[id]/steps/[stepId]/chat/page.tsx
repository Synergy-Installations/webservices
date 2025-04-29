import StepsSubmitMessages from "@com.synergy/frontend-ui/StepsSubmitMessages";

export default function Page({
  params,
}: {
  params: { id: string; stepId: string };
}): JSX.Element {
  return (
    <StepsSubmitMessages
      params={params}
      STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
      STORAGE_ZONE_REGION={process.env.STORAGE_ZONE_REGION}
      STORAGE_ZONE_BASE_HOSTNAME={process.env.STORAGE_ZONE_BASE_HOSTNAME}
      STORAGE_ZONE_NAME={process.env.STORAGE_ZONE_NAME}
    />
  );
}
