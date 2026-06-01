"use client";

import { type Dispatch } from "react";
import type { FunnelAction } from "../state/funnelReducer";

type TextInputFormProps = {
  questionElements: Record<string, any>;
  questionKey: string;
  formKey: string;
  dispatch: Dispatch<FunnelAction>;
  debouncedGetNextQuestionKey: (questionKey: string, formKey: string) => void;
};

export function TextInputForm({
  questionElements,
  questionKey,
  formKey,
  dispatch,
  debouncedGetNextQuestionKey,
}: TextInputFormProps) {
  const form = questionElements[questionKey].form[formKey];

  const handleChange = (value: string) => {
    dispatch({ type: "SET_INPUT_VALUE", questionKey, formKey, value });

    /** Save input in localStorage if dared */
    form.localStorage &&
      localStorage.setItem(
        `${questionElements[questionKey].uid}-${form.uid}`,
        value,
      );
  };

  /** Validate input (especially useful if user forgot input at a form above).
   * Debounced because state may not have updated right away. */
  const handleBlur = () => debouncedGetNextQuestionKey(questionKey, formKey);

  return (
    <div className="grid gap-6">
      <div>
        <label
          htmlFor={formKey}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          {form.options.label}
        </label>
        {form.type === "textarea" ? (
          <textarea
            id={formKey}
            rows={form.options.rows}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-synergy-light-blue dark:focus:ring-synergy-light-blue"
            placeholder={form.options.placeholder}
            required={form.required}
            value={form.selected.inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
          ></textarea>
        ) : (
          <input
            type={form.type}
            id={formKey}
            className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm ${form.message.type === "success" ? "border-green-500 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500 dark:border-green-500 dark:bg-gray-700 dark:text-green-400 dark:placeholder-green-500" : "border-gray-300 text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-synergy-light-blue dark:focus:ring-synergy-light-blue"} `}
            placeholder={form.options.placeholder}
            value={form.selected.inputValue}
            required={form.required}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
          />
        )}
        <p
          className={`text-sm mt-2 min-h-[1.57rem] ${form.message.type === "error" ? "text-red-600 dark:text-red-500" : form.message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
        >
          {form.message.text}
        </p>
      </div>
    </div>
  );
}
