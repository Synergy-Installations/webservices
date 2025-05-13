import { ChatSubmitMessages } from "@com.synergy/frontend-ui/ChatSubmitMessages";

export default function Page({
  params,
}: {
  params: { id: string; chatId: string };
}): JSX.Element {
  return (
    <ChatSubmitMessages
      params={params}
      STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
      STORAGE_ZONE_REGION={process.env.STORAGE_ZONE_REGION}
      STORAGE_ZONE_BASE_HOSTNAME={process.env.STORAGE_ZONE_BASE_HOSTNAME}
      STORAGE_ZONE_NAME={process.env.STORAGE_ZONE_NAME}
    />
  );
}
