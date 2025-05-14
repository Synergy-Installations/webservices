"use client";

import { useEffect, useState } from "react";
import { debounce } from "../../../shared/utils/debounce/Debounce";
import ChatsListSidecar from "../layout/ChatsListSidecar";
import SingleChatTabs from "../tabs/SingleChatTabs";
import ChatSettings from "./ChatSettings";

export interface IsUpdateChatLoadingState {
  titleDesc?: boolean;
  membersRights?: boolean;
}

/* eslint-disable-next-line */
export interface ChatSubmitSettingsProps {
  params: { id: string; chatId: string };
}

export const ChatSubmitSettings = (props: ChatSubmitSettingsProps) => {
  const { params } = props;

  const [saveChatToggle, setSaveChatToggle] = useState<boolean>(false);
  const [editChatToggle, setEditChatToggle] = useState<boolean>(false);
  const [chatsListOpen, setChatsListOpen] = useState(false);
  const [isUpdateChatLoading, setIsUpdateChatLoading] =
    useState<IsUpdateChatLoadingState>({
      titleDesc: false,
      membersRights: false,
    });

  console.log("saveChatToggle", saveChatToggle);

  const debouncedResetSaveEditChatToggle = debounce(() => {
    if (
      saveChatToggle &&
      !isUpdateChatLoading.titleDesc &&
      !isUpdateChatLoading.membersRights
    ) {
      console.log("debouncedResetSaveEditChatToggle");
      setSaveChatToggle(false);
      setEditChatToggle(false);
    } else {
      debouncedResetSaveEditChatToggle();
    }
  }, 50);

  useEffect(() => {
    debouncedResetSaveEditChatToggle();
  }, [isUpdateChatLoading]);

  return (
    <>
      <ChatsListSidecar
        params={params}
        stepsListOpen={chatsListOpen}
        setStepsListOpen={setChatsListOpen}
      >
        <div className="w-full md:w-1/2 border-l border-gray-200">
          <SingleChatTabs
            params={params}
            SingleChatTabsEdit={{
              saveChatToggle: saveChatToggle,
              setSaveChatToggle: setSaveChatToggle,
              editChatToggle: editChatToggle,
              setEditChatToggle: setEditChatToggle,
              isUpdateChatLoading: isUpdateChatLoading,
              setIsUpdateChatLoading: setIsUpdateChatLoading,
            }}
          />
          <ChatSettings
            params={params}
            saveChatToggle={saveChatToggle}
            setSaveChatToggle={setSaveChatToggle}
            editChatToggle={editChatToggle}
            setEditChatToggle={setEditChatToggle}
            isUpdateChatLoading={isUpdateChatLoading}
            setIsUpdateChatLoading={setIsUpdateChatLoading}
          />
        </div>
      </ChatsListSidecar>
    </>
  );
};

export default ChatSubmitSettings;
