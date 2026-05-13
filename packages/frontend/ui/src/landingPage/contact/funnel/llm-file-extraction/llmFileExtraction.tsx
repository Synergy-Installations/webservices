"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useParams } from "next/navigation";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

type UploadTokenResponse = {
  token: string;
  uploadUrl: string;
  path: string;
  expiresAt: number;
};

type RunHandle = {
  runId: string;
  publicAccessToken: string;
};

type FileStatus =
  | "minting"
  | "uploading"
  | "uploaded"
  | "queued"
  | "extracting"
  | "extracted"
  | "error";

type SelectedFile = {
  clientId?: string;
  uid: string;
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  localUrl: string;
  status: FileStatus;
  downloadUrl: string;
  uploadProgress?: number;
  extractionRun?: RunHandle;
  extractionStep?: string;
  extractionStartedAt?: number;
  extractionCompletedInSeconds?: number;
  partialExtraction?: Record<string, { value?: unknown }>;
  extractionError?: string;
  extractionResult?: unknown;
  prefillResult?: unknown;
  removedPrefill?: string[];
};

type ExtractionFieldConfig = {
  label?: string;
  type?: string;
  unit?: string;
  target?: {
    formUid?: string;
  };
  options?: Record<
    string,
    {
      aliases?: string[];
      targetOptionUid?: string;
    }
  >;
};

type GroundedExtractionValue = {
  value?: unknown;
  source_quote?: string | null;
  source_page?: number | null;
};

type ExtractionOutput = {
  extraction?: Record<string, GroundedExtractionValue>;
  confidences?: Record<string, number>;
  funnelPrefill?: Record<string, FunnelPrefillEntry>;
};

type FunnelPrefillEntry = {
  value: unknown;
  confidence?: number;
  sourceQuote?: string | null;
  sourcePage?: number | null;
  fieldKey?: string;
  documentName?: string;
  label?: string;
};

type FunnelPrefillResult = {
  applied: string[];
  skipped: Array<{
    formUid: string;
    label?: string;
    reason: string;
    value: unknown;
  }>;
};

/* eslint-disable-next-line */
export interface LLMFileExtractionProps {
  questionKey: string;
  formKey: string;
  questionElements: any;
  setQuestionElements: any;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
  applyFunnelPrefill?(
    prefill: Record<string, unknown>,
    context: { documentName: string; fileUid: string },
  ): FunnelPrefillResult | void;
  removeFunnelPrefill?(
    formUid: string,
    context: { documentName: string; fileUid: string },
  ): void;
}

