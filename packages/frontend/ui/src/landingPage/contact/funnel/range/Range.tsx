import { useNumberFormat, format } from "@react-input/number-format";
import { form } from "framer-motion/client";
import { formatLocaleNumberToUniNumber } from "@com.synergy/frontend-ui/LocaleNumber";
import { Minus, Plus } from "lucide-react";

/* eslint-disable-next-line */
export interface RangeProps {
  questionKey: string;
  formKey: string;
  questionElements: any;
  setQuestionElements: any;
  debouncedGetNextQuestionKey: any;
  debouncedCalculateForms: any;
}

export const Range = (props: RangeProps) => {
  const {
    questionKey,
    formKey,
    questionElements,
    setQuestionElements,
    debouncedCalculateForms,
    debouncedGetNextQuestionKey,
  } = props;

  const options = {
    locales:
      questionElements[questionKey].form[formKey].options.unit.numberFormat,
    maximumFractionDigits: 2,
  };

  const inputRef = useNumberFormat(options);

  const locale =
    questionElements[questionKey].form[formKey].options.unit.numberFormat;
  const isExponentialScale =
    questionElements[questionKey].form[formKey].options.range.type === "exp";

  const min = Math.max(
    0.01,
    questionElements[questionKey].form[formKey].options.range.min,
  );
  const max = questionElements[questionKey].form[formKey].options.range.max;
  const sliderMin = Number(
    questionElements[questionKey].form[formKey].options.range.min ?? 0,
  );
  const sliderMax = Number(
    questionElements[questionKey].form[formKey].options.range.max ?? 100,
  );
  const sliderValue = Number(
    questionElements[questionKey].form[formKey].selected.rangeValue ??
      sliderMin,
  );
  const sliderThumbPercent =
    sliderMax > sliderMin
      ? Math.min(
          100,
          Math.max(
            0,
            ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100,
          ),
        )
      : 0;

  const configuredStep = Number(
    questionElements[questionKey].form[formKey].options.range.step ?? 1,
  );

  const snapToStep = (value: number): number => {
    if (!configuredStep || configuredStep <= 0) return value;
    return Math.round(value / configuredStep) * configuredStep;
  };

  const convertToExponential = (value: number) => {
    if (!isExponentialScale) return value;
    const scale = (value - min) / (max - min); // Normalize value to a 0-1 range
    return Math.exp(scale * Math.log(max / min)) * min;
  };
  const convertToRange = (exponentialValue: number) => {
    if (!isExponentialScale) return exponentialValue;
    // Convert the exponentialValue back to the range slider value
    return (
      (Math.log(exponentialValue / min) / Math.log(max / min)) * (max - min) +
      min
    );
  };
  return (
    <>
      <RangeInputStyles />
      <div className="relative mb-6">
        <div className="relative flex items-center mx-auto max-w-[11rem]">
          <button
            type="button"
            id="decrement-button"
            data-input-counter-decrement="bedrooms-input"
            className="h-11 rounded-s-lg border border-gray-300 bg-gray-100 p-3 text-synergy-dark-grey hover:bg-synergy-light-grey focus:outline-none focus:ring-2 focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-synergy-light-blue"
            onClick={() => {
              /** Runs twice in dev - not to panic - only evokes change once in prod */
              setQuestionElements((prev: any) => {
                const updatedElements = { ...prev };
                updatedElements[questionKey].form[
                  formKey
                ].selected.selectedValue = format(
                  Math.max(
                    questionElements[questionKey].form[formKey].options.range
                      .min,
                    formatLocaleNumberToUniNumber(
                      questionElements[questionKey].form[formKey].selected
                        .selectedValue,
                      locale,
                    ) -
                      questionElements[questionKey].form[formKey].options
                        .buttons.decrementBy,
                  ),
                  options,
                );
                updatedElements[questionKey].form[formKey].selected.rangeValue =
                  convertToRange(
                    Math.max(
                      // Min input is 0.01 or we get infinity in exponential scale
                      Math.max(
                        0.01,
                        questionElements[questionKey].form[formKey].options
                          .range.min,
                      ),
                      formatLocaleNumberToUniNumber(
                        questionElements[questionKey].form[formKey].selected
                          .selectedValue,
                        locale,
                      ) -
                        questionElements[questionKey].form[formKey].options
                          .buttons.decrementBy,
                    ),
                  );
                return updatedElements;
              });

              /** Validate input (especially useful if user forgot input at form above)
               * Need to be debounced as it may happen that state is not updated right away
               */
              debouncedGetNextQuestionKey(questionKey, formKey);
              debouncedCalculateForms(questionKey, formKey);
            }}
          >
            <Minus className="h-3 w-3" aria-hidden="true" strokeWidth={3} />
          </button>
          <input
            // type="text"
            // title="Rate"
            // min="0.00"
            // step="0.001"
            // max="1.00"
            id={`${formKey}-input`}
            ref={inputRef}
            // data-input-counter
            // data-input-counter-min="1"
            // data-input-counter-max="5"
            // aria-describedby="helper-text-explanation"
            className="funnel-range-value-input block h-11 w-full border-x-0 border-y border-gray-300 bg-gray-50 pb-6 text-center text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            // placeholder="123,456.12"
            value={
              questionElements[questionKey].form[formKey].selected.selectedValue
            }
            onChange={(e) => {
              const { value } = e.target;
              // var regex = new RegExp(/^-?\d*\.?\d*$/);

              // if (regex.test(e.target.value)) {
              //   // this.setState({ val: e.target.value });
              // } else {
              //   alert("Sorry, only numbers are allowed.");
              // }
              setQuestionElements((prev: any) => {
                const updatedElements = { ...prev };
                updatedElements[questionKey].form[
                  formKey
                ].selected.selectedValue = value;

                // Convert the value to the range slider value
                updatedElements[questionKey].form[formKey].selected.rangeValue =
                  isFinite(
                    convertToRange(
                      formatLocaleNumberToUniNumber(value, locale),
                    ),
                  )
                    ? convertToRange(
                        formatLocaleNumberToUniNumber(value, locale),
                      )
                    : 0.01;
                return updatedElements;
              });
            }}
            onBlur={() => {
              /** Validate input (especially useful if user forgot input at form above)
               * Need to be debounced as it may happen that state is not updated right away
               */
              debouncedGetNextQuestionKey(questionKey, formKey);
              debouncedCalculateForms(questionKey, formKey);
            }}
          />
          <label
            htmlFor={`${formKey}-input`}
            className="absolute bottom-1 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center text-xs text-synergy-dark-grey space-x-1 rtl:space-x-reverse"
          >
            {/* <svg
                              className="w-2.5 h-2.5 text-gray-400"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 20"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8v10a1 1 0 0 0 1 1h4v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5h4a1 1 0 0 0 1-1V8M1 10l9-9 9 9"
                              />
                            </svg> */}
            <span>
              {questionElements[questionKey].form[formKey].options.unit.value}
            </span>
          </label>
          <button
            type="button"
            id="increment-button"
            data-input-counter-increment="bedrooms-input"
            className="h-11 rounded-e-lg border border-gray-300 bg-gray-100 p-3 text-synergy-dark-grey hover:bg-synergy-light-grey focus:outline-none focus:ring-2 focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-synergy-light-blue"
            onClick={() => {
              /** Runs twice in dev - not to panic - only evokes change once in prod */
              setQuestionElements((prev: any) => {
                const updatedElements = { ...prev };
                updatedElements[questionKey].form[
                  formKey
                ].selected.selectedValue = format(
                  formatLocaleNumberToUniNumber(
                    questionElements[questionKey].form[formKey].selected
                      .selectedValue,
                    locale,
                  ) +
                    questionElements[questionKey].form[formKey].options.buttons
                      .incrementBy,
                  options,
                );

                updatedElements[questionKey].form[formKey].selected.rangeValue =
                  convertToRange(
                    formatLocaleNumberToUniNumber(
                      questionElements[questionKey].form[formKey].selected
                        .selectedValue,
                      locale,
                    ) +
                      questionElements[questionKey].form[formKey].options
                        .buttons.incrementBy,
                  );
                return updatedElements;
              });

              /** Validate input (especially useful if user forgot input at form above)
               * Need to be debounced as it may happen that state is not updated right away
               */
              debouncedGetNextQuestionKey(questionKey, formKey);
              debouncedCalculateForms(questionKey, formKey);
            }}
          >
            <Plus className="h-3 w-3" aria-hidden="true" strokeWidth={3} />
          </button>
        </div>
        {/* <div
                          className={`flex justify-end ${questionElements[questionKey].form[formKey].options.unit.spaceBetween && "gap-1"}`}
                        >
                          <span className="text-base font-semibold text-synergy-dark-grey dark:text-gray-400">
                            {
                              questionElements[questionKey].form[formKey]
                                .selected.selectedValue
                            }
                          </span>
                          <span
                            className={`text-base font-semibold text-synergy-dark-grey dark:text-gray-400 flex justify-end ${questionElements[questionKey].form[formKey].options.unit.position === "before" && "order-first"}`}
                          >
                            {
                              questionElements[questionKey].form[formKey]
                                .options.unit.value
                            }
                          </span>
                        </div> */}
        <label htmlFor="labels-range-input" className="sr-only">
          Labels range
        </label>
        <div className="relative flex h-4 items-center">
          <input
            id="labels-range-input"
            type="range"
            value={
              questionElements[questionKey].form[formKey].selected.rangeValue
            }
            min={questionElements[questionKey].form[formKey].options.range.min}
            max={questionElements[questionKey].form[formKey].options.range.max}
            step={isExponentialScale ? "any" : questionElements[questionKey].form[formKey].options.range.step}
            className="funnel-range-input h-2 w-full cursor-pointer rounded-lg"
            style={{ accentColor: "var(--synergy-light-blue, #0CC0DF)" }}
            onChange={(e) => {
              const { value } = e.target;
              setQuestionElements((prev: any) => {
                const updatedElements = { ...prev };
                const rawExponentialValue = convertToExponential(Number(value));
                const exponentialValue = isExponentialScale
                  ? snapToStep(rawExponentialValue)
                  : rawExponentialValue;
                updatedElements[questionKey].form[
                  formKey
                ].selected.selectedValue = format(exponentialValue, options);

                // Convert the snapped value back to the range slider position
                const reverseScale = convertToRange(Math.max(0.01, exponentialValue));
                updatedElements[questionKey].form[formKey].selected.rangeValue =
                  isFinite(reverseScale) ? reverseScale : 0.01;
                return updatedElements;
              });
            }}
            onMouseUp={() => {
              /** Validate input (especially useful if user forgot input at form above)
               * Need to be debounced as it may happen that state is not updated right away
               */
              debouncedGetNextQuestionKey(questionKey, formKey);
              debouncedCalculateForms(questionKey, formKey);
            }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-synergy-light-blue shadow-[0_0_0_1px_rgba(51,51,51,0.14)]"
            style={{ left: `${sliderThumbPercent}%` }}
          />
        </div>
        {Object.keys(
          questionElements[questionKey].form[formKey].options.labels,
        ).map((labelKey: any, index: any) => (
          <button
            key={labelKey}
            className={`absolute ${
              questionElements[questionKey].form[formKey].options.labels[
                labelKey
              ].align === "start"
                ? `start-${questionElements[questionKey].form[formKey].options.labels[labelKey].offsetX}`
                : `end-${questionElements[questionKey].form[formKey].options.labels[labelKey].offsetX}`
            } -translate-x-[${questionElements[questionKey].form[formKey].options.labels[labelKey].correctX}] -bottom-6 text-sm text-gray-500 dark:text-gray-400`}
            onClick={() => {
              setQuestionElements((prev: any) => {
                const updatedElements = { ...prev };
                updatedElements[questionKey].form[
                  formKey
                ].selected.selectedValue = format(
                  questionElements[questionKey].form[formKey].options.labels[
                    labelKey
                  ].value,
                  options,
                );

                // Convert the value to the range slider value
                updatedElements[questionKey].form[formKey].selected.rangeValue =
                  convertToRange(
                    Math.max(
                      0.01,
                      formatLocaleNumberToUniNumber(
                        questionElements[questionKey].form[
                          formKey
                        ].options.labels[labelKey].value.toString(),
                        locale,
                      ),
                    ),
                  );
                return updatedElements;
              });
              /** Validate input (especially useful if user forgot input at form above)
               * Need to be debounced as it may happen that state is not updated right away
               */
              debouncedGetNextQuestionKey(questionKey, formKey);
              debouncedCalculateForms(questionKey, formKey);
            }}
          >
            {
              questionElements[questionKey].form[formKey].options.labels[
                labelKey
              ].text
            }
          </button>
        ))}
        {/* <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">
                          Min ($100)
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">
                          $500
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-2/3 -translate-x-[105%] rtl:translate-x-1/2 -bottom-6">
                          $1000
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">
                          Max ($1500)
                        </span> */}
      </div>
      <p
        className={`text-sm mt-2 min-h-[1.57rem] ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
      >
        {questionElements[questionKey].form[formKey].message.text}
      </p>
    </>
  );
};

function RangeInputStyles() {
  return (
    <style>
      {`
        .funnel-range-value-input:focus,
        .funnel-range-value-input:focus-visible {
          border-color: var(--synergy-light-blue, #0CC0DF) !important;
          outline: none !important;
          box-shadow:
            0 0 0 1px var(--synergy-light-blue, #0CC0DF),
            0 0 0 4px rgba(12, 192, 223, 0.18) !important;
        }

        .funnel-range-input {
          -webkit-appearance: none;
          appearance: none;
          accent-color: var(--synergy-light-blue, #0CC0DF);
          background: transparent;
        }

        .funnel-range-input::-webkit-slider-runnable-track {
          height: 0.5rem;
          border-radius: 9999px;
          background: var(--synergy-light-grey, #EFEFEF);
        }

        .funnel-range-input::-webkit-slider-thumb {
          -webkit-appearance: none !important;
          appearance: none !important;
          width: 1rem;
          height: 1rem;
          margin-top: -0.25rem;
          border: 0 !important;
          border-radius: 9999px;
          background: transparent !important;
          box-shadow: none !important;
        }

        .funnel-range-input:focus-visible {
          outline: none;
        }

        .funnel-range-input:focus-visible::-webkit-slider-thumb {
          box-shadow: none !important;
        }

        .funnel-range-input::-moz-range-track {
          height: 0.5rem;
          border-radius: 9999px;
          background: var(--synergy-light-grey, #EFEFEF);
        }

        .funnel-range-input::-moz-range-progress {
          height: 0.5rem;
          border-radius: 9999px;
          background: var(--synergy-light-blue, #0CC0DF);
        }

        .funnel-range-input::-moz-range-thumb {
          width: 1rem;
          height: 1rem;
          border: 0 !important;
          border-radius: 9999px;
          background: transparent !important;
          box-shadow: none !important;
        }

        .funnel-range-input:focus-visible::-moz-range-thumb {
          box-shadow: none !important;
        }

        @media (prefers-color-scheme: dark) {
          .funnel-range-input::-webkit-slider-runnable-track,
          .funnel-range-input::-moz-range-track {
            background: var(--synergy-dark-grey, #333333);
          }
        }
      `}
    </style>
  );
}

export default Range;
