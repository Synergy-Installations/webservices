"use client";

import {
  useGetStepQuery,
  useUpdateStepMutation,
} from "@com.synergy/frontend-backend-dashboard/stepApi";
import StepEditor from "./editor/StepEditor";
import { div, input } from "framer-motion/client";
import { useEffect, useState } from "react";
import { IsUpdateStepLoadingState } from "./StepSubmit";
import { Types } from "mongoose";
import { generateHTML } from "@tiptap/react";
import { extensions } from "./editor/StepEditor";
import DOMPurify from "dompurify";

/* eslint-disable-next-line */
export interface StepSingleProps {
  params: { id: string; stepId: string };
  saveStepToggle: boolean;
  setSaveStepToggle: (saveStepToggle: boolean) => void;
  editStepToggle: boolean;
  setEditStepToggle: (editStepToggle: boolean) => void;
  isUpdateStepLoading: IsUpdateStepLoadingState;
  setIsUpdateStepLoading: React.Dispatch<
    React.SetStateAction<IsUpdateStepLoadingState>
  >;
}

export const StepSingle = (props: StepSingleProps) => {
  const {
    params,
    params: { id: submitId, stepId },
    saveStepToggle,
    setSaveStepToggle,
    editStepToggle,
    setEditStepToggle,
    isUpdateStepLoading,
    setIsUpdateStepLoading,
  } = props;

  const [
    updateStep,
    { isLoading: isUpdateStepMutationLoading, error: updateStepMutationError },
  ] = useUpdateStepMutation();

  const {
    data: step,
    isLoading: isGetStepLoading,
    error,
  } = useGetStepQuery(
    { submitId: submitId, stepId: stepId },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const [editStep, setEditStep] = useState<Partial<any>>({
    _id: new Types.ObjectId(stepId),
    submitId: new Types.ObjectId(submitId),
    title: step?.data.step.title,
    status: {
      message: step?.data.step.status?.message,
      code: step?.data.step.status?.code,
      color: step?.data.step.status?.color,
    },
  });

  useEffect(() => {
    console.log("editStepEffect", editStep);
    setEditStep({
      ...editStep,
      _id: new Types.ObjectId(stepId),
      submitId: new Types.ObjectId(submitId),
    });
  }, [stepId, submitId]);

  useEffect(() => {
    setEditStep({
      ...editStep,
      title: step?.data.step.title,
      status: {
        message: step?.data.step.status?.message,
        code: step?.data.step.status?.code,
        color: step?.data.step.status?.color,
      },
    });
  }, [step]);

  console.log(
    "editStep",
    step?.data.step,
    editStep,
    "loading?",
    isUpdateStepMutationLoading,
    isUpdateStepLoading
  );

  useEffect(() => {
    if (
      saveStepToggle &&
      (step?.data.step.title !== editStep.title ||
        step?.data.step.status.message !== editStep.status.message ||
        step?.data.step.status.code !== editStep.status.code ||
        step?.data.step.status.color !== editStep.status.color)
    ) {
      console.log("saveStepToggle", editStep);
      // Set the loading state at the beginning in order to make sure we are handling the loading state
      // correctly in StepSingle in case other loading states from isUpdateStepLoading are false (due to no change)
      setIsUpdateStepLoading({
        ...isUpdateStepLoading,
        titleAndStatus: true,
      });
      updateStep(editStep);
    } else {
      // This is done in case we do not have any changes and the StepSubmit useEffect
      // needs the isUpdateStepLoading state to be updated in order to reset the saveStepToggle
      // and editStepToggle states
      setIsUpdateStepLoading({
        ...isUpdateStepLoading,
        titleAndStatus: false,
      });
    }
  }, [saveStepToggle]);

  useEffect(() => {
    if (isUpdateStepMutationLoading && !isUpdateStepLoading.titleAndStatus) {
      setIsUpdateStepLoading({ ...isUpdateStepLoading, titleAndStatus: true });
    } else if (
      !isUpdateStepMutationLoading &&
      isUpdateStepLoading.titleAndStatus
    ) {
      setIsUpdateStepLoading({ ...isUpdateStepLoading, titleAndStatus: false });
    }
  }, [isUpdateStepMutationLoading]);

  if (error) {
    return (
      <div className="flex flex-col gap-2 p-4 items-center justify-center h-full">
        <p className="text-red-500 font-bold text-lg">
          Ein Fehler ist aufgetreten.
        </p>
        <p className="text-gray-500">
          Bitte laden Sie die Seite neu oder versuchen Sie es später erneut.
        </p>
      </div>
    );
  }

  const descriptionHTML = step?.data.step.description
    ? DOMPurify.sanitize(generateHTML(step?.data.step.description, extensions))
    : "";
  console.log("descriptionHTML", descriptionHTML);

  return (
    <div
      className={`flex flex-col gap-2 overflow-y-scroll h-full pb-[11.5rem]`}
    >
      {isGetStepLoading ? (
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
      ) : (
        <div className="h-full overflow-y-scroll px-4 pb-4">
          {editStepToggle ? (
            <input
              type="text"
              className="text-2xl font-bold rounded-lg border-none p-0"
              value={editStep?.title}
              onChange={(e) =>
                setEditStep({
                  ...editStep,
                  title: e.target.value,
                })
              }
            />
          ) : (
            <h3 className="text-2xl font-bold">{step?.data.step.title}</h3>
          )}
          {editStepToggle ? (
            <div className="grid gap-1 mt-1">
              {Object.keys(editStep.status).map((key) => (
                <div className="" key={key}>
                  <div
                    key={key}
                    className="flex items-center justify-start gap-2"
                  >
                    <div className="w-max">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: editStep?.status?.color }}
                      ></div>
                    </div>
                    <p className="text-sm font-medium">{key}:</p>
                    <input
                      type="text"
                      value={
                        editStep.status[key as keyof typeof editStep.status]
                      }
                      onChange={(e) =>
                        setEditStep({
                          ...editStep,
                          status: {
                            ...editStep.status,
                            [key]: e.target.value,
                          },
                          [key]: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            step?.data.step.status && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: step?.data.step.status?.color }}
                ></div>
                <p className="text-sm font-medium">
                  Status: {step?.data.step?.status?.message}
                </p>
              </div>
            )
          )}
          <div className="mt-4">
            {editStepToggle ? (
              <StepEditor
                saveStepToggle={saveStepToggle}
                setSaveStepToggle={setSaveStepToggle}
                editStepToggle={editStepToggle}
                setEditStepToggle={setEditStepToggle}
                isUpdateStepLoading={isUpdateStepLoading}
                setIsUpdateStepLoading={setIsUpdateStepLoading}
                params={params}
              />
            ) : (
              <div
                className="format"
                dangerouslySetInnerHTML={{ __html: descriptionHTML }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepSingle;
