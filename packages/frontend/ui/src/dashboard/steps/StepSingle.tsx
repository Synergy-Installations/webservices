"use client";
import { useGetStepQuery } from "@com.synergy/frontend-backend-dashboard/stepApi";
import StepEditor from "./editor/StepEditor";

/* eslint-disable-next-line */
export interface StepSingleProps {
  params: { id: string; stepId: string };
}

export const StepSingle = (props: StepSingleProps) => {
  const {
    params: { id: submitId, stepId },
  } = props;

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

  return (
    <div
      className={`flex flex-col gap-2 overflow-y-scroll h-full pb-[11.5rem]`}
    >
      {isGetStepLoading ? (
        <div className="flex flex-col gap-2 animate-pulse">
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
          <h3 className="text-2xl font-bold">{step?.data.step.title}</h3>
          {step?.data.step.status && (
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: step?.data.step.status?.color }}
              ></div>
              <p className="text-sm font-medium">
                Status: {step?.data.step?.status?.message}
              </p>
            </div>
          )}
          <div className="mt-4">
            <StepEditor />
          </div>
        </div>
      )}
    </div>
  );
};

export default StepSingle;
