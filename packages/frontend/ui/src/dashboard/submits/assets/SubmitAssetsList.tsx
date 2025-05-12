"use client";
import {
  useGetSubmitQuery,
  useUpdateSubmitMutation,
} from "@com.synergy/frontend-backend-dashboard/submitApi";
import FileUpload from "../../shared/file-upload/FileUpload";
import { IsUpdateSubmitLoadingState } from "../../steps/StepsSubmit";
import { useEffect, useState } from "react";
import { Types } from "mongoose";

/* eslint-disable-next-line */
export interface SubmitAssetsListProps {
  params: { id: string };
  saveSubmitToggle: boolean;
  setSaveSubmitToggle: (saveSubmitToggle: boolean) => void;
  editSubmitToggle: boolean;
  setEditSubmitToggle: (editSubmitToggle: boolean) => void;
  isUpdateSubmitLoading: IsUpdateSubmitLoadingState;
  setIsUpdateSubmitLoading: React.Dispatch<
    React.SetStateAction<IsUpdateSubmitLoadingState>
  >;
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const SubmitAssetsList = (props: SubmitAssetsListProps) => {
  const {
    params,
    params: { id: submitId },
    saveSubmitToggle,
    setSaveSubmitToggle,
    editSubmitToggle,
    setEditSubmitToggle,
    isUpdateSubmitLoading,
    setIsUpdateSubmitLoading,
    STORAGE_ZONE_ACCESS_KEY,
    STORAGE_ZONE_REGION,
    STORAGE_ZONE_BASE_HOSTNAME,
    STORAGE_ZONE_NAME,
  } = props;

  const [
    updateSubmit,
    {
      isLoading: isUpdateSubmitMutationLoading,
      error: updateSubmitMutationError,
    },
  ] = useUpdateSubmitMutation();

  const {
    data: submit,
    isLoading: isGetSubmitLoading,
    error,
  } = useGetSubmitQuery(submitId, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });

  const [editSubmit, setEditSubmit] = useState<Partial<any>>({
    _id: new Types.ObjectId(submitId),
    assets: submit?.data.assets,
  });

  useEffect(() => {
    console.log("editSubmitEffect", editSubmit);
    setEditSubmit({
      ...editSubmit,
      _id: new Types.ObjectId(submitId),
    });
  }, [submitId]);

  useEffect(() => {
    setEditSubmit({
      ...editSubmit,
      assets: submit?.data.assets,
    });
  }, [submit]);

  console.log(
    "editSubmit",
    submit?.data,
    editSubmit,
    "loading?",
    isUpdateSubmitMutationLoading,
    isUpdateSubmitLoading
  );

  useEffect(() => {
    if (saveSubmitToggle) {
      console.log("saveSubmitToggle", editSubmit);
      // Set the loading state at the beginning in order to make sure we are handling the loading state
      // correctly in SubmitSingle in case other loading states from isUpdateSubmitLoading are false (due to no change)
      setIsUpdateSubmitLoading({
        ...isUpdateSubmitLoading,
        assets: true,
      });
      updateSubmit(editSubmit);
    } else {
      // This is done in case we do not have any changes and the SubmitSubmit useEffect
      // needs the isUpdateSubmitLoading state to be updated in order to reset the saveSubmitToggle
      // and editSubmitToggle states
      setIsUpdateSubmitLoading({
        ...isUpdateSubmitLoading,
        assets: false,
      });
    }
  }, [saveSubmitToggle]);

  useEffect(() => {
    if (isUpdateSubmitMutationLoading && !isUpdateSubmitLoading.assets) {
      setIsUpdateSubmitLoading({ ...isUpdateSubmitLoading, assets: true });
    } else if (!isUpdateSubmitMutationLoading && isUpdateSubmitLoading.assets) {
      setIsUpdateSubmitLoading({ ...isUpdateSubmitLoading, assets: false });
    }
  }, [isUpdateSubmitMutationLoading]);

  return (
    <div className="overflow-y-auto h-full grid gap-2 pb-2 lg:mr-96">
      {editSubmitToggle && (
        <FileUpload
          submitId={submitId}
          setAssets={(asset) => {
            if (typeof asset === "function") {
              setEditSubmit((prev) => ({
                ...prev,
                assets:
                  asset instanceof Function
                    ? // @ts-ignore
                      asset({ assets: prev.assets as AssetInterface[] }).assets
                    : [...(prev.assets || []), asset],
              }));
            } else {
              setEditSubmit((prev) => ({
                ...prev,
                assets: [...(prev.assets || []), asset],
              }));
            }
          }}
          assets={editSubmit.assets}
          STORAGE_ZONE_REGION={STORAGE_ZONE_REGION}
          STORAGE_ZONE_BASE_HOSTNAME={STORAGE_ZONE_BASE_HOSTNAME}
          STORAGE_ZONE_NAME={STORAGE_ZONE_NAME}
          STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
        />
      )}
      <div className="relative flex flex-col w-full px-2 gap-2">
        {submit?.data?.assets?.map((file: any, index: number) => (
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

export default SubmitAssetsList;
