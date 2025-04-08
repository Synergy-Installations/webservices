import { useNumberFormat, format } from "@react-input/number-format";
import { form } from "framer-motion/client";
import { formatLocaleNumberToUniNumber } from "@com.synergy/frontend-ui/LocaleNumber";

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
    questionElements[questionKey].form[formKey].options.range.min
  );
  const max = questionElements[questionKey].form[formKey].options.range.max;

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
      <div className="relative mb-6">
        <div className="relative flex items-center mx-auto max-w-[11rem]">
          <button
            type="button"
            id="decrement-button"
            data-input-counter-decrement="bedrooms-input"
            className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
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
                      locale
                    ) -
                      questionElements[questionKey].form[formKey].options
                        .buttons.decrementBy
                  ),
                  options
                );
                updatedElements[questionKey].form[formKey].selected.rangeValue =
                  convertToRange(
                    Math.max(
                      // Min input is 0.01 or we get infinity in exponential scale
                      Math.max(
                        0.01,
                        questionElements[questionKey].form[formKey].options
                          .range.min
                      ),
                      formatLocaleNumberToUniNumber(
                        questionElements[questionKey].form[formKey].selected
                          .selectedValue,
                        locale
                      ) -
                        questionElements[questionKey].form[formKey].options
                          .buttons.decrementBy
                    )
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
            <svg
              className="w-3 h-3 text-gray-900 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 2"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h16"
              />
            </svg>
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
            className="bg-gray-50 border-x-0 border-y !border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full pb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                    convertToRange(formatLocaleNumberToUniNumber(value, locale))
                  )
                    ? convertToRange(
                        formatLocaleNumberToUniNumber(value, locale)
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
            className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
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
                    locale
                  ) +
                    questionElements[questionKey].form[formKey].options.buttons
                      .incrementBy,
                  options
                );

                updatedElements[questionKey].form[formKey].selected.rangeValue =
                  convertToRange(
                    formatLocaleNumberToUniNumber(
                      questionElements[questionKey].form[formKey].selected
                        .selectedValue,
                      locale
                    ) +
                      questionElements[questionKey].form[formKey].options
                        .buttons.incrementBy
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
            <svg
              className="w-3 h-3 text-gray-900 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 1v16M1 9h16"
              />
            </svg>
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
        <input
          id="labels-range-input"
          type="range"
          value={
            questionElements[questionKey].form[formKey].selected.rangeValue
          }
          min={questionElements[questionKey].form[formKey].options.range.min}
          max={questionElements[questionKey].form[formKey].options.range.max}
          step={questionElements[questionKey].form[formKey].options.range.step}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          onChange={(e) => {
            const { value } = e.target;
            setQuestionElements((prev: any) => {
              const updatedElements = { ...prev };
              const exponentialValue = convertToExponential(Number(value));
              updatedElements[questionKey].form[
                formKey
              ].selected.selectedValue = format(exponentialValue, options);

              // Convert the exponentialValue back to the range slider value
              const reverseScale = convertToRange(exponentialValue);
              updatedElements[questionKey].form[formKey].selected.rangeValue =
                reverseScale;
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
        {Object.keys(
          questionElements[questionKey].form[formKey].options.labels
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
                  options
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
                        locale
                      )
                    )
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

export default Range;
