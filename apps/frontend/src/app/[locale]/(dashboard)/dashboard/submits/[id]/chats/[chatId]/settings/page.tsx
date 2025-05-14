import ChatSubmitSettings from "@com.synergy/frontend-ui/ChatSubmitSettings";

export default function Page({
  params,
}: {
  params: { id: string; chatId: string };
}): JSX.Element {
  return <ChatSubmitSettings params={params} />;
}
