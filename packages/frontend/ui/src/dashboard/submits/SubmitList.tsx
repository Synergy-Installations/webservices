import {
  useAddSubmitMutation,
  useGetSubmitsQuery,
  useDeleteSubmitMutation,
} from "@com.synergy/frontend-backend-dashboard/submitApi";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { Filter, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMessages } from "next-intl";
import { createQuestionElement } from "../../shared/funnel/utils/CreateElements";
/* eslint-disable-next-line */
export interface SubmitListProps {}

const getSubmitStatusFilterKey = (item: any) =>
  JSON.stringify([
    item?.status?.code || "without-status",
    item?.status?.message || "Ohne Status",
  ]);

export const SubmitList = (props: SubmitListProps) => {
  const user = useUser();
  const messages: any = useMessages();
  const {
    data: submits = { success: false, data: [] },
    isLoading,
    error,
  } = useGetSubmitsQuery();

  const [addSubmit, { isLoading: isAddSubmitLoading }] = useAddSubmitMutation();

  const [deleteAsset, { isLoading: isDeleteAssetLoading }] =
    useDeleteSubmitMutation();

  const [deletedAssetId, setDeletedAssetId] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("all");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const questionElementsRaw = messages.LandingPage.ContactUs.Funnel.questions;
  const questionElementKeys = Object.keys(questionElementsRaw);
  const useKey = false;
  const useStrings = true;
  const useSelected = false;

  const [newSubmit, setNewSubmit] = useState<Partial<any>>({
    title: "",
    data: questionElementKeys.reduce(
      (acc: Record<string, any>, questionKey: string) => {
        const key = `${questionKey}-${Math.random().toString(36).substring(2, 7)}`;
        acc[questionKey] = createQuestionElement(
          useKey ? questionElementsRaw[questionKey].uid : key,
          questionElementsRaw[questionKey],
          useKey,
          useStrings,
          useSelected,
          ["initialLoad"],
          false,
        );
        return acc;
      },
      {},
    ),
    status: {
      code: "default_status",
      message: "In Bearbeitung",
      color: "CornflowerBlue",
    },
    visibility: "public",
    emailAddress:
      user?.user?.primaryEmailAddress?.emailAddress || "office@synergie.cc",
  });

  const createNewSubmit = () => {
    addSubmit(newSubmit);
    setNewSubmit({
      ...newSubmit,
      title: "",
    });
  };

  console.log("submits", submits);

  const submitItems = useMemo(
    () => (Array.isArray(submits.data) ? submits.data : []),
    [submits.data],
  );

  const statusFilters = useMemo(() => {
    const statusMap = new Map<
      string,
      { key: string; message: string; color: string; count: number }
    >();

    submitItems.forEach((item: any) => {
      const key = getSubmitStatusFilterKey(item);
      const existingStatus = statusMap.get(key);

      if (existingStatus) {
        existingStatus.count += 1;
        return;
      }

      statusMap.set(key, {
        key,
        message: item?.status?.message || "Ohne Status",
        color: item?.status?.color || "#9CA3AF",
        count: 1,
      });
    });

    return Array.from(statusMap.values()).sort((firstStatus, secondStatus) =>
      firstStatus.message.localeCompare(secondStatus.message, "de"),
    );
  }, [submitItems]);

  const filteredSubmits = useMemo(() => {
    if (selectedStatusFilter === "all") {
      return submitItems;
    }

    return submitItems.filter(
      (item: any) => getSubmitStatusFilterKey(item) === selectedStatusFilter,
    );
  }, [selectedStatusFilter, submitItems]);

  const activeStatusFilter = statusFilters.find(
    (statusFilter) => statusFilter.key === selectedStatusFilter,
  );

  const getSubmitFallbackLabel = (item: any, fallbackIndex: number) =>
    submitItems.findIndex((submitItem: any) => submitItem._id === item._id) +
      1 || fallbackIndex + 1;

  /**
   * Look up a form's input value by its form uid across all questions of a
   * submit. The address form (`submit-form-textarea-address`) used to live under
   * the `interested-products` question but was moved to its own
   * `project-address` question. Searching by form uid (which is unchanged) makes
   * both the old and the new submit configs resolve correctly.
   */
  const getSubmitFormInputValueByUid = (
    item: any,
    formUid: string,
  ): string => {
    const questions = Object.values(
      (item?.data ?? {}) as Record<string, { form?: Record<string, any> }>,
    );

    for (const question of questions) {
      const form = Object.values(
        (question?.form ?? {}) as Record<
          string,
          { uid?: string; selected?: { inputValue?: string } }
        >,
      ).find((formEntry) => formEntry?.uid === formUid);

      if (form?.selected?.inputValue) {
        return form.selected.inputValue;
      }
    }

    return "";
  };

  if (error) {
    return (
      <div className="flex flex-col gap-2 p-4 mt-12 items-center justify-center h-full">
        <p className="text-red-500 font-bold text-lg">
          Ein Fehler ist aufgetreten.
        </p>
        <p className="text-gray-500">
          Bitte laden Sie die Seite neu oder versuchen Sie es später erneut.
        </p>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex flex-col gap-4 p-4 mt-12 animate-pulse">
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
    );

  return (
    <div className="flex flex-col gap-2 p-4 mt-12">
      <div className="relative mb-2 flex flex-col items-start gap-2">
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <div
            className={`inline-flex max-w-full overflow-hidden rounded-lg border shadow-sm transition-colors ${
              selectedStatusFilter === "all"
                ? "border-synergy-light-grey bg-white"
                : "border-synergy-light-blue bg-synergy-light-blue"
            }`}
          >
            <button
              type="button"
              aria-expanded={isStatusFilterOpen}
              aria-controls="submit-status-filter-options"
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className={`inline-flex min-h-10 min-w-0 max-w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue/30 ${
                selectedStatusFilter === "all"
                  ? "text-gray-700 hover:text-synergy-light-blue"
                  : "text-white hover:bg-synergy-light-blue/90"
              }`}
            >
              {selectedStatusFilter === "all" ? (
                <Filter className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/60"
                  style={{
                    backgroundColor: activeStatusFilter?.color || "#9CA3AF",
                  }}
                ></span>
              )}
              <span className="truncate">
                {selectedStatusFilter === "all"
                  ? "Filter"
                  : activeStatusFilter?.message || "Aktiver Filter"}
              </span>
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs ${
                  selectedStatusFilter === "all"
                    ? "bg-gray-100 text-gray-500"
                    : "bg-white/20 text-white"
                }`}
              >
                {filteredSubmits.length}
              </span>
            </button>

            {selectedStatusFilter !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStatusFilter("all");
                  setIsStatusFilterOpen(false);
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-l border-white/30 text-white transition-colors hover:bg-synergy-light-blue/80 focus:z-10 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue/30"
                aria-label="Statusfilter zurücksetzen"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {isStatusFilterOpen && (
          <div
            id="submit-status-filter-options"
            className="w-full rounded-lg border border-synergy-light-grey bg-white p-3 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Status filtern
                </p>
                <p className="text-xs text-gray-500">
                  {filteredSubmits.length} von {submitItems.length} Anfragen
                  sichtbar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusFilterOpen(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-synergy-light-grey hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue/30"
                aria-label="Statusfilter schließen"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div
              className="flex gap-2 overflow-x-auto pb-1"
              aria-label="Statusfilter für Anfragen"
            >
              <button
                type="button"
                aria-pressed={selectedStatusFilter === "all"}
                onClick={() => {
                  setSelectedStatusFilter("all");
                  setIsStatusFilterOpen(false);
                }}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-synergy-light-blue/30 ${
                  selectedStatusFilter === "all"
                    ? "border-synergy-light-blue bg-synergy-light-blue text-white shadow-sm"
                    : "border-synergy-light-grey bg-gray-50 text-gray-700 hover:border-synergy-light-blue/50 hover:bg-synergy-light-grey"
                }`}
              >
                Alle
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs ${
                    selectedStatusFilter === "all"
                      ? "bg-white/20 text-white"
                      : "bg-white text-gray-500"
                  }`}
                >
                  {submitItems.length}
                </span>
              </button>

              {statusFilters.map((statusFilter) => {
                const isSelected = selectedStatusFilter === statusFilter.key;

                return (
                  <button
                    key={statusFilter.key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedStatusFilter(statusFilter.key);
                      setIsStatusFilterOpen(false);
                    }}
                    className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-synergy-light-blue/30 ${
                      isSelected
                        ? "border-synergy-light-blue bg-synergy-light-blue text-white shadow-sm"
                        : "border-synergy-light-grey bg-gray-50 text-gray-700 hover:border-synergy-light-blue/50 hover:bg-synergy-light-grey"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ${
                        isSelected ? "ring-white/60" : "ring-white"
                      }`}
                      style={{ backgroundColor: statusFilter.color }}
                    ></span>
                    <span className="max-w-48 truncate">
                      {statusFilter.message}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      {statusFilter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {filteredSubmits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-synergy-light-grey bg-gray-50 p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-400 shadow-sm">
            <Filter className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {selectedStatusFilter === "all"
                ? "Noch keine Anfragen vorhanden."
                : "Keine Anfragen mit diesem Status."}
            </p>
            {selectedStatusFilter !== "all" && (
              <p className="mt-1 text-sm text-gray-500">
                {activeStatusFilter
                  ? `${activeStatusFilter.message} ist aktuell nicht in der Liste sichtbar.`
                  : "Der ausgewählte Status ist aktuell nicht in der Liste sichtbar."}
              </p>
            )}
          </div>
          {selectedStatusFilter !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedStatusFilter("all")}
              className="inline-flex items-center gap-1 rounded-lg bg-synergy-light-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-synergy-light-blue/90 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue/30"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Filter zurücksetzen
            </button>
          )}
        </div>
      ) : (
        filteredSubmits.map((data: any, index: number) => (
          <div
            key={data._id}
            className="flex items-center justify-between rounded-xl border border-synergy-light-grey p-2 transition-colors duration-200 hover:bg-synergy-light-grey"
          >
            <Link
              href={`/dashboard/submits/${data._id}/steps`}
              className="group w-full"
            >
              <div className="">
                <p className="text-lg font-bold group-hover:underline">
                  Projekt:{" "}
                  {data.title
                    ? data.title
                    : getSubmitFallbackLabel(data, index)}
                  {getSubmitFormInputValueByUid(data, "submit-form-name") &&
                    ` – ${getSubmitFormInputValueByUid(data, "submit-form-name")}`}
                </p>
                <div className="flex gap-1">
                  <p className="font-medium">Adresse: </p>
                  <p className="">
                    {getSubmitFormInputValueByUid(
                      data,
                      "submit-form-textarea-address",
                    )}
                  </p>
                </div>
                {data?.status && (
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: data.status?.color }}
                    ></div>
                    <p className="text-sm font-medium">
                      Status: {data?.status?.message}
                    </p>
                  </div>
                )}
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
              </div>
            </Link>
            <button
              type="button"
              onClick={() => {
                setDeletedAssetId(data._id);
                deleteAsset(data._id);
              }}
            >
              {isDeleteAssetLoading && deletedAssetId === data._id ? (
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
          </div>
        ))
      )}
      {Array.isArray(user.user?.publicMetadata?.accessRights) &&
        (user.user?.publicMetadata?.accessRights.includes("all:*") ||
          user.user?.publicMetadata?.accessRights?.includes("submit:*")) && (
          <form className="flex justify-between items-center gap-2 group border-2 border-dashed border-synergy-light-grey p-2 rounded-xl hover:bg-synergy-light-grey transition-colors duration-200">
            <div className="w-full flex gap-1">
              <p className="text-lg font-bold">Projekt:</p>
              <input
                type="text"
                id="voice-search"
                className="bg-white p-0 !text-lg !font-bold group-hover:bg-synergy-light-grey transition-colors duration-200 border-none text-sm focus:ring-0 block w-full placeholder:text-lg placeholder:font-bold"
                placeholder="Title"
                required
                value={newSubmit.title}
                onChange={(e) =>
                  setNewSubmit({ ...newSubmit, title: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    createNewSubmit();
                    console.log("Step submitted:", newSubmit);
                  }
                }}
              />
              {/* <div className="flex items-center gap-2 mt-2">
            <div className="w-max">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: newChat.status?.color }}
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
              type="button"
              onClick={(e) => {
                e.preventDefault();
                createNewSubmit();
                console.log("Step submitted:", newSubmit);
              }}
              className="inline-flex items-center h-min gap-1 w-max px-4 py-2 rounded-lg text-gray-100 hover:text-white disabled:hover:text-gray-100 disabled:cursor-not-allowed bg-synergy-light-blue dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
              disabled={isAddSubmitLoading || newSubmit.title === ""}
            >
              <span className="">Erstellen</span>
              {isAddSubmitLoading && (
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
        )}
    </div>
  );
};

export default SubmitList;
