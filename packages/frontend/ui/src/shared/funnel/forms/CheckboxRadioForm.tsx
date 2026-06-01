"use client";

import { type Dispatch } from "react";
import type { FunnelAction } from "../state/funnelReducer";
import type { OptionSource } from "../hooks/useFunnelElements";
import { renderFunnelOptionIcon } from "../utils/funnelHelpers";

type CheckboxRadioFormProps = {
  questionElements: Record<string, any>;
  questionKey: string;
  formKey: string;
  dispatch: Dispatch<FunnelAction>;
  applyOptionSideEffects: (from: OptionSource, option: any) => void;
  removeOptionSideEffects: (questionKey: string, fromOptionKey: string) => void;
  debouncedGetNextQuestionKey: (questionKey: string, formKey: string) => void;
  debouncedCountQuestionsAndSet: () => void;
};

export function CheckboxRadioForm({
  questionElements,
  questionKey,
  formKey,
  dispatch,
  applyOptionSideEffects,
  removeOptionSideEffects,
  debouncedGetNextQuestionKey,
  debouncedCountQuestionsAndSet,
}: CheckboxRadioFormProps) {
  const form = questionElements[questionKey].form[formKey];
  const formType: "checkbox" | "radio" = form.type;

  return (
    <>
      <ul className="grid w-full gap-6 grid-flow-row md:grid-cols-6">
        {Object.keys(form.options).map((optionKey: any) => (
          <li
            key={optionKey}
            className={`col-span-${form.options[optionKey].span}`}
          >
            <input
              type={formType === "checkbox" ? "checkbox" : "radio"}
              disabled={form.options[optionKey].disabled}
              name={formKey}
              id={optionKey}
              checked={
                form.selected.selectedOptionsUid.includes(optionKey) ||
                form.selected.selectedOptions.includes(
                  form.options[optionKey].title,
                )
              }
              tabIndex={0}
              onChange={(e) => {
                const { checked } = e.target;
                if (checked) {
                  /** Clean deselection for radio: drop forms/questions added by
                   * the previously selected option before selecting the new one */
                  if (
                    formType === "radio" &&
                    form.selected.selectedOptionsUid.length > 0
                  ) {
                    form.selected.selectedOptionsUid.forEach(
                      (optionUid: string) => {
                        removeOptionSideEffects(questionKey, optionUid);
                      },
                    );
                  }

                  applyOptionSideEffects(
                    {
                      fromQuestionKey: questionKey,
                      fromFormKey: formKey,
                      fromOptionKey: optionKey,
                    },
                    form.options[optionKey],
                  );
                  dispatch({
                    type: "SELECT_OPTION",
                    questionKey,
                    formKey,
                    optionKey,
                    formType,
                  });
                } else {
                  /** Checkbox uncheck */
                  removeOptionSideEffects(questionKey, optionKey);
                  dispatch({
                    type: "DESELECT_OPTION",
                    questionKey,
                    formKey,
                    optionKey,
                  });
                }

                /** Validate input (especially useful if user forgot input at a
                 * form above) and update progress count. Debounced because state
                 * may not have updated right away. */
                debouncedGetNextQuestionKey(questionKey, formKey);
                debouncedCountQuestionsAndSet();
              }}
              className="hidden peer"
              required={true}
            />
            <label
              htmlFor={optionKey}
              className="inline-flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-5 text-synergy-dark-grey transition-colors hover:border-synergy-light-blue/50 hover:bg-synergy-light-grey hover:text-synergy-dark-grey peer-checked:border-synergy-light-blue peer-checked:text-synergy-dark-grey peer-focus-visible:ring-2 peer-focus-visible:ring-synergy-light-blue peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:hover:bg-white peer-disabled:hover:text-synergy-dark-grey dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:border-synergy-light-blue dark:peer-checked:text-synergy-light-grey"
            >
              <div className="block">
                {renderFunnelOptionIcon(form.options[optionKey])}
                <div className="w-full text-lg font-semibold">
                  {form.options[optionKey].title}
                </div>
                <div className="w-full text-sm">
                  {form.options[optionKey].description}
                </div>
              </div>
            </label>
          </li>
        ))}
      </ul>
      <p
        className={`text-sm w-full inline-block mt-2 min-h-[1.57rem] ${form.message.type === "error" ? "text-red-600 dark:text-red-500" : form.message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
      >
        {form.message.text}
      </p>
    </>
  );
}
