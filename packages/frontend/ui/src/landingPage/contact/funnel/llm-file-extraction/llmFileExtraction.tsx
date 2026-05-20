"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useParams } from "next/navigation";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Download, FileText, UploadCloud, X } from "lucide-react";

type UploadTokenResponse = {
  token: string;
  uploadUrl: string;
  path: string;
  contentType: string;
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
  manualPrefillChoices?: Record<string, string>;
};

type ExtractionFieldConfig = {
  label?: string;
  type?: string;
  unit?: string;
  aliases?: string[];
  instructions?: string;
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
  fileUid?: string;
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
    prefill: Record<string, FunnelPrefillEntry>,
    context: {
      documentName: string;
      fileUid: string;
      force?: boolean;
      userReviewed?: boolean;
    },
  ): FunnelPrefillResult | void;
  removeFunnelPrefill?(
    formUid: string,
    context: { documentName: string; fileUid: string; force?: boolean },
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
  const extractionFields = useMemo(
    () => collectAiExtractionFields(questionElements, extraction.fields ?? {}),
    [extraction.fields, questionElements],
  );
  const extractionThresholds = useMemo(
    () => ({
      green: Number(extraction.confidence?.green ?? 0.85),
      yellow: Number(extraction.confidence?.yellow ?? 0.55),
    }),
    [extraction.confidence?.green, extraction.confidence?.yellow],
  );
  const lastReconciliationSignatureRef = useRef<string>("");

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

          const { token, uploadUrl, path, contentType } =
            (await tokenResponse.json()) as UploadTokenResponse;
          const uploadContentType = contentType || file.type;
          const downloadUrl = encodeURI(
            `${pullHostName.replace(/\/$/, "")}/${path}`,
          );
          currentFileUid = path;

          updateFile(temporaryFileUid, {
            uid: path,
            downloadUrl,
            type: uploadContentType,
            status: "uploading",
          });

          await uploadWithProgress({
            url: buildUploadUrl(uploadUrl, path),
            file,
            contentType: uploadContentType,
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
                contentType: uploadContentType,
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

  useEffect(() => {
    const selectedFiles = (form.selected.selectedFiles ?? []) as SelectedFile[];
    const plan = buildMultiFilePrefillPlan({
      files: selectedFiles,
      greenThreshold: extractionThresholds.green,
    });

    if (
      !plan.signature ||
      plan.signature === lastReconciliationSignatureRef.current
    ) {
      return;
    }

    lastReconciliationSignatureRef.current = plan.signature;

    plan.reviewFormUids.forEach((formUid) => {
      removeFunnelPrefill?.(formUid, {
        documentName: "",
        fileUid: "",
        force: true,
      });
    });

    const autoResult =
      Object.keys(plan.autoPrefill).length > 0
        ? applyFunnelPrefill?.(plan.autoPrefill, {
            documentName: "KI-Auswertung",
            fileUid: "multi-file-extraction",
            force: true,
          })
        : undefined;

    setQuestionElements((prev: any) =>
      updateSelectedFilesInElements(prev, questionKey, formKey, (files) =>
        applyPrefillPlanToFiles(files, plan, autoResult),
      ),
    );
  }, [
    applyFunnelPrefill,
    extractionThresholds.green,
    form.selected.selectedFiles,
    formKey,
    questionKey,
    removeFunnelPrefill,
    setQuestionElements,
  ]);

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
          className="relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-synergy-light-blue hover:bg-synergy-light-grey dark:border-gray-600 dark:bg-gray-700 dark:hover:border-synergy-light-blue dark:hover:bg-gray-800"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <UploadCloud
              className="mb-4 h-8 w-8 text-synergy-light-blue"
              aria-hidden="true"
              strokeWidth={1.8}
            />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-synergy-dark-grey dark:text-synergy-light-grey">
                Klicken zum Hochladen
              </span>{" "}
              oder Drag and Drop
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
            className="flex items-center gap-1 text-sm text-synergy-light-blue hover:underline focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
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
                    <FileText
                      className="h-10 w-10 flex-none text-synergy-dark-grey dark:text-synergy-light-grey"
                      aria-hidden="true"
                      strokeWidth={1.6}
                    />
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">
                    {file.name}
                  </p>
                </div>
                {shouldShowInlineFileStatus(file) && (
                  <p
                    className={`text-sm mt-2 sm:mt-0 min-h-[1.57rem] ${file.status === "error" ? "text-red-600 dark:text-red-500" : file.status === "uploading" || file.status === "minting" ? "text-synergy-light-blue" : "text-green-600 dark:text-green-500"}`}
                  >
                    {fileStatusText(file, form, statusLabels)}
                  </p>
                )}
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
                  className="text-gray-500 hover:text-synergy-light-blue focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2 dark:text-gray-400 dark:hover:text-synergy-light-blue"
                  title="Download"
                >
                  <Download className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  className="text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2 dark:text-gray-400 dark:hover:text-red-500"
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
                  <X className="h-6 w-6" aria-hidden="true" />
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
                extractionFields={extractionFields}
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
        className={`mt-2 min-h-[1.57rem] text-sm ${form.message.type === "error" ? "text-red-600 dark:text-red-500" : form.message.type === "warning" ? "text-orange-600 dark:text-orange-500" : form.message.type === "loading" ? "text-synergy-light-blue" : "text-green-600 dark:text-green-500"}`}
      >
        {form.message.text}
      </p>
    </>
  );
};

function collectAiExtractionFields(
  questionElements: any,
  legacyFields: Record<string, ExtractionFieldConfig>,
): Record<string, ExtractionFieldConfig> {
  const fields: Record<string, ExtractionFieldConfig> = { ...legacyFields };

  Object.values(questionElements ?? {}).forEach((question: any) => {
    Object.values(question?.form ?? {}).forEach((form: any) => {
      const aiExtraction = form?.aiExtraction;
      if (
        !isPlainRecord(aiExtraction) ||
        aiExtraction.enabled === false ||
        aiExtraction.enabled === "false"
      ) {
        return;
      }

      if (isPlainRecord(aiExtraction.fields)) {
        Object.entries(aiExtraction.fields).forEach(([fieldKey, field]) => {
          if (!isPlainRecord(field)) return;
          fields[fieldKey] = normalizeAiExtractionField(field, fieldKey, form);
        });
        return;
      }

      const fieldKey =
        typeof aiExtraction.fieldKey === "string" &&
        aiExtraction.fieldKey.trim()
          ? aiExtraction.fieldKey
          : String(form.uid ?? form.title ?? "field");
      fields[fieldKey] = normalizeAiExtractionField(
        aiExtraction,
        fieldKey,
        form,
      );
    });
  });

  return fields;
}

function normalizeAiExtractionField(
  field: Record<string, any>,
  fieldKey: string,
  form: any,
): ExtractionFieldConfig {
  const type = field.type ?? inferExtractionFieldType(form);

  return {
    label: field.label ?? form.title ?? form.options?.label ?? fieldKey,
    type,
    unit: field.unit ?? form.options?.unit?.value,
    aliases: Array.isArray(field.aliases) ? field.aliases : undefined,
    instructions: field.instructions ?? field.extractionInstructions,
    target: {
      formUid: field.target?.formUid ?? form.uid,
    },
    options:
      type === "single-option" || type === "multi-option"
        ? normalizeAiExtractionOptions(field.options, form)
        : undefined,
  };
}

function inferExtractionFieldType(form: any): string {
  if (form?.type === "range") return "number";
  if (form?.type === "radio") return "single-option";
  if (form?.type === "checkbox" || form?.type === "select") {
    return form.multiple === false ? "single-option" : "multi-option";
  }
  return "text";
}

function normalizeAiExtractionOptions(
  options: unknown,
  form: any,
): ExtractionFieldConfig["options"] {
  if (isPlainRecord(options)) {
    return Object.fromEntries(
      Object.entries(options).map(([optionKey, option]) => {
        const optionRecord = isPlainRecord(option) ? option : {};
        return [
          optionKey,
          {
            targetOptionUid: optionRecord.targetOptionUid ?? optionKey,
            aliases: Array.isArray(optionRecord.aliases)
              ? optionRecord.aliases
              : undefined,
          },
        ];
      }),
    );
  }

  if (!isPlainRecord(form?.options)) return undefined;

  return Object.fromEntries(
    Object.entries(form.options)
      .filter(([, option]) => isPlainRecord(option) && "title" in option)
      .map(([optionKey, option]) => [
        optionKey,
        {
          targetOptionUid:
            (option as Record<string, any>).uid ?? String(optionKey),
          aliases: [(option as Record<string, any>).title ?? String(optionKey)],
        },
      ]),
  );
}

function isPlainRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type ExtractionCandidate = {
  fileIdentity: string;
  fileUid: string;
  fileName: string;
  formUid: string;
  fieldKey?: string;
  label?: string;
  value: unknown;
  valueKey: string;
  confidence: number;
  entry: FunnelPrefillEntry;
  removed: boolean;
};

type MultiFilePrefillPlan = {
  signature: string;
  autoPrefill: Record<string, FunnelPrefillEntry>;
  fileResults: Record<string, FunnelPrefillResult>;
  reviewFormUids: string[];
};

function buildMultiFilePrefillPlan(opts: {
  files: SelectedFile[];
  greenThreshold: number;
}): MultiFilePrefillPlan {
  const candidates = collectExtractionCandidates(opts.files);
  const manualChoices = collectManualPrefillChoices(opts.files);
  const signature = buildMultiFilePrefillSignature(candidates, manualChoices);
  const fileResults = Object.fromEntries(
    opts.files
      .filter((file) => isExtractionOutput(file.extractionResult))
      .map((file) => [selectedFileIdentity(file), emptyPrefillResult()]),
  );
  const autoPrefill: Record<string, FunnelPrefillEntry> = {};
  const reviewFormUids = new Set<string>();
  const byFormUid = groupBy(candidates, (candidate) => candidate.formUid);

  Object.entries(byFormUid).forEach(([formUid, formCandidates]) => {
    const activeCandidates = formCandidates.filter(
      (candidate) => !candidate.removed,
    );
    if (activeCandidates.length === 0) return;

    const byValue = groupBy(
      activeCandidates,
      (candidate) => candidate.valueKey,
    );
    const hasConflictingValues = Object.keys(byValue).length > 1;

    if (hasConflictingValues) {
      const selectedCandidate = selectConflictCandidate(
        activeCandidates,
        manualChoices[formUid],
      );

      if (!selectedCandidate) {
        reviewFormUids.add(formUid);
        activeCandidates.forEach((candidate) =>
          markPrefillSkipped(fileResults, candidate, "conflict"),
        );
        return;
      }

      autoPrefill[formUid] = {
        ...selectedCandidate.entry,
        confidence: selectedCandidate.confidence,
        documentName: selectedCandidate.fileName,
        fileUid: selectedCandidate.fileUid,
      };
      activeCandidates.forEach((candidate) =>
        candidate.valueKey === selectedCandidate.valueKey
          ? markPrefillApplied(fileResults, candidate)
          : markPrefillSkipped(fileResults, candidate, "conflict"),
      );
      return;
    }

    const hasHighConfidence = activeCandidates.some(
      (candidate) => candidate.confidence >= opts.greenThreshold,
    );
    const manualCandidate = selectManualCandidate(
      activeCandidates,
      manualChoices[formUid],
    );

    if (!hasHighConfidence && !manualCandidate) {
      activeCandidates.forEach((candidate) =>
        markPrefillSkipped(fileResults, candidate, "low_confidence"),
      );
      return;
    }

    const bestCandidate =
      manualCandidate ?? highestConfidenceCandidate(activeCandidates);
    autoPrefill[formUid] = {
      ...bestCandidate.entry,
      confidence: bestCandidate.confidence,
      documentName: bestCandidate.fileName,
      fileUid: bestCandidate.fileUid,
    };
    activeCandidates.forEach((candidate) =>
      markPrefillApplied(fileResults, candidate),
    );
  });

  return {
    signature,
    autoPrefill,
    fileResults,
    reviewFormUids: Array.from(reviewFormUids),
  };
}

function applyPrefillPlanToFiles(
  files: SelectedFile[],
  plan: MultiFilePrefillPlan,
  autoResult?: FunnelPrefillResult | void,
): SelectedFile[] {
  const autoSkippedByFormUid = new Map(
    (autoResult?.skipped ?? []).map((entry) => [entry.formUid, entry]),
  );

  return files.map((file) => {
    const identity = selectedFileIdentity(file);
    const result = plan.fileResults[identity];
    if (!result) return file;

    const adjusted = {
      applied: [...result.applied],
      skipped: result.skipped.map((entry) => ({ ...entry })),
    };

    adjusted.applied.forEach((formUid) => {
      const skipped = autoSkippedByFormUid.get(formUid);
      if (!skipped) return;
      adjusted.skipped = [
        ...adjusted.skipped.filter((entry) => entry.formUid !== formUid),
        skipped,
      ];
      adjusted.applied = adjusted.applied.filter((item) => item !== formUid);
    });

    return {
      ...file,
      prefillResult: adjusted,
    };
  });
}

function markManualPrefillChoice(
  files: SelectedFile[],
  opts: {
    formUid: string;
    valueKey: string;
    fallbackResult?: FunnelPrefillResult | void;
  },
): SelectedFile[] {
  const applied = opts.fallbackResult?.applied.includes(opts.formUid) === true;
  const skipped = opts.fallbackResult?.skipped.find(
    (entry) => entry.formUid === opts.formUid,
  );

  return files.map((file) => {
    const output = isExtractionOutput(file.extractionResult)
      ? file.extractionResult
      : null;
    const entry = output?.funnelPrefill?.[opts.formUid];
    if (!entry) return file;

    const result = isPrefillResult(file.prefillResult)
      ? {
          applied: [...file.prefillResult.applied],
          skipped: file.prefillResult.skipped.map((item) => ({ ...item })),
        }
      : emptyPrefillResult();
    const sameValue = normalizePrefillValue(entry.value) === opts.valueKey;

    if (sameValue && applied) {
      result.applied = Array.from(new Set([...result.applied, opts.formUid]));
      result.skipped = result.skipped.filter(
        (item) => item.formUid !== opts.formUid,
      );
    } else {
      result.applied = result.applied.filter(
        (formUid) => formUid !== opts.formUid,
      );
      result.skipped = [
        ...result.skipped.filter((item) => item.formUid !== opts.formUid),
        skipped ?? {
          formUid: opts.formUid,
          label: entry.label,
          reason: sameValue ? "already_filled" : "conflict",
          value: entry.value,
        },
      ];
    }

    return {
      ...file,
      removedPrefill: (file.removedPrefill ?? []).filter(
        (formUid) => formUid !== opts.formUid,
      ),
      manualPrefillChoices: {
        ...(file.manualPrefillChoices ?? {}),
        [opts.formUid]: opts.valueKey,
      },
      prefillResult: result,
    };
  });
}

function collectManualPrefillChoices(
  files: SelectedFile[],
): Record<string, string> {
  const choices: Record<string, string> = {};

  files.forEach((file) => {
    Object.entries(file.manualPrefillChoices ?? {}).forEach(
      ([formUid, valueKey]) => {
        choices[formUid] = valueKey;
      },
    );
  });

  return choices;
}

function selectConflictCandidate(
  candidates: ExtractionCandidate[],
  manualValueKey?: string,
): ExtractionCandidate | null {
  const manualCandidate = selectManualCandidate(candidates, manualValueKey);
  if (manualCandidate) return manualCandidate;

  const bestByValue = Object.values(
    groupBy(candidates, (candidate) => candidate.valueKey),
  ).map(highestConfidenceCandidate);
  const sorted = bestByValue.sort((a, b) => b.confidence - a.confidence);
  const best = sorted[0];
  const secondBest = sorted[1];

  if (!best) return null;
  if (!secondBest || best.confidence > secondBest.confidence) {
    return best;
  }

  return null;
}

function selectManualCandidate(
  candidates: ExtractionCandidate[],
  manualValueKey?: string,
): ExtractionCandidate | null {
  if (!manualValueKey) return null;
  const manualCandidates = candidates.filter(
    (candidate) => candidate.valueKey === manualValueKey,
  );

  return manualCandidates.length > 0
    ? highestConfidenceCandidate(manualCandidates)
    : null;
}

function highestConfidenceCandidate(
  candidates: ExtractionCandidate[],
): ExtractionCandidate {
  return [...candidates].sort((a, b) => b.confidence - a.confidence)[0];
}

function collectExtractionCandidates(
  files: SelectedFile[],
): ExtractionCandidate[] {
  return files.flatMap((file) => {
    const output = isExtractionOutput(file.extractionResult)
      ? file.extractionResult
      : null;
    if (!output?.funnelPrefill) return [];

    return Object.entries(output.funnelPrefill).map(([formUid, entry]) => ({
      fileIdentity: selectedFileIdentity(file),
      fileUid: file.uid,
      fileName: file.name,
      formUid,
      fieldKey: entry.fieldKey,
      label: entry.label,
      value: entry.value,
      valueKey: normalizePrefillValue(entry.value),
      confidence: Number(entry.confidence ?? 0),
      entry: {
        ...entry,
        documentName: entry.documentName ?? file.name,
        fileUid: file.uid,
      },
      removed: file.removedPrefill?.includes(formUid) === true,
    }));
  });
}

function buildMultiFilePrefillSignature(
  candidates: ExtractionCandidate[],
  manualChoices: Record<string, string>,
): string {
  if (candidates.length === 0) return "";

  const candidateSignature = candidates
    .map((candidate) =>
      [
        candidate.fileIdentity,
        candidate.formUid,
        candidate.valueKey,
        candidate.confidence,
        candidate.removed ? "removed" : "active",
      ].join(":"),
    )
    .sort()
    .join("|");
  const manualChoiceSignature = Object.entries(manualChoices)
    .map(([formUid, valueKey]) => `${formUid}:${valueKey}`)
    .sort()
    .join("|");

  return `${candidateSignature}::choices:${manualChoiceSignature}`;
}

function markPrefillApplied(
  fileResults: Record<string, FunnelPrefillResult>,
  candidate: ExtractionCandidate,
) {
  const result =
    fileResults[candidate.fileIdentity] ??
    (fileResults[candidate.fileIdentity] = emptyPrefillResult());
  result.applied = Array.from(new Set([...result.applied, candidate.formUid]));
  result.skipped = result.skipped.filter(
    (entry) => entry.formUid !== candidate.formUid,
  );
}

function markPrefillSkipped(
  fileResults: Record<string, FunnelPrefillResult>,
  candidate: ExtractionCandidate,
  reason: string,
) {
  const result =
    fileResults[candidate.fileIdentity] ??
    (fileResults[candidate.fileIdentity] = emptyPrefillResult());
  result.applied = result.applied.filter(
    (formUid) => formUid !== candidate.formUid,
  );
  result.skipped = [
    ...result.skipped.filter((entry) => entry.formUid !== candidate.formUid),
    {
      formUid: candidate.formUid,
      label: candidate.label,
      reason,
      value: candidate.value,
    },
  ];
}

function emptyPrefillResult(): FunnelPrefillResult {
  return { applied: [], skipped: [] };
}

function groupBy<T>(
  values: T[],
  getKey: (value: T) => string,
): Record<string, T[]> {
  return values.reduce<Record<string, T[]>>((acc, value) => {
    const key = getKey(value);
    acc[key] = [...(acc[key] ?? []), value];
    return acc;
  }, {});
}

function selectedFileIdentity(file: SelectedFile): string {
  return file.clientId ?? file.uid;
}

function omitRecordKey<T>(
  record: Record<string, T> | undefined,
  keyToOmit: string,
): Record<string, T> | undefined {
  if (!record) return undefined;
  const next = Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== keyToOmit),
  ) as Record<string, T>;
  return Object.keys(next).length > 0 ? next : undefined;
}

function normalizePrefillValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `array:${value.map(normalizePrefillValue).sort().join("|")}`;
  }

  if (typeof value === "number") {
    return `number:${Math.round(value * 10000) / 10000}`;
  }

  if (typeof value === "string") {
    return `string:${value.trim().toLowerCase().replace(/\s+/g, " ")}`;
  }

  if (value == null) {
    return "null";
  }

  return `json:${JSON.stringify(value)}`;
}

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

function shouldShowInlineFileStatus(file: SelectedFile): boolean {
  return !["queued", "extracting", "extracted"].includes(file.status);
}

type ExtractionRowStatus = "partial" | "applied" | "skipped" | "removed";

type ExtractionDisplayRow = {
  fieldKey: string;
  formUid?: string;
  label: string;
  displayValue: string;
  valueKey: string;
  confidence?: number;
  sourceQuote?: string | null;
  sourcePage?: number | null;
  status: ExtractionRowStatus;
  skipReason?: string;
  canRemove: boolean;
  canApply: boolean;
  prefillEntry?: FunnelPrefillEntry;
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
        valueKey: normalizePrefillValue(funnelValue?.value ?? extracted.value),
        confidence:
          output?.confidences?.[fieldKey] ??
          funnelValue?.confidence ??
          undefined,
        sourceQuote: grounded.source_quote ?? funnelValue?.sourceQuote ?? null,
        sourcePage: grounded.source_page ?? funnelValue?.sourcePage ?? null,
        status,
        skipReason: skipped?.reason,
        canRemove: status === "applied" && Boolean(formUid),
        canApply:
          Boolean(formUid && funnelValue) &&
          (status === "removed" ||
            (status === "skipped" &&
              (skipped?.reason === "low_confidence" ||
                skipped?.reason === "conflict"))),
        prefillEntry: funnelValue,
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
  if (row.status === "applied") return "Übernommen";
  if (row.status === "removed") return "Entfernt";
  if (row.status === "skipped") {
    if (row.skipReason === "low_confidence" || row.skipReason === "conflict") {
      return "Prüfen";
    }
    if (row.skipReason === "already_filled") return "Vorhanden";
    return "Nicht übernommen";
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
  return "bg-synergy-light-blue/15 text-synergy-dark-grey dark:bg-synergy-light-blue/20 dark:text-synergy-light-grey";
}

function rowActionLabel(row: ExtractionDisplayRow): string {
  return row.status === "removed" ? "Hinzufügen" : "Übernehmen";
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
      className="mt-1 h-4 overflow-hidden text-[11px] text-synergy-dark-grey/80 dark:text-synergy-light-grey"
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
    <div className="shrink-0 rounded-md border border-synergy-light-blue/30 bg-white/80 px-2 py-1 text-right shadow-sm dark:border-synergy-light-blue/40 dark:bg-gray-900/70">
      <div className="flex items-baseline justify-end gap-0.5 font-mono text-sm font-semibold text-synergy-dark-grey dark:text-synergy-light-grey">
        <AnimatedElapsedSeconds seconds={seconds} />
        <span className="text-[10px] font-sans font-medium text-synergy-light-blue">
          s
        </span>
      </div>
      <div className="text-[10px] text-synergy-light-blue">
        {completed ? "Dauer" : ""}
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
              const manualPrefillChoices = omitRecordKey(
                selectedFile.manualPrefillChoices,
                formUid,
              );

              if (!isSameSelectedFile(selectedFile, file)) {
                return {
                  ...selectedFile,
                  manualPrefillChoices,
                };
              }

              return {
                ...selectedFile,
                manualPrefillChoices,
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

  const markPrefillChoiceAccepted = useCallback(
    (row: ExtractionDisplayRow, prefillResult?: FunnelPrefillResult | void) => {
      if (!row.formUid) return;

      setQuestionElements((prev: any) => {
        return updateSelectedFilesInElements(
          prev,
          questionKey,
          formKey,
          (selectedFiles) =>
            markManualPrefillChoice(selectedFiles, {
              formUid: row.formUid!,
              valueKey: row.valueKey,
              fallbackResult: prefillResult,
            }),
        );
      });
    },
    [formKey, questionKey, setQuestionElements],
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
    <div className="mt-1 rounded border border-synergy-light-blue/30 bg-synergy-light-blue/10 p-2 text-xs text-synergy-dark-grey dark:border-synergy-light-blue/40 dark:bg-synergy-light-blue/10 dark:text-synergy-light-grey">
      <ExtractionAnimationStyles />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full bg-synergy-light-blue ${extractionIsFinished ? "" : "animate-pulse"}`}
            />
            {extractionProgressLabel}
          </div>
          <RotatingExtractionText text={extractionStatusMessage} />
        </div>
        {extractionIsFinished && (
          <ExtractionTimer
            seconds={elapsedSeconds}
            completed={extractionIsFinished}
          />
        )}
      </div>
      {extractedRows.length > 0 && (
        <ul className="mt-2 grid gap-2">
          {extractedRows.map((row) => (
            <li
              key={`${row.fieldKey}-${row.formUid ?? row.label}`}
              className="extraction-field-reveal rounded border border-synergy-light-blue/20 bg-white/80 p-2 dark:border-synergy-light-blue/30 dark:bg-gray-900/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-synergy-dark-grey dark:text-synergy-light-grey">
                    {row.label}
                  </div>
                  <div className="break-words font-mono text-[11px] text-synergy-dark-grey/80 dark:text-synergy-light-grey">
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
                  {row.canApply && row.formUid && row.prefillEntry && (
                    <button
                      className="rounded border border-synergy-light-blue/40 px-1.5 py-0.5 text-[11px] font-medium text-synergy-dark-grey hover:bg-synergy-light-blue/10 dark:border-synergy-light-blue/50 dark:text-synergy-light-grey dark:hover:bg-synergy-light-blue/10"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!row.formUid || !row.prefillEntry) return;
                        const prefillEntry = row.prefillEntry;
                        const prefillResult = applyFunnelPrefill?.(
                          {
                            [row.formUid]: {
                              ...prefillEntry,
                              value: prefillEntry.value,
                              documentName: file.name,
                              fileUid: file.uid,
                            },
                          },
                          {
                            documentName: file.name,
                            fileUid: file.uid,
                            force: true,
                            userReviewed: true,
                          },
                        );
                        markPrefillChoiceAccepted(row, prefillResult);
                      }}
                    >
                      {rowActionLabel(row)}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-synergy-dark-grey/70 dark:text-synergy-light-grey/90">
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
          <p className="mt-1 text-synergy-dark-grey dark:text-synergy-light-grey">
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
          className="h-full bg-synergy-light-blue transition-all"
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
  contentType: string;
  token: string;
  onProgress: (percent: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", opts.url);
    xhr.setRequestHeader("X-Upload-Token", opts.token);
    xhr.setRequestHeader("Content-Type", opts.contentType);

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