export const LlmFileExtraction = (props: LLMFileExtractionProps) => {
  const {
    questionKey,
    formKey,
    questionElements,
    setQuestionElements,
    applyFunnelPrefill,
    removeFunnelPrefill,
  } = props;

  const params = useParams();
  const locale = Array.isArray(params.locale)
    ? params.locale[0]
    : params.locale || "at-AT";

  const form = questionElements[questionKey].form[formKey];
  const uploadFingerprintsRef = useRef<Set<string>>(new Set());
  const extraction = form.options.extraction ?? {};
  const statusLabels = extraction.statusLabels ?? {};
  const mimeTypes = Array.isArray(extraction.mimeTypes)
    ? extraction.mimeTypes
    : [];
  const accept =
    mimeTypes.length > 0
      ? Object.fromEntries(mimeTypes.map((mimeType: string) => [mimeType, []]))
      : undefined;

  const updateFile = useCallback(
    (
      fileUid: string,
      patch:
        | Partial<SelectedFile>
        | ((file: SelectedFile) => Partial<SelectedFile>),
    ) => {
      setQuestionElements((prev: any) => {
        return updateSelectedFilesInElements(
          prev,
          questionKey,
          formKey,
          (selectedFiles) =>
            selectedFiles.map((selectedFile) => {
              if (!matchesSelectedFile(selectedFile, fileUid)) {
                return selectedFile;
              }

              return {
                ...selectedFile,
                ...(typeof patch === "function" ? patch(selectedFile) : patch),
              };
            }),
        );
      });
    },
    [formKey, questionKey, setQuestionElements],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(async (file) => {
        const fingerprint = buildFileFingerprint(file);

        if (uploadFingerprintsRef.current.has(fingerprint)) {
          return;
        }

        uploadFingerprintsRef.current.add(fingerprint);

        const temporaryFileUid = `pending-${Math.random().toString(36).substring(2, 7)}-${file.name}`;
        let currentFileUid = temporaryFileUid;
        const localUrl = URL.createObjectURL(file);
        const pullHostName = form.options.download.pullHostName;
        const funnelSessionId = buildFunnelSessionId(questionKey, formKey);
        let extractionStartedAt: number | undefined;

        try {
          setQuestionElements((prev: any) => {
            return updateSelectedFilesInElements(
              prev,
              questionKey,
              formKey,
              (selectedFiles) => [
                ...selectedFiles,
                {
                  clientId: temporaryFileUid,
                  uid: temporaryFileUid,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  lastModified: file.lastModified,
                  localUrl,
                  status: "minting",
                  downloadUrl: "",
                  uploadProgress: 0,
                },
              ],
            );
          });

          const tokenResponse = await fetch(
            `/${locale}/api/storage/generate_presigned_upload_url`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
                size: file.size,
                funnelSessionId,
              }),
            },
          );

          if (!tokenResponse.ok) {
            throw new Error(
              `upload token ${tokenResponse.status}: ${await tokenResponse.text()}`,
            );
          }

          const { token, uploadUrl, path } =
            (await tokenResponse.json()) as UploadTokenResponse;
          const downloadUrl = encodeURI(
            `${pullHostName.replace(/\/$/, "")}/${path}`,
          );
          currentFileUid = path;

          updateFile(temporaryFileUid, {
            uid: path,
            downloadUrl,
            status: "uploading",
          });

          await uploadWithProgress({
            url: buildUploadUrl(uploadUrl, path),
            file,
            token,
            onProgress: (percent) =>
              updateFile(path, { uploadProgress: percent }),
          });

          updateFile(path, { status: "uploaded", uploadProgress: 100 });
          extractionStartedAt = Date.now();
          updateFile(path, {
            status: "queued",
            extractionStartedAt,
            extractionCompletedInSeconds: undefined,
          });

          const extractResponse = await fetch(
            `/${locale}${extraction.endpoint ?? "/api/funnel/extract"}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                funnelSessionId,
                bunnyPath: path,
                filename: file.name,
                contentType: file.type,
                extractionQuestionUid: questionElements[questionKey].uid,
                extractionFormUid: form.uid,
                options: {
                  selfConsistencySamples: Number(
                    extraction.options?.selfConsistencySamples ?? 0,
                  ),
                  runVerifier:
                    extraction.options?.runVerifier === true ||
                    extraction.options?.runVerifier === "true",
                },
              }),
            },
          );

          if (!extractResponse.ok) {
            throw new Error(
              `extract ${extractResponse.status}: ${await extractResponse.text()}`,
            );
          }

          const handle = (await extractResponse.json()) as RunHandle;
          updateFile(path, {
            status: "extracting",
            extractionRun: handle,
            extractionStartedAt,
          });
        } catch (error) {
          updateFile(currentFileUid, {
            status: "error",
            extractionCompletedInSeconds: extractionStartedAt
              ? secondsSince(extractionStartedAt)
              : undefined,
            extractionError: String(error),
          });
          console.error("File upload or extraction failed", error);
        } finally {
          uploadFingerprintsRef.current.delete(fingerprint);
        }
      });
    },
    [
      extraction.endpoint,
      extraction.options?.runVerifier,
      extraction.options?.selfConsistencySamples,
      form.options.download.pullHostName,
      form.uid,
      formKey,
      locale,
      questionElements,
      questionKey,
      setQuestionElements,
      updateFile,
    ],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    multiple: form.options.upload.multipleFiles !== "false",
  });

  const handleDownload = (url: string, name: string) => {
    const proxyUrl = `/${locale}/api/download/file?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;

    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    const files = form.selected.selectedFiles as SelectedFile[];
    for (const file of files) {
      const url = file.downloadUrl || file.localUrl;
      if (url) {
        handleDownload(url, file.name);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  return (
    <>
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center w-full"
      >
        <label
          htmlFor={formKey}
          className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Klicken zum Hochladen</span> oder
              Drag and Drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {extraction.acceptText || form.options.upload.filesAccepted}
            </p>
          </div>
          <input
            {...getInputProps()}
            id={formKey}
            type="file"
            className="hidden"
          />
        </label>
      </div>

      {form.selected.selectedFiles.length > 0 && (
        <div className="flex justify-end w-full mt-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDownloadAll();
            }}
            className="text-sm text-blue-600 dark:text-blue-500 hover:underline flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Alle herunterladen
          </button>
        </div>
      )}

      <div className="relative flex flex-col w-full mt-2">
        {(form.selected.selectedFiles as SelectedFile[]).map((file, index) => (
          <div
            key={file.clientId ?? `${file.uid}-${index}`}
            className="mb-2 last:mb-0"
          >
            <div className="flex items-center justify-between w-full p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <div className="grid sm:flex items-center sm:space-x-2 min-w-0">
                <div className="flex items-center space-x-2 min-w-0">
                  {file.type?.startsWith("image/") ? (
                    <img
                      src={file.downloadUrl || file.localUrl}
                      alt=""
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-10 w-10 flex-none"
                      id="file"
                    >
                      <path
                        fill="#000000"
                        d="M20,8.94a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19l-.09,0L13.06,2H7A3,3,0,0,0,4,5V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V9S20,9,20,8.94ZM14,5.41,16.59,8H14ZM18,19a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V5A1,1,0,0,1,7,4h5V9a1,1,0,0,0,1,1h5Z"
                      />
                    </svg>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">
                    {file.name}
                  </p>
                </div>
                <p
                  className={`text-sm mt-2 sm:mt-0 min-h-[1.57rem] ${file.status === "error" ? "text-red-600 dark:text-red-500" : file.status === "queued" || file.status === "extracting" || file.status === "uploading" || file.status === "minting" ? "text-blue-600 dark:text-blue-500" : "text-green-600 dark:text-green-500"}`}
                >
                  {fileStatusText(file, form, statusLabels)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownload(
                      file.downloadUrl || file.localUrl,
                      file.name,
                    );
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                  title="Download"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
                <button
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 focus:outline-none"
                  title="Delete"
                  onClick={() => {
                    setQuestionElements((prev: any) => {
                      return updateSelectedFilesInElements(
                        prev,
                        questionKey,
                        formKey,
                        (selectedFiles) =>
                          selectedFiles.filter(
                            (fileFilter) =>
                              !isSameSelectedFile(fileFilter, file),
                          ),
                      );
                    });
                  }}
                >
                  <svg
                    className="w-6 h-6"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {(file.status === "uploading" || file.status === "minting") && (
              <UploadProgress percent={file.uploadProgress ?? 0} />
            )}

            {(file.extractionRun || file.status === "queued") && (
              <ExtractionRunSubscription
                file={file}
                formKey={formKey}
                questionKey={questionKey}
                statusLabels={statusLabels}
                extractionFields={extraction.fields ?? {}}
                setQuestionElements={setQuestionElements}
                applyFunnelPrefill={applyFunnelPrefill}
                removeFunnelPrefill={removeFunnelPrefill}
              />
            )}

            {file.extractionError && (
              <p className="text-xs mt-1 text-red-600 dark:text-red-500">
                {file.extractionError}
              </p>
            )}
          </div>
        ))}
      </div>

      <p
        className={`text-sm mt-2 min-h-[1.57rem] ${form.message.type === "error" ? "text-red-600 dark:text-red-500" : form.message.type === "warning" ? "text-orange-600 dark:text-orange-500" : form.message.type === "loading" ? "text-blue-600 dark:text-blue-500" : "text-green-600 dark:text-green-500"}`}
      >
        {form.message.text}
      </p>
    </>
  );
};

function updateSelectedFilesInElements(
  elements: any,
  questionKey: string,
  formKey: string,
  updater: (files: SelectedFile[]) => SelectedFile[],
) {
  const question = elements?.[questionKey];
  const currentForm = question?.form?.[formKey];

  if (!question || !currentForm) {
    return elements;
  }

  const selected = currentForm.selected ?? {};
  const selectedFiles = Array.isArray(selected.selectedFiles)
    ? selected.selectedFiles
    : [];
  const nextSelectedFiles = dedupeSelectedFiles(updater(selectedFiles));

  return {
    ...elements,
    [questionKey]: {
      ...question,
      form: {
        ...question.form,
        [formKey]: {
          ...currentForm,
          selected: {
            ...selected,
            selectedFiles: nextSelectedFiles,
          },
        },
      },
    },
  };
}

function dedupeSelectedFiles(files: SelectedFile[]): SelectedFile[] {
  const seen = new Set<string>();

  return files.filter((file, index) => {
    const identity = file.clientId ?? file.uid ?? `${file.name}-${index}`;

    if (seen.has(identity)) {
      return false;
    }

    seen.add(identity);
    return true;
  });
}

function matchesSelectedFile(file: SelectedFile, fileUid: string): boolean {
  return file.uid === fileUid || file.clientId === fileUid;
}

function isSameSelectedFile(candidate: SelectedFile, file: SelectedFile) {
  return (
    matchesSelectedFile(candidate, file.uid) ||
    (file.clientId ? matchesSelectedFile(candidate, file.clientId) : false)
  );
}

function buildFileFingerprint(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}

type ExtractionRowStatus = "partial" | "applied" | "skipped" | "removed";

type ExtractionDisplayRow = {
  fieldKey: string;
  formUid?: string;
  label: string;
  displayValue: string;
  confidence?: number;
  sourceQuote?: string | null;
  sourcePage?: number | null;
  status: ExtractionRowStatus;
  skipReason?: string;
  canRemove: boolean;
};

function buildExtractionRows(opts: {
  file: SelectedFile;
  extractionFields: Record<string, ExtractionFieldConfig>;
}): ExtractionDisplayRow[] {
  const output = isExtractionOutput(opts.file.extractionResult)
    ? opts.file.extractionResult
    : null;
  const extraction = output?.extraction ?? opts.file.partialExtraction ?? {};
  const prefillResult = isPrefillResult(opts.file.prefillResult)
    ? opts.file.prefillResult
    : null;

  return Object.entries(extraction)
    .filter(([, extracted]) => hasDisplayableExtractionValue(extracted?.value))
    .map(([fieldKey, extracted]) => {
      const grounded = extracted as GroundedExtractionValue;
      const field = opts.extractionFields[fieldKey] ?? {};
      const formUid = field.target?.formUid;
      const funnelValue = formUid
        ? output?.funnelPrefill?.[formUid]
        : undefined;
      const skipped = prefillResult?.skipped.find(
        (entry) => entry.formUid === formUid,
      );
      const applied = Boolean(
        formUid && prefillResult?.applied.includes(formUid),
      );
      const removed = Boolean(
        formUid && opts.file.removedPrefill?.includes(formUid),
      );
      const status: ExtractionRowStatus = removed
        ? "removed"
        : applied
          ? "applied"
          : skipped
            ? "skipped"
            : "partial";

      return {
        fieldKey,
        formUid,
        label: field.label ?? funnelValue?.label ?? fieldKey,
        displayValue: formatExtractionValue(extracted.value, field),
        confidence:
          output?.confidences?.[fieldKey] ??
          funnelValue?.confidence ??
          undefined,
        sourceQuote: grounded.source_quote ?? funnelValue?.sourceQuote ?? null,
        sourcePage: grounded.source_page ?? funnelValue?.sourcePage ?? null,
        status,
        skipReason: skipped?.reason,
        canRemove: status === "applied" && Boolean(formUid),
      };
    });
}

function hasDisplayableExtractionValue(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function formatExtractionValue(
  value: unknown,
  field: ExtractionFieldConfig,
): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatExtractionValue(item, field)).join(", ");
  }

  if (typeof value === "number") {
    const formatted = Number.isInteger(value)
      ? value.toString()
      : value.toLocaleString("de-DE", { maximumFractionDigits: 2 });
    return field.unit ? `${formatted} ${field.unit}` : formatted;
  }

  if (typeof value === "string") {
    const option = field.options?.[value];
    return option?.aliases?.[0] ?? value;
  }

  return JSON.stringify(value);
}

function rowStatusLabel(row: ExtractionDisplayRow): string {
  if (row.status === "applied") return "Uebernommen";
  if (row.status === "removed") return "Entfernt";
  if (row.status === "skipped") {
    if (row.skipReason === "low_confidence") return "Bitte pruefen";
    if (row.skipReason === "already_filled") return "Vorhanden";
    return "Nicht uebernommen";
  }
  return "Gefunden";
}

function rowStatusClassName(status: ExtractionRowStatus): string {
  if (status === "applied") {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
  if (status === "removed") {
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
  if (status === "skipped") {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  }
  return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
}

function isExtractionOutput(value: unknown): value is ExtractionOutput {
  return typeof value === "object" && value !== null;
}

function buildExtractionPromptMessages(
  extractionFields: Record<string, ExtractionFieldConfig>,
): string[] {
  const messages = Object.entries(extractionFields)
    .map(([fieldKey, field]) => {
      const label = field.label?.trim() || fieldKey;
      const unit = field.unit ? ` (${field.unit})` : "";

      return `KI sucht nach ${label}${unit}`;
    })
    .filter(Boolean);

  return messages.length > 0
    ? messages
    : [
        "KI liest die Projektunterlagen...",
        "KI sucht passende Antworten...",
        "KI prueft die gefundenen Werte...",
      ];
}

function useRotatingExtractionMessage(
  messages: string[],
  active: boolean,
): string {
  const [index, setIndex] = useState(0);
  const messageKey = messages.join("|");

  useEffect(() => {
    setIndex(0);
  }, [messageKey]);

  useEffect(() => {
    if (!active || messages.length <= 1) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % messages.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [active, messageKey, messages.length]);

  return (
    messages[index % messages.length] ?? "KI liest die Projektunterlagen..."
  );
}

function useExtractionElapsedSeconds(file: SelectedFile): number {
  const [seconds, setSeconds] = useState(() =>
    getSelectedFileElapsedSeconds(file),
  );

  useEffect(() => {
    const updateElapsedSeconds = () => {
      setSeconds(getSelectedFileElapsedSeconds(file));
    };

    updateElapsedSeconds();

    if (
      file.extractionCompletedInSeconds != null ||
      file.status === "extracted" ||
      file.status === "error"
    ) {
      return undefined;
    }

    const interval = window.setInterval(updateElapsedSeconds, 1000);

    return () => window.clearInterval(interval);
  }, [
    file.extractionCompletedInSeconds,
    file.extractionStartedAt,
    file.status,
  ]);

  return seconds;
}

function getSelectedFileElapsedSeconds(file: SelectedFile): number {
  if (typeof file.extractionCompletedInSeconds === "number") {
    return Math.max(0, file.extractionCompletedInSeconds);
  }

  return secondsSince(file.extractionStartedAt);
}

function secondsSince(startedAt?: number): number {
  if (!startedAt) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

function RotatingExtractionText({ text }: { text: string }) {
  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="mt-1 h-4 overflow-hidden text-[11px] text-blue-700 dark:text-blue-300"
    >
      <span key={text} className="extraction-rotating-text block truncate">
        {text}
      </span>
    </div>
  );
}

function ExtractionTimer({
  seconds,
  completed,
}: {
  seconds: number;
  completed: boolean;
}) {
  return (
    <div className="shrink-0 rounded-md border border-blue-200 bg-white/75 px-2 py-1 text-right shadow-sm dark:border-blue-800 dark:bg-gray-900/70">
      <div className="flex items-baseline justify-end gap-0.5 font-mono text-sm font-semibold text-blue-950 dark:text-blue-100">
        <AnimatedElapsedSeconds seconds={seconds} />
        <span className="text-[10px] font-sans font-medium text-blue-700 dark:text-blue-300">
          s
        </span>
      </div>
      <div className="text-[10px] text-blue-600 dark:text-blue-300">
        {completed ? "Dauer" : "laeuft"}
      </div>
    </div>
  );
}

function AnimatedElapsedSeconds({ seconds }: { seconds: number }) {
  const digits = Math.max(0, Math.floor(seconds)).toString().padStart(2, "0");

  return (
    <span className="flex items-center justify-end">
      {digits.split("").map((digit, index) => (
        <AnimatedDigit key={digits.length - index} value={digit} />
      ))}
    </span>
  );
}

function AnimatedDigit({ value }: { value: string }) {
  const currentRef = useRef(value);
  const [digitState, setDigitState] = useState({
    previous: value,
    current: value,
    animating: false,
  });

  useEffect(() => {
    if (currentRef.current === value) {
      return undefined;
    }

    const previous = currentRef.current;
    currentRef.current = value;
    setDigitState({
      previous,
      current: value,
      animating: true,
    });

    const timeout = window.setTimeout(() => {
      setDigitState({
        previous: value,
        current: value,
        animating: false,
      });
    }, 460);

    return () => window.clearTimeout(timeout);
  }, [value]);

  if (!digitState.animating) {
    return (
      <span className="inline-flex h-5 w-[0.68em] items-center justify-center tabular-nums">
        {digitState.current}
      </span>
    );
  }

  return (
    <span className="relative inline-block h-5 w-[0.68em] overflow-hidden tabular-nums">
      <span className="extraction-digit-old absolute inset-0 flex items-center justify-center">
        {digitState.previous}
      </span>
      <span className="extraction-digit-new absolute inset-0 flex items-center justify-center">
        {digitState.current}
      </span>
    </span>
  );
}

function ExtractionAnimationStyles() {
  return (
    <style>
      {`
        @keyframes extractionTextShiftUp {
          0% {
            opacity: 0;
            transform: translateY(95%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes extractionDigitOldUp {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-105%);
          }
        }

        @keyframes extractionDigitNewUp {
          0% {
            opacity: 0;
            transform: translateY(105%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes extractionFieldReveal {
          0% {
            filter: blur(10px);
            opacity: 0;
            transform: translateY(6px) scale(0.985);
          }
          55% {
            opacity: 1;
          }
          100% {
            filter: blur(0);
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .extraction-rotating-text {
          animation: extractionTextShiftUp 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .extraction-digit-old {
          animation: extractionDigitOldUp 440ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .extraction-digit-new {
          animation: extractionDigitNewUp 440ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .extraction-field-reveal {
          animation: extractionFieldReveal 1.6s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: filter, opacity, transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .extraction-rotating-text,
          .extraction-digit-old,
          .extraction-digit-new,
          .extraction-field-reveal {
            animation: none;
            filter: none;
          }
        }
      `}
    </style>
  );
}

function ExtractionRunSubscription(props: {
  file: SelectedFile;
  questionKey: string;
  formKey: string;
  statusLabels: Record<string, string>;
  extractionFields: Record<string, ExtractionFieldConfig>;
  setQuestionElements: any;
  applyFunnelPrefill?: LLMFileExtractionProps["applyFunnelPrefill"];
  removeFunnelPrefill?: LLMFileExtractionProps["removeFunnelPrefill"];
}) {
  const {
    file,
    questionKey,
    formKey,
    statusLabels,
    extractionFields,
    setQuestionElements,
    applyFunnelPrefill,
    removeFunnelPrefill,
  } = props;
  const appliedRef = useRef(false);
  const failedRef = useRef(false);
  const { run, error } = useRealtimeRun(file.extractionRun?.runId, {
    accessToken: file.extractionRun?.publicAccessToken,
    enabled: Boolean(file.extractionRun?.runId),
    throttleInMs: 150,
  });
  const extractionMessages = useMemo(
    () => buildExtractionPromptMessages(extractionFields),
    [extractionFields],
  );
  const extractionIsActive =
    file.status === "queued" || file.status === "extracting";
  const rotatingMessage = useRotatingExtractionMessage(
    extractionMessages,
    extractionIsActive,
  );
  const elapsedSeconds = useExtractionElapsedSeconds(file);
  const extractionIsFinished =
    file.status === "extracted" || file.status === "error";

  useEffect(() => {
    const runStatus = String(run?.status ?? "");
    if (runStatus === "COMPLETED" || runStatus === "SUCCESS") return;

    const metadata = run?.metadata as
      | {
          step?: string;
          partialExtraction?: Record<string, { value?: unknown }>;
        }
      | undefined;

    if (!metadata && !error) return;

    setQuestionElements((prev: any) => {
      return updateSelectedFilesInElements(
        prev,
        questionKey,
        formKey,
        (selectedFiles) =>
          selectedFiles.map((selectedFile) => {
            if (!isSameSelectedFile(selectedFile, file)) {
              return selectedFile;
            }

            return {
              ...selectedFile,
              status: error ? "error" : "extracting",
              extractionStep: metadata?.step,
              partialExtraction:
                metadata?.partialExtraction ?? selectedFile.partialExtraction,
              extractionCompletedInSeconds: error
                ? getSelectedFileElapsedSeconds(selectedFile)
                : selectedFile.extractionCompletedInSeconds,
              extractionError: error ? String(error) : undefined,
            };
          }),
      );
    });
  }, [
    error,
    file.clientId,
    file.uid,
    formKey,
    questionKey,
    run?.metadata,
    run?.status,
    setQuestionElements,
  ]);

  useEffect(() => {
    const status = String(run?.status ?? "");
    const output = (run as any)?.output;

    if (
      !appliedRef.current &&
      output &&
      (status === "COMPLETED" || status === "SUCCESS")
    ) {
      appliedRef.current = true;
      const prefillResult = applyFunnelPrefill?.(output.funnelPrefill ?? {}, {
        documentName: file.name,
        fileUid: file.uid,
      });

      setQuestionElements((prev: any) => {
        return updateSelectedFilesInElements(
          prev,
          questionKey,
          formKey,
          (selectedFiles) =>
            selectedFiles.map((selectedFile) => {
              if (!isSameSelectedFile(selectedFile, file)) {
                return selectedFile;
              }

              return {
                ...selectedFile,
                status: "extracted",
                extractionStep: "complete",
                extractionCompletedInSeconds:
                  selectedFile.extractionCompletedInSeconds ??
                  getSelectedFileElapsedSeconds(selectedFile),
                extractionResult: output,
                prefillResult,
              };
            }),
        );
      });
    }

    if (
      !failedRef.current &&
      (status === "FAILED" || status === "CRASHED" || status === "CANCELED")
    ) {
      failedRef.current = true;
      setQuestionElements((prev: any) => {
        return updateSelectedFilesInElements(
          prev,
          questionKey,
          formKey,
          (selectedFiles) =>
            selectedFiles.map((selectedFile) => {
              if (!isSameSelectedFile(selectedFile, file)) {
                return selectedFile;
              }

              return {
                ...selectedFile,
                status: "error",
                extractionCompletedInSeconds:
                  selectedFile.extractionCompletedInSeconds ??
                  getSelectedFileElapsedSeconds(selectedFile),
                extractionError:
                  "Die KI-Auswertung konnte nicht abgeschlossen werden.",
              };
            }),
        );
      });
    }
  }, [
    applyFunnelPrefill,
    file.clientId,
    file.name,
    file.uid,
    formKey,
    questionKey,
    run,
    setQuestionElements,
  ]);

  const markPrefillRemoved = useCallback(
    (formUid: string) => {
      setQuestionElements((prev: any) => {
        return updateSelectedFilesInElements(
          prev,
          questionKey,
          formKey,
          (selectedFiles) =>
            selectedFiles.map((selectedFile) => {
              if (!isSameSelectedFile(selectedFile, file)) {
                return selectedFile;
              }

              return {
                ...selectedFile,
                removedPrefill: Array.from(
                  new Set([...(selectedFile.removedPrefill ?? []), formUid]),
                ),
              };
            }),
        );
      });
    },
    [file, formKey, questionKey, setQuestionElements],
  );

  const extractedRows = buildExtractionRows({
    file,
    extractionFields,
  });
  const extractionStatusMessage = extractionIsFinished
    ? file.status === "error"
      ? "KI-Auswertung gestoppt"
      : "KI-Auswertung abgeschlossen"
    : rotatingMessage;
  const extractionProgressLabel =
    file.status === "queued"
      ? (statusLabels.queued ?? "KI-Auswertung wurde gestartet...")
      : (statusLabels[file.extractionStep ?? "extracting"] ??
        file.extractionStep ??
        statusLabels.extract ??
        "KI-Auswertung laeuft...");

  return (
    <div className="mt-1 rounded border border-blue-100 bg-blue-50 p-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
      <ExtractionAnimationStyles />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full bg-blue-500 ${extractionIsFinished ? "" : "animate-pulse"}`}
            />
            {extractionProgressLabel}
          </div>
          <RotatingExtractionText text={extractionStatusMessage} />
        </div>
        <ExtractionTimer
          seconds={elapsedSeconds}
          completed={extractionIsFinished}
        />
      </div>
      {extractedRows.length > 0 && (
        <ul className="mt-2 grid gap-2">
          {extractedRows.map((row) => (
            <li
              key={`${row.fieldKey}-${row.formUid ?? row.label}`}
              className="extraction-field-reveal rounded border border-blue-100 bg-white/70 p-2 dark:border-blue-900 dark:bg-gray-900/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-blue-950 dark:text-blue-100">
                    {row.label}
                  </div>
                  <div className="break-words font-mono text-[11px] text-blue-900 dark:text-blue-200">
                    {row.displayValue}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${rowStatusClassName(row.status)}`}
                  >
                    {rowStatusLabel(row)}
                  </span>
                  {row.canRemove && (
                    <button
                      className="rounded border border-red-200 px-1.5 py-0.5 text-[11px] font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!row.formUid) return;
                        removeFunnelPrefill?.(row.formUid, {
                          documentName: file.name,
                          fileUid: file.uid,
                        });
                        markPrefillRemoved(row.formUid);
                      }}
                    >
                      Entfernen
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-blue-700 dark:text-blue-300">
                {row.confidence != null && (
                  <span>Konfidenz {Math.round(row.confidence * 100)}%</span>
                )}
                {row.sourcePage != null && <span>Seite {row.sourcePage}</span>}
                {row.sourceQuote && (
                  <span className="line-clamp-2">
                    Quelle: {row.sourceQuote}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {isPrefillResult(file.prefillResult) &&
        file.prefillResult.skipped.length > 0 && (
          <p className="mt-1 text-orange-700 dark:text-orange-300">
            {file.prefillResult.skipped.length} Wert(e) wurden nicht automatisch
            uebernommen. Bitte pruefen Sie die markierten Eintraege.
          </p>
        )}
    </div>
  );
}

function UploadProgress({ percent }: { percent: number }) {
  return (
    <div className="mt-1">
      <div className="h-1.5 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  );
}

function fileStatusText(
  file: SelectedFile,
  form: any,
  statusLabels: Record<string, string>,
): string {
  if (file.status === "minting") {
    return statusLabels.minting ?? "Upload wird vorbereitet...";
  }
  if (file.status === "uploading") {
    return `${form.options.upload.uploadingText} ${Math.round(file.uploadProgress ?? 0)}%`;
  }
  if (file.status === "uploaded") {
    return statusLabels.uploaded ?? form.options.upload.uploadSuccess;
  }
  if (file.status === "queued") {
    return statusLabels.queued ?? "KI-Auswertung wurde gestartet...";
  }
  if (file.status === "extracting") {
    return (
      statusLabels[file.extractionStep ?? "extract"] ??
      statusLabels.extract ??
      "KI-Auswertung laeuft..."
    );
  }
  if (file.status === "extracted") {
    return statusLabels.complete ?? "KI-Auswertung abgeschlossen";
  }
  return form.options.upload.uploadError;
}

function buildFunnelSessionId(questionKey: string, formKey: string): string {
  const sessionId = `${questionKey}-${formKey}`
    .replace(/[^\w.-]/g, "_")
    .slice(0, 128);

  return sessionId.length >= 8 ? sessionId : "funnel-upload";
}

function buildUploadUrl(uploadUrl: string, path: string): string {
  const endpoint = uploadUrl.trim().replace(/\/+$/, "");
  const absoluteEndpoint = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : endpoint.startsWith("//")
      ? `https:${endpoint}`
      : `https://${endpoint.replace(/^\/+/, "")}`;

  return `${absoluteEndpoint}/${path}`;
}

function uploadWithProgress(opts: {
  url: string;
  file: File;
  token: string;
  onProgress: (percent: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", opts.url);
    xhr.setRequestHeader("X-Upload-Token", opts.token);
    xhr.setRequestHeader("Content-Type", opts.file.type);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        opts.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        opts.onProgress(100);
        resolve();
      } else {
        reject(new Error(`upload ${xhr.status}: ${xhr.responseText}`));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("network error")));
    xhr.addEventListener("abort", () => reject(new Error("upload aborted")));

    xhr.send(opts.file);
  });
}

function isPrefillResult(value: unknown): value is FunnelPrefillResult {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as FunnelPrefillResult).skipped)
  );
}

export default LlmFileExtraction;
