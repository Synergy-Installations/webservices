import { ChatsSubmit } from "@com.synergy/frontend-ui/ChatsSubmit";

export default function Page({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  return <ChatsSubmit params={params} />;
}
