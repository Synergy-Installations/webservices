"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import type { FunnelElements } from "../state/funnelReducer";
import { renderFunnelOptionIcon } from "../utils/funnelHelpers";

type CardPopupFormProps = {
  questionElements: Record<string, any>;
  questionKey: string;
  formKey: string;
  setQuestionElements: (updater: SetStateAction<FunnelElements>) => void;
  debouncedGetNextQuestionKey: (questionKey: string, formKey: string) => void;
  debouncedCountQuestionsAndSet: () => void;
  t: (key: string) => string;
};

/** Ordered list of a card's pop-up fields. */
function orderedFieldKeys(option: any): string[] {
  return Object.keys(option?.fields ?? {}).sort(
    (a, b) =>
      Number(option.fields[a]?.order ?? 0) -
      Number(option.fields[b]?.order ?? 0),
  );
}

/** Human readable value for a single field (used for the card summary chips). */
function fieldDisplayValue(field: any, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (field?.type === "choice") {
    return field.options?.[value as string]?.title ?? String(value);
  }
  if (field?.type === "range") {
    return `${value}${field.unit ?? ""}`;
  }
  if (field?.type === "split-range") {
    const end = Number(value);
    const start = 100 - end;
    return `${field.endLabel}: ${end}% / ${field.startLabel}: ${start}%`;
  }
  if (field?.type === "number") {
    return field.unit ? `${value} ${field.unit}` : String(value);
  }
  return String(value);
}

/**
 * Conditional visibility for a pop-up field. A field with
 * `showWhen: { field, equals }` is only shown when the referenced sibling field
 * currently holds the matching value (e.g. show "% Kreuzverbund" only when the
 * "Kreuzverbund" choice is "ja").
 */
function isFieldVisible(field: any, fieldValues: Record<string, any>): boolean {
  const cond = field?.showWhen;
  if (!cond?.field) return true;
  return (fieldValues?.[cond.field] ?? "") === cond.equals;
}

/**
 * Renders selectable product cards (like the Dachtyp/Untergrund cards). Picking
 * a card selects it and opens a pop-up holding that card's fields. Everything is
 * optional - a card can be selected without filling anything - and the filled
 * values are shown as chips beneath the card. Single- or multi-select is driven
 * by the form's `multiple` flag (multi-select in our case).
 */
