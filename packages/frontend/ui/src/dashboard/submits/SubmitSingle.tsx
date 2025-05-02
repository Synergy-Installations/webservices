"use client";

import { useGetSubmitQuery } from "@com.synergy/frontend-backend-dashboard/submitApi";
import { DefaultFunnel } from "@com.synergy/frontend-ui/DefaultFunnel";
import { useUpdateSubmitMutation } from "@com.synergy/frontend-backend-dashboard/submitApi";
import { div } from "framer-motion/client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { set } from "mongoose";

/* eslint-disable-next-line */
export interface SubmitSingleProps {
  params: { id: string };
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
  stepsListOpen?: boolean;
  setStepsListOpen?: (open: boolean) => void;
}

export const TopBarSubmitSingle = ({
  id,
  submit,
  questionElements,
  isGetSubmitLoading,
  isGetSubmitError,
  submitOpen,
  setSubmitOpen,
  stepsListOpen,
  setStepsListOpen,
}: {
  id: string;
  submit: any | undefined;
  questionElements: any;
  isGetSubmitLoading: boolean;
  isGetSubmitError: any | undefined;
  submitOpen: boolean;
  setSubmitOpen: (open: boolean) => void;
  stepsListOpen?: boolean;
  setStepsListOpen?: (open: boolean) => void;
}) => {
  const [updateSubmit, { status }] = useUpdateSubmitMutation();

  const { user } = useUser();

  const [editingStatus, setEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState<{
    code: string;
    message: string;
    color: string;
  }>({
    code: submit?.status?.code,
    message: submit?.status?.message,
    color: submit?.status?.color,
  });

  useEffect(() => {
    if (!isGetSubmitLoading && submit?.status) {
      setStatusInput({
        code: submit.status.code,
        message: submit.status.message,
        color: submit.status.color,
      });
    }
  }, [isGetSubmitLoading, submit?.status]);

  const handleSave = () => {
    updateSubmit({
      _id: id,
      data: Object.keys(questionElements).reduce(
        (acc, key: string) => ({ ...acc, [key]: questionElements[key] }),
        {}
      ),
    });
  };
  console.log("topBarSubmitSingleStatus", status, submit);

  if (isGetSubmitError) {
    return (
      <div className="flex items-center mt-14 w-full z-50 top-[58px] p-2 border-b border-synergy-light-grey bg-white text-red-500">
        {/* <p
          className="text-lg font-bold text-blue-500 inline"
          style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
        >
          Don't panic
        </p>{" "} */}
        Ein Fehler ist aufgetreten. Bitte laden Sie die Seite neu oder versuchen
        Sie es später erneut.
      </div>
    );
  }

  return (
    <div className="mt-14 w-full z-50 top-[58px] py-2 border-b border-synergy-light-grey bg-white">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 px-4">
        {isGetSubmitLoading ? (
          <div className="animate-pulse h-14 w-full flex flex-col justify-center">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        ) : (
          <div className="min-h-14 w-full gap-4">
            <div className="">Anfrage #{submit?._id}</div>
            {submit?.status &&
              (editingStatus ? (
                <div className="grid gap-1 mt-1">
                  {Object.keys(statusInput).map((key) => (
                    <div className="" key={key}>
                      <div
                        key={key}
                        className="flex items-center justify-start gap-2"
                      >
                        <div className="w-max">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: submit?.status?.color }}
                          ></div>
                        </div>
                        <p className="text-sm font-medium">{key}:</p>
                        <input
                          type="text"
                          value={statusInput[key as keyof typeof statusInput]}
                          onChange={(e) =>
                            setStatusInput({
                              ...statusInput,
                              [key]: e.target.value,
                            })
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={async () => {
                      await updateSubmit({ _id: id, status: statusInput });
                      setEditingStatus(false);
                    }}
                    className="flex gap-1 justify-center items-center px-2 py-1 bg-synergy-light-blue rounded-lg text-white"
                  >
                    Status speichern
                    {status === "pending" && (
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="inline w-4 h-4 text-white animate-spin"
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
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: submit.status?.color }}
                    ></div>
                    <p className="text-sm font-medium">Status:</p>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {submit.status?.message}
                  </p>
                  {Array.isArray(
                    (user?.publicMetadata as { accessRights?: string[] })
                      ?.accessRights
                  ) &&
                    ((
                      (user?.publicMetadata as { accessRights?: string[] })
                        ?.accessRights ?? []
                    ).includes("all:status") ||
                      (
                        (user?.publicMetadata as { accessRights?: string[] })
                          ?.accessRights ?? []
                      ).includes("all:*")) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingStatus(true)}
                          className="flex items-center gap-1 text-synergy-light-blue"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4.5 1.125 1.125-4.5L16.862 3.487z"
                            />
                          </svg>
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                </div>
              ))}
          </div>
        )}

        <div
          className={`flex gap-2 w-full md:w-auto ${setStepsListOpen ? "justify-between" : "justify-end"} text-sm font-medium text-gray-800 dark:text-gray-400`}
        >
          {setStepsListOpen && (
            <button
              onClick={() =>
                setStepsListOpen && setStepsListOpen(!stepsListOpen)
              }
              className="inline-flex md:hidden items-center w-max px-4 py-2 rounded-lg hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="whitespace-nowrap">
                Schritte {stepsListOpen ? "schließen" : "öffnen"}
              </span>
            </button>
          )}
          {/* <li>
            <a
              href="#"
              className="inline-flex items-center px-4 py-3 rounded-lg hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-full dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                className="w-4 h-4 me-2 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 18"
              >
                <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
              </svg>
              Dashboard
            </a>
          </li> */}
          <div className="grid xs:flex gap-2">
            <button
              onClick={() => setSubmitOpen(!submitOpen)}
              className="inline-flex items-center lg:hidden w-max px-4 py-2 rounded-lg hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="whitespace-nowrap">
                Anfrage {submitOpen ? "schließen" : "öffnen"}
              </span>
            </button>
            <button
              onClick={() => handleSave()}
              className={`inline-flex ${submitOpen ? "block" : "hidden lg:block"} items-center gap-1 w-max px-4 py-2 rounded-lg text-gray-100 hover:text-white bg-synergy-light-blue dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white`}
            >
              <span className="">Speichern</span>
              {status === "pending" && (
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 text-white animate-spin"
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
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SubmitSingle = (props: SubmitSingleProps) => {
  const { STORAGE_ZONE_ACCESS_KEY, stepsListOpen, setStepsListOpen } = props;

  const submitAside = useRef<HTMLDivElement>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [questionElements, setQuestionElements] = useState<any>({});

  console.log("SubmitSingle", props.params.id);

  const {
    data: submit,
    isLoading: isGetSubmitLoading,
    error: isGetSubmitError,
  } = useGetSubmitQuery(props.params.id, {
    skip: !props.params,
  });

  return (
    <div>
      <div className="">
        <TopBarSubmitSingle
          id={props.params.id}
          submit={submit?.data[0]}
          questionElements={questionElements}
          isGetSubmitLoading={isGetSubmitLoading}
          isGetSubmitError={isGetSubmitError}
          submitOpen={submitOpen}
          setSubmitOpen={setSubmitOpen}
          stepsListOpen={stepsListOpen}
          setStepsListOpen={setStepsListOpen}
        />
      </div>
      <aside
        id="logo-sidebar"
        ref={submitAside}
        className={`fixed right-0 z-10 w-96 h-screen transition-transform ${submitOpen ? "lg:translate-x-0" : "translate-x-full"} bg-white border-l border-gray-200 lg:translate-x-0 dark:bg-gray-800 dark:border-gray-700`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <div className="">
            {isGetSubmitLoading ? (
              <div
                role="status"
                className="max-w-md p-4 space-y-4 animate-pulse md:p-6"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between pt-4"
                  >
                    <div>
                      <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    </div>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
                  </div>
                ))}
                <span className="sr-only">Loading...</span>
              </div>
            ) : isGetSubmitError ? (
              <div className="flex items-center max-w-md p-2 space-y-4 w-full text-red-500">
                {/* <p
                    className="text-lg font-bold text-blue-500 inline"
                    style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                  >
                    Don't panic
                  </p>{" "} */}
                Ein Fehler ist aufgetreten. Bitte laden Sie die Seite neu oder
                versuchen Sie es später erneut.
              </div>
            ) : (
              submit?.data && (
                <DefaultFunnel
                  questionElementsRaw={submit?.data[0].data || {}}
                  STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
                  config={{
                    format: {
                      useKey: true,
                      useStrings: false,
                      useSelected: true,
                      useUidAsKey: true,
                    },
                  }}
                  ui={{
                    progressContainerClassNames:
                      "sticky bg-white pt-0 pr-0 top-6 w-full z-50",
                    progressContainerBackground: true,
                    sectionContainerClassNames: "mt-10 last:pb-32",
                  }}
                >
                  {(questionElements) => setQuestionElements(questionElements)}
                </DefaultFunnel>
              )
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SubmitSingle;
