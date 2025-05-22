"use client";
import {
  useGetSubmitQuery,
  useUpdateSubmitMutation,
} from "@com.synergy/frontend-backend-dashboard/submitApi";
import FileUpload from "../../shared/file-upload/FileUpload";
import { IsUpdateSubmitLoadingState } from "../../steps/StepsSubmit";
import { useEffect, useState } from "react";
import { Types } from "mongoose";
import {
  useGetAssetsQuery,
  useDeleteAssetMutation,
} from "@com.synergy/frontend-backend-dashboard/assetApi";
import FileUploadVault from "../../shared/file-upload/FileUploadVault";

/* eslint-disable-next-line */
export interface SubmitAssetsListProps {
  params: { id: string; stepId?: string; vaultId?: string };
  editSubmitToggle: boolean;
  setEditSubmitToggle: (editSubmitToggle: boolean) => void;
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const SubmitAssetsList = (props: SubmitAssetsListProps) => {
  const {
    params,
    params: { id: submitId, stepId, vaultId },
    editSubmitToggle,
    setEditSubmitToggle,
    STORAGE_ZONE_ACCESS_KEY,
    STORAGE_ZONE_REGION,
    STORAGE_ZONE_BASE_HOSTNAME,
    STORAGE_ZONE_NAME,
  } = props;

  const [deleteAsset, { isLoading }] = useDeleteAssetMutation();

  const [deletedAssetId, setDeletedAssetId] = useState<string | null>(null);

  const {
    data: assets,
    isLoading: isGetSubmitLoading,
    error,
  } = useGetAssetsQuery(
    { submitId, stepId, vaultId },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  return (
    <div className="overflow-y-auto h-full pb-60">
      {editSubmitToggle && (
        <FileUploadVault
          params={params}
          STORAGE_ZONE_REGION={STORAGE_ZONE_REGION}
          STORAGE_ZONE_BASE_HOSTNAME={STORAGE_ZONE_BASE_HOSTNAME}
          STORAGE_ZONE_NAME={STORAGE_ZONE_NAME}
          STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
        />
      )}
      <div className="relative flex flex-col w-full px-2 pt-2 gap-2">
        {assets?.data?.assets?.map(({ asset: file, _id }, index: number) => (
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
              {vaultId && (
                <button
                  onClick={() => {
                    setDeletedAssetId(_id);
                    deleteAsset({
                      assetId: _id,
                      submitId,
                      vaultId,
                    });
                  }}
                >
                  {isLoading && deletedAssetId === _id ? (
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 ml-1 text-white animate-spin"
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
                      className="w-6 h-6 text-red-500 dark:text-red-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M18 6h-3.5l-1-1h-5l-1 1H6v2h12V6zm-1 4H7v10c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V10zm-2 8h-2v-6h2v6zm-4 0H9v-6h2v6z"
                      />
                    </svg>
                  )}
                </button>
              )}
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