export function CardPopupForm({
  questionElements,
  questionKey,
  formKey,
  setQuestionElements,
  debouncedGetNextQuestionKey,
  debouncedCountQuestionsAndSet,
  t,
}: CardPopupFormProps) {
  const form = questionElements[questionKey].form[formKey];
  const isMultiple = form.multiple === true || form.multiple === "true";

  const [openOptionKey, setOpenOptionKey] = useState<string | null>(null);

  const isSelected = (optionKey: string): boolean =>
    form.selected.selectedOptionsUid.includes(optionKey);

  /** Reflect a selection change in progress/validation (debounced). */
  const refreshProgress = () => {
    debouncedGetNextQuestionKey(questionKey, formKey);
    debouncedCountQuestionsAndSet();
  };

  const selectCard = (optionKey: string) => {
    setQuestionElements((prev) => {
      const updated = { ...prev };
      const target = updated[questionKey].form[formKey];
      const title = target.options[optionKey].title;
      if (!isMultiple) {
        target.selected.selectedOptionsUid = [optionKey];
        target.selected.selectedOptions = [title];
      } else if (!target.selected.selectedOptionsUid.includes(optionKey)) {
        target.selected.selectedOptionsUid = [
          ...target.selected.selectedOptionsUid,
          optionKey,
        ];
        target.selected.selectedOptions = [
          ...target.selected.selectedOptions,
          title,
        ];
      }
      if (!target.selected.fields[optionKey]) {
        target.selected.fields[optionKey] = {};
      }
      return updated;
    });
    refreshProgress();
  };

  const deselectCard = (optionKey: string) => {
    setQuestionElements((prev) => {
      const updated = { ...prev };
      const target = updated[questionKey].form[formKey];
      const title = target.options[optionKey].title;
      target.selected.selectedOptionsUid =
        target.selected.selectedOptionsUid.filter(
          (key: string) => key !== optionKey,
        );
      target.selected.selectedOptions = target.selected.selectedOptions.filter(
        (option: string) => option !== title,
      );
      return updated;
    });
    refreshProgress();
  };

  const setFieldValue = (
    optionKey: string,
    fieldKey: string,
    value: string,
  ) => {
    setQuestionElements((prev) => {
      const updated = { ...prev };
      const target = updated[questionKey].form[formKey];
      if (!target.selected.fields[optionKey]) {
        target.selected.fields[optionKey] = {};
      }
      target.selected.fields[optionKey][fieldKey] = value;
      return updated;
    });
    debouncedCountQuestionsAndSet();
  };

  const handleCardClick = (optionKey: string) => {
    if (!isSelected(optionKey)) {
      selectCard(optionKey);
    }
    setOpenOptionKey(optionKey);
  };

  const openOption = openOptionKey ? form.options[openOptionKey] : null;
  const openFieldValues =
    (openOptionKey && form.selected.fields[openOptionKey]) || {};

  const openFieldKeys = openOption
    ? orderedFieldKeys(openOption).filter((fieldKey) =>
        isFieldVisible(openOption.fields[fieldKey], openFieldValues),
      )
    : [];
  /** Show an "optional selection criteria" hint when none of the card's fields
   * are required. */
  const allFieldsOptional =
    openFieldKeys.length > 0 &&
    openFieldKeys.every((fieldKey) => {
      const required = openOption.fields[fieldKey]?.required;
      return required !== true && required !== "true";
    });

  return (
    <>
      <ul className="grid w-full gap-6 grid-flow-row md:grid-cols-6">
        {Object.keys(form.options).map((optionKey: string) => {
          const option = form.options[optionKey];
          const selected = isSelected(optionKey);
          const fieldValues = form.selected.fields[optionKey] ?? {};
          const filledChips = orderedFieldKeys(option)
            .filter((fieldKey) =>
              isFieldVisible(option.fields[fieldKey], fieldValues),
            )
            .map((fieldKey) => ({
              field: option.fields[fieldKey],
              value: fieldDisplayValue(
                option.fields[fieldKey],
                fieldValues[fieldKey],
              ),
            }))
            .filter((chip) => chip.value !== "");

          return (
            <li key={optionKey} className={`col-span-${option.span}`}>
              <button
                type="button"
                disabled={option.disabled === true || option.disabled === "true"}
                onClick={() => handleCardClick(optionKey)}
                className={`flex w-full flex-col items-start gap-2 rounded-lg border-2 bg-white p-5 text-left text-synergy-dark-grey transition-colors hover:border-synergy-light-blue/50 hover:bg-synergy-light-grey focus:outline-none focus-visible:ring-2 focus-visible:ring-synergy-light-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 ${
                  selected
                    ? "border-synergy-light-blue"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="block">
                    {renderFunnelOptionIcon(option)}
                    <div className="w-full text-lg font-semibold">
                      {option.title}
                    </div>
                    {option.description && (
                      <div className="w-full text-sm">{option.description}</div>
                    )}
                  </div>
                  {selected && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={t("ui.cards.remove")}
                      onClick={(e) => {
                        e.stopPropagation();
                        deselectCard(optionKey);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          deselectCard(optionKey);
                        }
                      }}
                      className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-synergy-light-blue/10 text-synergy-light-blue transition-colors hover:bg-synergy-light-blue hover:text-white"
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                    </span>
                  )}
                </div>

                {selected && (
                  <div className="mt-1 flex w-full flex-wrap gap-1.5">
                    {filledChips.length > 0 ? (
                      filledChips.map((chip) => (
                        <span
                          key={chip.field.uid}
                          className="inline-flex items-center gap-1 rounded bg-synergy-light-blue/10 px-1.5 py-0.5 text-xs font-medium text-synergy-light-blue"
                        >
                          <span className="font-semibold">
                            {chip.field.label}:
                          </span>
                          {chip.value}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        {t("ui.cards.tapToEdit")}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p
        className={`text-sm w-full inline-block mt-2 min-h-[1.57rem] ${
          form.message.type === "error"
            ? "text-red-600 dark:text-red-500"
            : form.message.type === "warning"
              ? "text-orange-600 dark:text-orange-500"
              : "text-green-600 dark:text-green-500"
        }`}
      >
        {form.message.text}
      </p>

      <Dialog
        open={openOptionKey !== null}
        onClose={() => setOpenOptionKey(null)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-synergy-dark-grey bg-white p-8 shadow-lg dark:bg-gray-800">
            {openOption && (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-xl font-bold">
                      {openOption.title}
                    </DialogTitle>
                    {allFieldsOptional && (
                      <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        {t("ui.cards.allOptional")}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={t("ui.cards.close")}
                    onClick={() => setOpenOptionKey(null)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700"
                  >
                    <X aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  {openFieldKeys.map((fieldKey) => {
                    const field = openOption.fields[fieldKey];
                    const value = openFieldValues[fieldKey] ?? "";
                    const fieldRequired =
                      field.required === true || field.required === "true";

                    return (
                      <div key={field.uid} className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                          {field.label}
                          {/** When the card mixes required and optional fields,
                           * label each one so the requirement is explicit. */}
                          {!allFieldsOptional &&
                            (fieldRequired ? (
                              <span className="inline-flex items-center rounded bg-synergy-light-blue/10 px-1.5 py-0.5 text-xs font-medium text-synergy-light-blue dark:bg-synergy-light-blue/20">
                                {t("ui.formLabel.required")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                {t("ui.formLabel.optional")}
                              </span>
                            ))}
                        </label>
                        {/** Optional hint shown beneath the label (e.g. "Wenn nicht
                         * sicher, dann schätzen Sie"). */}
                        {field.description && (
                          <p className="text-xs text-synergy-light-blue">
                            {field.description}
                          </p>
                        )}

                        {field.type === "choice" ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(field.options ?? {}).map(
                              (fieldOptKey) => {
                                const active = value === fieldOptKey;
                                return (
                                  <button
                                    key={fieldOptKey}
                                    type="button"
                                    onClick={() =>
                                      setFieldValue(
                                        openOptionKey as string,
                                        fieldKey,
                                        active ? "" : fieldOptKey,
                                      )
                                    }
                                    className={`rounded-lg border-2 px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-synergy-light-blue focus-visible:ring-offset-2 ${
                                      active
                                        ? "border-synergy-light-blue bg-synergy-light-blue/10 text-synergy-light-blue"
                                        : "border-gray-200 text-synergy-dark-grey hover:border-synergy-light-blue/50 dark:border-gray-600 dark:text-gray-300"
                                    }`}
                                  >
                                    {field.options[fieldOptKey].title}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        ) : field.type === "textarea" ? (
                          <textarea
                            value={value}
                            rows={Number(field.rows ?? 3)}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              setFieldValue(
                                openOptionKey as string,
                                fieldKey,
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        ) : field.type === "number" ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={value}
                              placeholder={field.placeholder}
                              min={field.min ?? undefined}
                              max={field.max ?? undefined}
                              step={field.step ?? undefined}
                              onChange={(e) =>
                                setFieldValue(
                                  openOptionKey as string,
                                  fieldKey,
                                  e.target.value,
                                )
                              }
                              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            {field.unit && (
                              <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                                {field.unit}
                              </span>
                            )}
                          </div>
                        ) : field.type === "range" ? (
                          (() => {
                            const min = Number(field.min ?? 0);
                            const max = Number(field.max ?? 100);
                            const current =
                              value !== ""
                                ? Number(value)
                                : Number(field.default ?? min);
                            return (
                              <div className="space-y-1">
                                <input
                                  type="range"
                                  min={min}
                                  max={max}
                                  step={field.step ?? 1}
                                  value={current}
                                  onChange={(e) =>
                                    setFieldValue(
                                      openOptionKey as string,
                                      fieldKey,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full accent-synergy-light-blue"
                                />
                                <div className="text-right text-sm font-medium text-synergy-dark-grey dark:text-gray-300">
                                  {current}
                                  {field.unit ?? ""}
                                </div>
                              </div>
                            );
                          })()
                        ) : field.type === "split-range" ? (
                          (() => {
                            /** A single value drives a complementary split: the
                             * stored number is the "end" share, the start share is
                             * its complement to 100 %. */
                            const end =
                              value !== ""
                                ? Number(value)
                                : Number(field.default ?? 50);
                            const start = 100 - end;
                            return (
                              <div className="space-y-1">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  step={field.step ?? 5}
                                  value={end}
                                  onChange={(e) =>
                                    setFieldValue(
                                      openOptionKey as string,
                                      fieldKey,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full accent-synergy-light-blue"
                                />
                                <div className="flex justify-between text-sm font-medium text-synergy-dark-grey dark:text-gray-300">
                                  <span>
                                    {field.startLabel}: {start}%
                                  </span>
                                  <span>
                                    {field.endLabel}: {end}%
                                  </span>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <input
                            type="text"
                            value={value}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              setFieldValue(
                                openOptionKey as string,
                                fieldKey,
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenOptionKey(null)}
                    className="rounded-md bg-synergy-light-blue px-4 py-2 text-white transition-colors hover:bg-synergy-light-blue/90 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2"
                  >
                    {t("ui.cards.done")}
                  </button>
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
