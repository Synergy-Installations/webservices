"use client";
import MessageSubmit from "../messages/MessageSubmit";
import StepsListSidecar from "@com.synergy/frontend-ui/StepsListSidecar";
import { SingleChatTabs } from "@com.synergy/frontend-ui/SingleChatTabs";
import { useState } from "react";
import ChatsListSidecar from "./layout/ChatsListSidecar";

/* eslint-disable-next-line */
export interface ChatSubmitMessagesProps {
  params: { id: string; chatId: string };
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const ChatSubmitMessages = (props: ChatSubmitMessagesProps) => {
  const {
    params,
    STORAGE_ZONE_ACCESS_KEY,
    STORAGE_ZONE_REGION,
    STORAGE_ZONE_BASE_HOSTNAME,
    STORAGE_ZONE_NAME,
  } = props;

  const [stepsListOpen, setStepsListOpen] = useState(false);

  return (
    <>
      <ChatsListSidecar
        params={params}
        stepsListOpen={stepsListOpen}
        setStepsListOpen={setStepsListOpen}
      >
        <div className="w-full md:w-1/2 border-l border-gray-200">
          <SingleChatTabs params={params} />
          <div className="flex flex-col justify-between relative h-screen">
            <MessageSubmit
              params={params}
              style={{ addMessageFormClassName: "pb-48 lg:pb-48" }}
              STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
              STORAGE_ZONE_REGION={STORAGE_ZONE_REGION}
              STORAGE_ZONE_BASE_HOSTNAME={STORAGE_ZONE_BASE_HOSTNAME}
              STORAGE_ZONE_NAME={STORAGE_ZONE_NAME}
            />
          </div>
        </div>
      </ChatsListSidecar>
    </>
  );
};

export default ChatSubmitMessages;
