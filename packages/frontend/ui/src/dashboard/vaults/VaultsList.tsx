"use client";

import { VaultInterface } from "@com.synergy/frontend-backend-dashboard/vault";
import {
  useAddVaultMutation,
  useGetVaultsQuery,
} from "@com.synergy/frontend-backend-dashboard/vaultApi";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { Types } from "mongoose";
import { useEffect, useState } from "react";

/* eslint-disable-next-line */
export interface VaultsListProps {
  params: { id: string };
  className?: string;
}

export const VaultsList = (props: VaultsListProps) => {
  const {
    params: { id: submitId },
    className,
  } = props;

  const {
    data: vaults,
    isLoading: isGetStepsLoading,
    error,
  } = useGetVaultsQuery(
    { submitId },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const [addVault, { isLoading: isAddStepLoading, error: addStepError }] =
    useAddVaultMutation();

  const [newVault, setNewVault] = useState<Partial<VaultInterface>>({
    order: vaults?.data?.vaults.length ? vaults.data.vaults.length + 1 : 1,
    title: "",
    description: "",
    submitId: new Types.ObjectId(submitId),
  });

  useEffect(() => {
    if (vaults?.data?.vaults.length) {
      setNewVault((prev) => ({
        ...prev,
        order: vaults.data.vaults.length + 1,
      }));
    }
  }, [vaults?.data?.vaults.length]);

  const createNewVault = () => {
    addVault({
      submitId: newVault.submitId || new Types.ObjectId(submitId),
      ...newVault,
    });
    setNewVault({
      ...newVault,
      title: "",
    });
  };

  console.log("New vault:", newVault);

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
      className={`flex flex-col gap-2 pt-0 p-4 overflow-y-scroll h-full ${className}`}
    >
      {isGetStepsLoading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border bg-synergy-light-grey border-synergy-light-grey p-4 rounded-xl"
            >
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        vaults?.data?.vaults.map((vault: any, index: number) => (
          <Link
            href={`/dashboard/submits/${submitId}/vaults/${vault._id}/assets`}
            key={vault._id}
            className="group border border-synergy-light-grey p-2 rounded-xl hover:bg-synergy-light-grey transition-colors duration-200"
          >
            <p className="text-lg font-bold group-hover:underline">
              {vault.title}
            </p>
            {/* {step?.status && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: step.status?.color }}
                ></div>
                <p className="text-sm font-medium">
                  Status: {step?.status?.message}
                </p>
              </div>
            )} */}
            {/* {Object.values(submits.data[0].data[questionKey].form).map(
            (form: any) => {
              return (
                <div key={form.uid} className="mb-2">
                  <p className="text-sm">
                    <span className="font-bold">
                      {form.selected?.questionTitle}:
                    </span>
                    {form.selected?.selectedValue}
                  </p>
                </div>
              );
            }
          )} */}
          </Link>
        ))
      )}
      <form className="flex justify-between items-center gap-2 group border-2 border-dashed border-synergy-light-grey p-2 rounded-xl hover:bg-synergy-light-grey transition-colors duration-200">
        <div className="w-full">
          <input
            type="text"
            id="voice-search"
            className="bg-white p-0 !text-lg !font-bold group-hover:bg-synergy-light-grey transition-colors duration-200 border-none text-sm focus:ring-0 block w-full placeholder:text-lg placeholder:font-bold"
            placeholder="Title"
            required
            value={newVault.title}
            onChange={(e) =>
              setNewVault({ ...newVault, title: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createNewVault();
                console.log("Step submitted:", newVault);
              }
            }}
          />
          {/* <div className="flex items-center gap-2 mt-2">
            <div className="w-max">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: newVault.status?.color }}
              ></div>
            </div>

            <p className="text-sm font-medium">Status:</p>
            <input
              type="text"
              id="voice-search"
              className="bg-white p-0 group-hover:bg-synergy-light-grey transition-colors duration-200 border-none text-sm focus:ring-0 block w-full"
              placeholder="status message"
              value={newStep.status?.message}
              onChange={(e) =>
                setNewStep({
                  ...newStep,
                  status: {
                    ...newStep.status,
                    message: e.target.value,
                    code: newStep.status?.code || "default_status",
                    color: newStep.status?.color || "CornflowerBlue",
                  },
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createNewStep();
                  console.log("Step submitted:", newStep);
                }
              }}
            />
          </div> */}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault;
            createNewVault();
            console.log("Step submitted:", newVault);
          }}
          className="inline-flex items-center h-min gap-1 w-max px-4 py-2 rounded-lg text-gray-100 hover:text-white disabled:hover:text-gray-100 disabled:cursor-not-allowed bg-synergy-light-blue dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
          disabled={isAddStepLoading || newVault.title === ""}
        >
          <span className="">Erstellen</span>
          {isAddStepLoading && (
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
        {/* {Object.values(submits.data[0].data[questionKey].form).map(
        (form: any) => {
          return (
            <div key={form.uid} className="mb-2">
              <p className="text-sm">
                <span className="font-bold">
                  {form.selected?.questionTitle}:
                </span>
                {form.selected?.selectedValue}
              </p>
            </div>
          );
        }
      )} */}
      </form>
    </div>
  );
};

export default VaultsList;
