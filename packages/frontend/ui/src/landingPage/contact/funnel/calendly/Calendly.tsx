import { useCalendlyEventListener, InlineWidget } from "react-calendly";

/* eslint-disable-next-line */
export interface CalendlyProps {
  questionKey: string;
  formKey: string;
  questionElements: any;
  setQuestionElements: any;
  debouncedCountFormsAndSet: any;
}

export const Calendly = (props: CalendlyProps) => {
  const {
    questionKey,
    formKey,
    questionElements,
    setQuestionElements,
    debouncedCountFormsAndSet,
  } = props;

  useCalendlyEventListener({
    onProfilePageViewed: () => console.log("onProfilePageViewed"),
    onDateAndTimeSelected: () => console.log("onDateAndTimeSelected"),
    onEventTypeViewed: () => console.log("onEventTypeViewed"),
    onEventScheduled: (e) => {
      console.log(e.data.payload, e.data.event);
      setQuestionElements((prev: any) => {
        /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
        const updatedElements = { ...prev };
        const form = updatedElements[questionKey].form[formKey];

        form.selected.scheduledEvent = e.data.payload;

        form.message.text =
          questionElements[questionKey].form[formKey].message.successMessage;
        form.message.type = "success";
        return updatedElements;
      });

      debouncedCountFormsAndSet();
    },
    onPageHeightResize: (e) => console.log(e.data.payload.height),
  });

  return (
    <>
      <InlineWidget
        url={questionElements[questionKey].form[formKey].options.embed.url}
        prefill={
          Object.values(questionElements)
            .flatMap((question: any) => Object.values(question.form))
            .find(
              (
                form: any
              ): form is {
                uid: string;
                selected: { inputValue: string };
                message: { type: string };
              } =>
                form.uid ===
                  questionElements[questionKey].form[formKey].options.prefill
                    .email.formKey ||
                form.uid ===
                  questionElements[questionKey].form[formKey].options.prefill
                    .name.formKey ||
                form.uid ===
                  questionElements[questionKey].form[formKey].options.prefill
                    .phone.formKey
            )?.message.type === "success"
            ? {
                email:
                  Object.values(questionElements)
                    .flatMap((question: any) => Object.values(question.form))
                    .find(
                      (
                        form: any
                      ): form is {
                        uid: string;
                        selected: { inputValue: string };
                      } =>
                        form.uid ===
                        questionElements[questionKey].form[formKey].options
                          .prefill.email.formKey
                    )?.selected.inputValue || "",
                name:
                  Object.values(questionElements)
                    .flatMap((question: any) => Object.values(question.form))
                    .find(
                      (
                        form: any
                      ): form is {
                        uid: string;
                        selected: { inputValue: string };
                      } =>
                        form.uid ===
                        questionElements[questionKey].form[formKey].options
                          .prefill.name.formKey
                    )?.selected.inputValue || "",
                smsReminderNumber:
                  Object.values(questionElements)
                    .flatMap((question: any) => Object.values(question.form))
                    .find(
                      (
                        form: any
                      ): form is {
                        uid: string;
                        selected: { inputValue: string };
                      } =>
                        form.uid ===
                        questionElements[questionKey].form[formKey].options
                          .prefill.phone.formKey
                    )?.selected.inputValue || "",
              }
            : undefined
        }
      />
      <p
        className={`text-sm mt-2 min-h-[1.57rem] ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
      >
        {questionElements[questionKey].form[formKey].message.text}
      </p>
    </>
  );
};

export default Calendly;
