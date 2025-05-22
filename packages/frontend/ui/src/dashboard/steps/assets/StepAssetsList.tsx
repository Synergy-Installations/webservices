"use client";

import {
  useGetStepQuery,
  useUpdateStepMutation,
} from "@com.synergy/frontend-backend-dashboard/stepApi";
import { IsUpdateStepLoadingState } from "../StepSubmit";
import { useEffect, useState } from "react";
import { Types } from "mongoose";
import {
  AssetInterface,
  StepInterface,
} from "@com.synergy/frontend-backend-dashboard/step";
import FileUpload from "../../shared/file-upload/FileUpload";

/* eslint-disable-next-line */
export interface StepAssetsListProps {
  params: { id: string; stepId: string };
  saveStepToggle: boolean;
  setSaveStepToggle: (saveStepToggle: boolean) => void;
  editStepToggle: boolean;
  setEditStepToggle: (editStepToggle: boolean) => void;
  isUpdateStepLoading: IsUpdateStepLoadingState;
  setIsUpdateStepLoading: React.Dispatch<
    React.SetStateAction<IsUpdateStepLoadingState>
  >;
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const StepAssetsList = (props: StepAssetsListProps) => {
  const {
    params,
    params: { id: submitId, stepId },
    saveStepToggle,
    setSaveStepToggle,
    editStepToggle,
    setEditStepToggle,
    isUpdateStepLoading,
    setIsUpdateStepLoading,
    STORAGE_ZONE_ACCESS_KEY,
    STORAGE_ZONE_REGION,
    STORAGE_ZONE_BASE_HOSTNAME,
    STORAGE_ZONE_NAME,
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
    assets: step?.data.step.assets,
  });

  useEffect(() => {
    console.log("editStepEffect", editStep);
    setEditStep({
      ...editStep,
      _id: new Types.ObjectId(stepId).toString(),
      submitId: new Types.ObjectId(submitId),
    });
  }, [stepId, submitId]);

  useEffect(() => {
    setEditStep({
      ...editStep,
      title: step?.data.step.title,
      assets: step?.data.step.assets,
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
    if (saveStepToggle) {
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

  return (
    <div className="overflow-y-auto h-full pb-48 grid gap-2">
      {editStepToggle && (
        <FileUpload
          submitId={submitId}
          stepId={stepId}
          setAssets={(asset) => {
            if (typeof asset === "function") {
              setEditStep((prev) => ({
                ...prev,
                assets:
                  asset instanceof Function
                    ? // @ts-ignore
                      asset({ assets: prev.assets as AssetInterface[] }).assets
                    : [...(prev.assets || []), asset],
              }));
            } else {
              setEditStep((prev) => ({
                ...prev,
                assets: [...(prev.assets || []), asset],
              }));
            }
          }}
          assets={editStep.assets}
          STORAGE_ZONE_REGION={STORAGE_ZONE_REGION}
          STORAGE_ZONE_BASE_HOSTNAME={STORAGE_ZONE_BASE_HOSTNAME}
          STORAGE_ZONE_NAME={STORAGE_ZONE_NAME}
          STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
        />
      )}
      <div className="relative flex flex-col w-full px-2 gap-2">
        {!editStepToggle &&
          step?.data?.step?.assets?.map((file, index: number) => (
            <div
              key={index}
              className="flex-col md:flex md:flex-row-reverse items-center justify-between gap-2 w-full p-2 border rounded-lg"
            >
              <div className="flex justify-end items-center gap-2 w-full">
                <p
                  className={`text-sm ${file.status === "error" ? "text-red-600 dark:text-red-500" : file.status === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
                >
                  {file.status === "uploading"
                    ? "Uploading..."
                    : file.status === "uploaded"
                      ? "Uploaded"
                      : file.status === "error" && "Error"}
                </p>
                <button
                  className=""
                  onClick={() => {
                    fetch(
                      `https://${STORAGE_ZONE_NAME}.b-cdn.net${file.filePath}`,
                      {
                        method: "GET",
                        headers: {
                          "Content-Type": file.type,
                        },
                      }
                    )
                      .then((response) => response.blob())
                      .then((blob) => {
                        // Create blob link to download
                        const url = window.URL.createObjectURL(blob);

                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", file.name);

                        // Append to html link element page
                        document.body.appendChild(link);

                        // Start download
                        link.click();

                        // Clean up and remove the link
                        link.parentNode?.removeChild(link);
                      });
                  }}
                >
                  <svg
                    className="w-6 h-6 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M18,9h-2c-0.6,0-1,0.4-1,1s0.4,1,1,1h2c0.6,0,1,0.4,1,1v7c0,0.6-0.4,1-1,1H6c-0.6,0-1-0.4-1-1v-7c0-0.6,0.4-1,1-1h2c0.6,0,1-0.4,1-1S8.6,9,8,9H6c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h12c1.7,0,3-1.3,3-3v-7C21,10.3,19.7,9,18,9z M8.3,14.7l3,3c0.2,0.2,0.4,0.3,0.7,0.3c0.3,0,0.5-0.1,0.7-0.3l3-3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L13,14.6V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v11.6l-1.3-1.3c-0.4-0.4-1-0.4-1.4,0C7.9,13.7,7.9,14.3,8.3,14.7z"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="flex items-center w-full">
                <div className="grid lg:flex gap-2 items-center">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={`https://${STORAGE_ZONE_NAME}.b-cdn.net${file.filePath}`}
                      alt=""
                      className="max-w-40"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-10"
                      id="file"
                    >
                      <path
                        fill="#000000"
                        d="M20,8.94a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19l-.09,0L13.06,2H7A3,3,0,0,0,4,5V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V9S20,9,20,8.94ZM14,5.41,16.59,8H14ZM18,19a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V5A1,1,0,0,1,7,4h5V9a1,1,0,0,0,1,1h5Z"
                      ></path>
                    </svg>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StepAssetsList;
