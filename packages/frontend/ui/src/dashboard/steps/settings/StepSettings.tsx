"use client";
import {
  useGetStepQuery,
  useUpdateStepMutation,
} from "@com.synergy/frontend-backend-dashboard/stepApi";
import { IsUpdateStepLoadingState } from "@com.synergy/frontend-ui/StepSubmit";
import { useEffect, useState } from "react";
import { Types } from "mongoose";
import SumbitMembersRights from "../../submits/members/SumbitMembersRights";

/* eslint-disable-next-line */
export interface StepSettingsProps {
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

export const StepSettings = (props: StepSettingsProps) => {
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
    { submitId: submitId, stepId },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  // const [editStep, setEditStep] = useState<Partial<any>>({
  //   _id: new Types.ObjectId(stepId),
  //   submitId: new Types.ObjectId(submitId),
  //   title: step?.data.step.title,
  //   description: step?.data.step.description,
  // });

  // useEffect(() => {
  //   console.log("editStepEffect", editStep);
  //   setEditStep({
  //     ...editStep,
  //     _id: new Types.ObjectId(stepId),
  //     submitId: new Types.ObjectId(submitId),
  //   });
  // }, [stepId, submitId]);

  // useEffect(() => {
  //   setEditStep({
  //     ...editStep,
  //     title: step?.data.step.title,
  //     description: step?.data.step.description,
  //   });
  // }, [step]);

  // console.log(
  //   "editStep",
  //   step?.data.step,
  //   editStep,
  //   "loading?",
  //   isUpdateStepMutationLoading,
  //   isUpdateStepLoading
  // );

  // useEffect(() => {
  //   console.log("saveStepToggleBeforeIf", saveStepToggle);
  //   if (saveStepToggle) {
  //     console.log("saveStepToggle", editStep);
  //     // Set the loading state at the beginning in order to make sure we are handling the loading state
  //     // correctly in StepSingle in case other loading states from isUpdateStepLoading are false (due to no change)
  //     setIsUpdateStepLoading({
  //       ...isUpdateStepLoading,
  //       titleDesc: true,
  //     });
  //     updateStep(editStep);
  //   } else {
  //     // This is done in case we do not have any changes and the StepSubmit useEffect
  //     // needs the isUpdateStepLoading state to be updated in order to reset the saveStepToggle
  //     // and editStepToggle states
  //     setIsUpdateStepLoading({
  //       ...isUpdateStepLoading,
  //       titleDesc: false,
  //     });
  //   }
  // }, [saveStepToggle]);

  // useEffect(() => {
  //   if (isUpdateStepMutationLoading && !isUpdateStepLoading.titleDesc) {
  //     setIsUpdateStepLoading({
  //       ...isUpdateStepLoading,
  //       titleDesc: true,
  //     });
  //   } else if (!isUpdateStepMutationLoading && isUpdateStepLoading.titleDesc) {
  //     setIsUpdateStepLoading({
  //       ...isUpdateStepLoading,
  //       titleDesc: false,
  //     });
  //   }
  // }, [isUpdateStepMutationLoading]);

  return (
    <div className={`flex flex-col gap-2 overflow-y-scroll h-full pb-48`}>
      <div className="h-full overflow-y-scroll px-4 pb-4">
        {/* {isGetStepLoading ? (
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
        ) : editStepToggle ? (
          <>
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
            <textarea
              className="w-full rounded-lg border border-gray-300 text-gray-700 p-2"
              value={editStep?.description}
              onChange={(e) =>
                setEditStep({
                  ...editStep,
                  description: e.target.value,
                })
              }
            />
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold">{step?.data.step.title}</h3>
            <p className="text-gray-700">{step?.data.step.description}</p>
          </>
        )} */}
        <SumbitMembersRights
          params={params}
          submit={step?.data.step}
          updateSubmit={updateStep}
          isGetSubmitLoading={isGetStepLoading}
          isUpdateSubmitMutationLoading={isUpdateStepMutationLoading}
          saveSubmitToggle={saveStepToggle}
          setSaveSubmitToggle={setSaveStepToggle}
          editSubmitToggle={editStepToggle}
          setEditSubmitToggle={setEditStepToggle}
          isUpdateSubmitLoading={isUpdateStepLoading}
          setIsUpdateSubmitLoading={setIsUpdateStepLoading}
          styles={{ containerClassName: "w-full mt-4" }}
        />
      </div>
    </div>
  );
};

export default StepSettings;
