"use client";
import { useEffect, useRef, useState } from "react";
import {
  MessageInterface,
  GetMessagesInterface,
} from "@com.synergy/frontend-backend-dashboard/message";
import {
  useAddMessageMutation,
  useGetMessagesQuery,
} from "@com.synergy/frontend-backend-dashboard/messageApi";
import { Types } from "mongoose";
import { useUser } from "@clerk/nextjs";

/* eslint-disable-next-line */
export interface MessageSubmitProps {
  params: { id: string; stepId?: string };
  style?: {
    addMessageFormClassName?: string;
    messageEndClassName?: string;
  };
}

export const MessageSubmit = (props: MessageSubmitProps) => {
  const { style } = props;
  const { id: submitId, stepId } = props.params;
  const [addMessage, { isLoading, error: addMessageError }] =
    useAddMessageMutation();
  const {
    data: messages,
    isLoading: isGetMessagesLoading,
    error: isGetMessagesError,
  } = useGetMessagesQuery(
    { submitId, stepId },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const user = useUser();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current && messages) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const [newMessage, setNewMessage] = useState<Partial<MessageInterface>>({
    submitId: new Types.ObjectId(submitId),
    ...(stepId && { stepId: new Types.ObjectId(stepId) }),
    message: "",
  });

  const createNewMessage = () => {
    addMessage({
      submitId: newMessage.submitId || new Types.ObjectId(submitId),
      ...(stepId && {
        stepId: newMessage.stepId || new Types.ObjectId(stepId),
      }),
      message: newMessage.message,
    });
    setNewMessage({ ...newMessage, message: "" });
  };

  return (
    <>
      <div
        className={`flex flex-col gap-2 px-4 self-start w-full h-full overflow-y-scroll`}
        ref={scrollContainerRef}
      >
        <div className="flex flex-col w-full gap-2 ">
          {isGetMessagesLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`flex items-start gap-2.5 min-w-40 bg-slgate-100 animate-pulse ${
                  index % 2 === 0 ? "self-start" : "self-end lg:mr-96"
                }`}
              >
                <div className="">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-3xl leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : isGetMessagesError ? (
            <div className="flex flex-col gap-2 p-4 items-center justify-center h-full">
              <p className="text-red-500 font-bold text-lg">
                Ein Fehler ist aufgetreten.
              </p>
              <p className="text-gray-500">
                Bitte laden Sie die Seite neu oder versuchen Sie es später
                erneut.
              </p>
            </div>
          ) : (
            messages?.data?.messages.map((message) => (
              <div
                className={`flex items-start gap-2.5 ${
                  user.user?.emailAddresses.some(
                    (e) => e.emailAddress === message.sentByUserId?.emailAddress
                  )
                    ? "self-end " + style?.messageEndClassName
                    : "self-start"
                }`}
                key={message._id}
              >
                <img
                  className="w-8 h-8 rounded-full"
                  src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  alt="Jese image"
                />
                <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {message.sentByUserId?.firstName || "Unbekannter User"}{" "}
                      {message.sentByUserId?.lastName}
                    </span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString("de-AT", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-normal pt-2 text-gray-900 dark:text-white">
                    {message.message}
                  </p>
                  {/* <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Sent
              </span> */}
                </div>
                <button
                  id="dropdownMenuIconButton"
                  data-dropdown-toggle="dropdownDots"
                  data-dropdown-placement="bottom-start"
                  className="hidden lg:inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
                  type="button"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 4 15"
                  >
                    <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </button>
                <div
                  id="dropdownDots"
                  className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600"
                >
                  <ul
                    className="py-2 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="dropdownMenuIconButton"
                  >
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Reply
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Forward
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Copy
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Report
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <form
        className={`flex flex-col items-center gap-2 p-4 pt-2 ${style?.addMessageFormClassName}`}
      >
        {addMessageError && (
          <span className="text-red-500 max-w-xl w-full text-left">
            Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
          </span>
        )}
        <div
          className={`flex items-center justify-center max-w-xl w-full ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          <label htmlFor="voice-search" className="sr-only">
            Message input
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 15a2 2 0 0 1-2 2H6l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="voice-search"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 pe-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Kommunizieren Sie direkt mit unserem Team..."
              required
              value={newMessage.message}
              onChange={(e) =>
                setNewMessage({ ...newMessage, message: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createNewMessage();
                  console.log("Message submitted:", newMessage);
                }
              }}
            />
            <button
              type="button"
              className="absolute inset-y-0 end-0 flex items-center pe-3"
            >
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7v3a5.006 5.006 0 0 1-5 5H6a5.006 5.006 0 0 1-5-5V7m7 9v3m-3 0h6M7 1h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3Z"
                />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            className="inline-flex group items-center py-2.5 px-3 ms-2 text-sm font-medium disabled:cursor-not-allowed text-white bg-synergy-light-blue rounded-lg border border-blue-400 hover:bg-synergy-light-blue focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={(e) => {
              e.preventDefault();
              createNewMessage();
              console.log("Message submitted:", newMessage);
            }}
            disabled={isLoading || newMessage.message === ""}
            title="Send message"
            aria-label="Send message"
            aria-describedby="message-input"
            aria-controls="message-input"
          >
            {isLoading ? (
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 me-2 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 me-2 transition-transform group-hover:translate-x-0.5 group-disabled:group-hover:translate-x-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M22 2 11 13"
                />
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M22 2 15 22l-4-9-9-4Z"
                />
              </svg>
            )}

            <span className="transition-transform group-hover:translate-x-0.5 group-disabled:group-hover:translate-x-0">
              Senden
            </span>
          </button>
        </div>
      </form>
    </>
  );
};

export default MessageSubmit;
