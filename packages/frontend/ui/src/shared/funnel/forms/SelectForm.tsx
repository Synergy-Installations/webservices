"use client";

import { type Dispatch } from "react";
import type { FunnelAction } from "../state/funnelReducer";
import type { OptionSource } from "../hooks/useFunnelElements";

type SelectFormProps = {
  questionElements: Record<string, any>;
  questionKey: string;
  formKey: string;
  dispatch: Dispatch<FunnelAction>;
  applyOptionSideEffects: (from: OptionSource, option: any) => void;
  removeOptionSideEffects: (questionKey: string, fromOptionKey: string) => void;
  debouncedGetNextQuestionKey: (questionKey: string, formKey: string) => void;
  debouncedCountQuestionsAndSet: () => void;
};

export function SelectForm({
  questionElements,
  questionKey,
  formKey,
  dispatch,
  applyOptionSideEffects,
  removeOptionSideEffects,
  debouncedGetNextQuestionKey,
  debouncedCountQuestionsAndSet,
}: SelectFormProps) {
  const form = questionElements[questionKey].form[formKey];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="">
        <label
          htmlFor={formKey}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          {form.label}
        </label>
        <select
          id={formKey}
          value={
            form.multiple
              ? form.selected.selectedOptions
              : form.selected.selectedOptions[0]
          }
          multiple={form.multiple}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-synergy-light-blue dark:focus:ring-synergy-light-blue"
          onChange={(e) => {
            const selectedOptionValues = Array.from(e.target.selectedOptions).map(
              (option) => option.value,
            );

            const selectedOptionKeys = selectedOptionValues.map(
              (value) =>
                Object.keys(form.options).find(
                  (key) => form.options[key].title === value,
                ) || "",
            );

            /** Clean deselection for deselected elements */
            if (form.selected.selectedOptionsUid.length > 0) {
              form.selected.selectedOptionsUid.forEach((optionUid: string) => {
                if (!selectedOptionKeys.includes(optionUid)) {
                  removeOptionSideEffects(questionKey, optionUid);
                }
              });
            }

            /** Add side effects for the newly selected options */
            selectedOptionKeys.forEach((optionKey: string) => {
              if (!form.selected.selectedOptionsUid.includes(optionKey)) {
                applyOptionSideEffects(
                  {
                    fromQuestionKey: questionKey,
                    fromFormKey: formKey,
                    fromOptionKey: optionKey,
                  },
                  form.options[optionKey],
                );
              }
            });

            dispatch({
              type: "SET_SELECT_OPTIONS",
              questionKey,
              formKey,
              optionKeys: selectedOptionKeys,
            });

            localStorage.setItem(
              `${questionElements[questionKey].uid}-${form.uid}`,
              selectedOptionKeys
                .map((optionKey: string) => form.options[optionKey].title)
                .toString(),
            );

            /** Validate input and update progress count (debounced) */
            debouncedGetNextQuestionKey(questionKey, formKey);
            debouncedCountQuestionsAndSet();
          }}
        >
          {Object.keys(form.options).map((optionKey: any) => (
            <option key={optionKey} value={form.options[optionKey].title}>
              {form.options[optionKey].title}
            </option>
          ))}
        </select>
        <p
          className={`text-sm mt-2 min-h-[1.57rem] ${form.message.type === "error" ? "text-red-600 dark:text-red-500" : form.message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
        >
          {form.message.text}
        </p>
      </div>
    </div>
  );
}
