"use client";
import { useEffect, useState } from "react";
import ChatsListSidecar from "../layout/ChatsListSidecar";
import SingleChatTabs from "../tabs/SingleChatTabs";
import { debounce } from "../../../shared/utils/debounce/Debounce";
import { IsUpdateChatLoadingState } from "./ChatSubmitSettings";
import {
  useGetChatQuery,
  useUpdateChatMutation,
} from "@com.synergy/frontend-backend-dashboard/chatApi";
import { Types } from "mongoose";
import { desc } from "framer-motion/client";
import SumbitMembersRights from "../../submits/members/SumbitMembersRights";

/* eslint-disable-next-line */
export interface ChatSettingsProps {
  params: { id: string; chatId: string };
  saveChatToggle: boolean;
  setSaveChatToggle: (saveChatToggle: boolean) => void;
  editChatToggle: boolean;
  setEditChatToggle: (editChatToggle: boolean) => void;
  isUpdateChatLoading: IsUpdateChatLoadingState;
  setIsUpdateChatLoading: React.Dispatch<
    React.SetStateAction<IsUpdateChatLoadingState>
  >;
}

export const ChatSettings = (props: ChatSettingsProps) => {
  const {
    params,
    params: { id: submitId, chatId },
    saveChatToggle,
    setSaveChatToggle,
    editChatToggle,
    setEditChatToggle,
    isUpdateChatLoading,
    setIsUpdateChatLoading,
  } = props;

  const [
    updateChat,
    { isLoading: isUpdateChatMutationLoading, error: updateChatMutationError },
  ] = useUpdateChatMutation();

  const {
    data: chat,
    isLoading: isGetChatLoading,
    error,
  } = useGetChatQuery(
    { submitId: submitId, chatId },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const [editChat, setEditChat] = useState<Partial<any>>({
    _id: new Types.ObjectId(chatId),
    submitId: new Types.ObjectId(submitId),
    title: chat?.data.chat.title,
    description: chat?.data.chat.description,
  });

  useEffect(() => {
    console.log("editChatEffect", editChat);
    setEditChat({
      ...editChat,
      _id: new Types.ObjectId(chatId),
      submitId: new Types.ObjectId(submitId),
    });
  }, [chatId, submitId]);

  useEffect(() => {
    setEditChat({
      ...editChat,
      title: chat?.data.chat.title,
      description: chat?.data.chat.description,
    });
  }, [chat]);

  console.log(
    "editChat",
    chat?.data.chat,
    editChat,
    "loading?",
    isUpdateChatMutationLoading,
    isUpdateChatLoading
  );

  useEffect(() => {
    console.log("saveChatToggleBeforeIf", saveChatToggle);
    if (saveChatToggle) {
      console.log("saveChatToggle", editChat);
      // Set the loading state at the beginning in order to make sure we are handling the loading state
      // correctly in StepSingle in case other loading states from isUpdateChatLoading are false (due to no change)
      setIsUpdateChatLoading({
        ...isUpdateChatLoading,
        titleDesc: true,
      });
      updateChat(editChat);
    } else {
      // This is done in case we do not have any changes and the StepSubmit useEffect
      // needs the isUpdateChatLoading state to be updated in order to reset the saveChatToggle
      // and editChatToggle states
      setIsUpdateChatLoading({
        ...isUpdateChatLoading,
        titleDesc: false,
      });
    }
  }, [saveChatToggle]);

  useEffect(() => {
    if (isUpdateChatMutationLoading && !isUpdateChatLoading.titleDesc) {
      setIsUpdateChatLoading({
        ...isUpdateChatLoading,
        titleDesc: true,
      });
    } else if (!isUpdateChatMutationLoading && isUpdateChatLoading.titleDesc) {
      setIsUpdateChatLoading({
        ...isUpdateChatLoading,
        titleDesc: false,
      });
    }
  }, [isUpdateChatMutationLoading]);

  return (
    <div className={`flex flex-col gap-2 overflow-y-scroll h-full pb-48`}>
      <div className="h-full overflow-y-scroll px-4 pb-4">
        {isGetChatLoading ? (
          <div className="flex flex-col gap-2 animate-pulse px-4 pb-4">
            {Array.from({ length: 1 }).map((_, index) => (
              <div role="status" className="max-w-sm animate-pulse pt-2">
                <div className="h-6 bg-gray-200 rounded-lg dark:bg-gray-700 w-48 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                <span className="sr-only">Loading...</span>
              </div>
            ))}
          </div>
        ) : editChatToggle ? (
          <>
            <input
              type="text"
              className="text-2xl font-bold rounded-lg border-none p-0"
              value={editChat?.title}
              onChange={(e) =>
                setEditChat({
                  ...editChat,
                  title: e.target.value,
                })
              }
            />
            <textarea
              className="w-full rounded-lg border border-gray-300 text-gray-700 p-2"
              value={editChat?.description}
              onChange={(e) =>
                setEditChat({
                  ...editChat,
                  description: e.target.value,
                })
              }
            />
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold">{chat?.data.chat.title}</h3>
            <p className="text-gray-700">{chat?.data.chat.description}</p>
          </>
        )}
        <SumbitMembersRights
          params={params}
          submit={chat?.data.chat}
          updateSubmit={updateChat}
          isGetSubmitLoading={isGetChatLoading}
          isUpdateSubmitMutationLoading={isUpdateChatMutationLoading}
          saveSubmitToggle={saveChatToggle}
          setSaveSubmitToggle={setSaveChatToggle}
          editSubmitToggle={editChatToggle}
          setEditSubmitToggle={setEditChatToggle}
          isUpdateSubmitLoading={isUpdateChatLoading}
          setIsUpdateSubmitLoading={setIsUpdateChatLoading}
          styles={{ containerClassName: "w-full mt-4" }}
        />
      </div>
    </div>
  );
};

export default ChatSettings;
