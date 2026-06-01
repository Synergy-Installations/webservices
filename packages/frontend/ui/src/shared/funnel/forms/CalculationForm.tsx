"use client";

type CalculationFormProps = {
  questionElements: Record<string, any>;
  questionKey: string;
  formKey: string;
};

export function CalculationForm({
  questionElements,
  questionKey,
  formKey,
}: CalculationFormProps) {
  const form = questionElements[questionKey].form[formKey];

  /** Render the linked input form's value (resolved by uid) next to the result */
  const renderAfterMathsCalculation = (
    questionUid: string,
    formUid: string,
  ): JSX.Element => {
    const question = Object.values(questionElements).find(
      ({ uid }: any) => questionUid === uid,
    );
    const inputForm: any = Object.values((question as any).form).find(
      (entry: any) => entry.uid === formUid,
    );

    return (
      <div
        className={`flex justify-end ${inputForm.options.unit.spaceBetween && "gap-1"}`}
      >
        <span className="text-synergy-dark-grey dark:text-gray-400">
          {inputForm.selected.selectedValue}
        </span>
        <span
          className={`text-synergy-dark-grey dark:text-gray-400 flex justify-end ${inputForm.options.unit.position === "before" && "order-first"}`}
        >
          {inputForm.options.unit.value}
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-center items-center gap-1 text-lg">
        <div
          className={`flex font-semibold justify-center ${form.options.maths.spaceBetween && "gap-1"}`}
        >
          <span className="text-synergy-dark-grey dark:text-gray-400">
            {Number(form.selected.inputValue).toLocaleString()}
          </span>
          <span
            className={`text-synergy-dark-grey dark:text-gray-400 flex justify-end ${form.options.maths.position === "before" && "order-first"}`}
          >
            {form.options.maths.unit}
          </span>
        </div>
        <div className="flex gap-1 items-center">
          <span className="">{form.options.afterMaths.before}</span>
          <div className="font-semibold">
            {renderAfterMathsCalculation(
              form.options.inputForm.questionKey,
              form.options.inputForm.formKey,
            )}
          </div>
          <span className="">{form.options.afterMaths.after}</span>
        </div>
      </div>
      <div className="flex justify-between">
        <p
          className={`text-sm mt-2 min-h-[1.57rem] ${form.message.type === "error" ? "text-red-600 dark:text-red-500" : form.message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
        >
          {form.message.text}
        </p>
      </div>
    </>
  );
}
