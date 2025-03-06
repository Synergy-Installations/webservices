"use client";
import { useMessages, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import Link from "next/link";
import { label, p } from "framer-motion/client";
import { useRouter } from "next/navigation";

/* eslint-disable-next-line */
export interface FunnelProps {}

export const Funnel = (props: FunnelProps) => {
  const t = useTranslations("LandingPage.ContactUs.Funnel");

  const router = useRouter();

  const [buttonStatusText, setButtonStatusText] = useState<{
    fatal: boolean;
    disabled: boolean;
    text: string;
  }>({
    fatal: false,
    disabled: false,
    text: "",
  });

  const messages: any = useMessages();

  const createOptions = (element: any) => {
    return Object.keys(element).reduce((optionsAcc: any, optionKey: string) => {
      optionsAcc[optionKey] = {
        text: element.options[optionKey].title,
      };
      return optionsAcc;
    }, {});
  };

  const createQuestionElement = (
    questionKey: string,
    from?: Array<string> | null
  ) => {
    const element =
      messages.LandingPage.ContactUs.Funnel.questions[questionKey];
    return {
      title: element.title,
      description: element.description,
      from: from || [],
      uid: questionKey,
      form: Object.keys(element.form).reduce(
        (formAcc: any, formKey: string) => {
          if (element.form[formKey].defaultVisible === "true") {
            if (
              element.form[formKey].type === "checkbox" ||
              element.form[formKey].type === "radio"
            ) {
              formAcc[
                `${formKey}-${Math.random().toString(36).substring(2, 7)}`
              ] = {
                order: Number(element.form[formKey].order),
                uid: formKey,
                type: element.form[formKey].type,
                multiple: element.form[formKey].multiple,
                required: element.form[formKey].required === "true",
                defaultVisible: element.form[formKey].defaultVisible === "true",
                title: element.form[formKey].title,
                description: element.form[formKey].description,
                from: from || [],
                message: {
                  text: element.form[formKey].message.text,
                  type: element.form[formKey].message.type,
                  requiredMessage:
                    element.form[formKey].message.requiredMessage,
                  successMessage: element.form[formKey].message.successMessage,
                  checkPreviousFormsMessage:
                    element.form[formKey].message.checkPreviousFormsMessage,
                },
                options: Object.keys(element.form[formKey].options).reduce(
                  (optionsAcc: any, optionKey: string) => {
                    optionsAcc[
                      `${optionKey}-${Math.random().toString(36).substring(2, 7)}`
                    ] = {
                      text: element.form[formKey].options[optionKey].title,
                      type: element.form[formKey].options[optionKey].type,
                      uid: optionKey,
                      title: element.form[formKey].options[optionKey].title,
                      description:
                        element.form[formKey].options[optionKey].description,
                      addQuestion:
                        element.form[formKey].options[optionKey].addQuestion,
                      addForm: element.form[formKey].options[optionKey].addForm,
                      icon: {
                        src: element.form[formKey].options[optionKey].icon.src,
                        alt: element.form[formKey].options[optionKey].icon.alt,
                      },
                    };
                    return optionsAcc;
                  },
                  {}
                ),
                selected: {
                  questionTitle: element.form[formKey].title,
                  selectedOptions: [],
                  selectedOptionsUid: [],
                },
              };
            } else if (element.form[formKey].type === "range") {
              formAcc[
                `${formKey}-${Math.random().toString(36).substring(2, 7)}`
              ] = {
                order: Number(element.form[formKey].order),
                uid: formKey,
                type: element.form[formKey].type,
                required: element.form[formKey].required === "true",
                defaultVisible: element.form[formKey].defaultVisible === "true",
                title: element.form[formKey].title,
                description: element.form[formKey].description,
                from: from || [],
                message: {
                  text: element.form[formKey].message.text,
                  type: element.form[formKey].message.type,
                  requiredMessage:
                    element.form[formKey].message.requiredMessage,
                  successMessage: element.form[formKey].message.successMessage,
                  checkPreviousFormsMessage:
                    element.form[formKey].message.checkPreviousFormsMessage,
                },
                options: {
                  range: {
                    defaultValue: Number(
                      element.form[formKey].options.range.defaultValue
                    ),
                    min: Number(element.form[formKey].options.range.min),
                    max: Number(element.form[formKey].options.range.max),
                    step: Number(element.form[formKey].options.range.step),
                  },
                  unit: {
                    value: element.form[formKey].options.unit.value,
                    spaceBetween:
                      element.form[formKey].options.unit.spaceBetween ===
                      "true",
                    position: element.form[formKey].options.unit.position,
                  },
                  labels: Object.keys(
                    element.form[formKey].options.labels
                  ).reduce((lablesAcc: any, labelKey: string) => {
                    lablesAcc[
                      `${labelKey}-${Math.random().toString(36).substring(2, 7)}`
                    ] = {
                      text: element.form[formKey].options.labels[labelKey].text,
                      value: Number(
                        element.form[formKey].options.labels[labelKey].value
                      ),
                      align:
                        element.form[formKey].options.labels[labelKey].align,
                      offsetX:
                        element.form[formKey].options.labels[labelKey].offsetX,
                      correctX:
                        element.form[formKey].options.labels[labelKey].correctX,
                    };
                    return lablesAcc;
                  }, {}),
                },
                selected: {
                  questionTitle: element.form[formKey].title,
                  selectedValue: Number(
                    element.form[formKey].options.range.defaultValue
                  ),
                },
              };
            } else if (element.form[formKey].type === "text") {
              formAcc[
                `${formKey}-${Math.random().toString(36).substring(2, 7)}`
              ] = {
                order: Number(element.form[formKey].order),
                uid: formKey,
                type: element.form[formKey].type,
                required: element.form[formKey].required === "true",
                defaultVisible: element.form[formKey].defaultVisible === "true",
                title: element.form[formKey].title,
                description: element.form[formKey].description,
                from: from || [],
                message: {
                  text: element.form[formKey].message.text,
                  type: element.form[formKey].message.type,
                  requiredMessage:
                    element.form[formKey].message.requiredMessage,
                  successMessage: element.form[formKey].message.successMessage,
                  checkPreviousFormsMessage:
                    element.form[formKey].message.checkPreviousFormsMessage,
                },
                options: {
                  label: element.form[formKey].options.label,
                  placeholder: element.form[formKey].options.placeholder,
                },
                selected: {
                  questionTitle: element.form[formKey].title,
                  inputValue: "",
                },
              };
            }
          }
          return formAcc;
        },
        {}
      ),
    };
  };

  const createFormElement = (
    questionKey: string,
    formKey: string,
    from?: Array<string> | null
  ) => {
    // console.log(
    //   "createFormElement",
    //   questionKey,
    //   formKey,
    //   from,
    //   messages.LandingPage.ContactUs.Funnel.questions[questionKey].form
    // );
    const element =
      messages.LandingPage.ContactUs.Funnel.questions[questionKey].form[
        formKey
      ];

    if (element.type === "checkbox" || element.type === "radio") {
      return {
        order: Number(element.order),
        uid: formKey,
        type: element.type,
        multiple: element.multiple,
        required: element.required === "true",
        defaultVisible: element.defaultVisible === "true",
        title: element.title,
        description: element.description,
        from: from || [],
        message: {
          text: element.message.text,
          type: element.message.type,
          requiredMessage: element.message.requiredMessage,
          successMessage: element.message.successMessage,
          checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
        },
        options: Object.keys(element.options).reduce(
          (optionsAcc: any, optionKey: string) => {
            optionsAcc[
              `${optionKey}-${Math.random().toString(36).substring(2, 7)}`
            ] = {
              text: element.options[optionKey].title,
              type: element.options[optionKey].type,
              uid: optionKey,
              title: element.options[optionKey].title,
              description: element.options[optionKey].description,
              addQuestion: element.options[optionKey].addQuestion,
              addForm: element.options[optionKey].addForm,
              icon: {
                src: element.options[optionKey].icon.src,
                alt: element.options[optionKey].icon.alt,
              },
            };
            return optionsAcc;
          },
          {}
        ),
        selected: {
          questionTitle: element.title,
          selectedOptions: [],
          selectedOptionsUid: [],
        },
      };
    } else if (element.type === "range") {
      return {
        order: Number(element.order),
        uid: formKey,
        type: element.type,
        required: element.required === "true",
        defaultVisible: element.defaultVisible === "true",
        title: element.title,
        description: element.description,
        from: from || [],
        message: {
          text: element.message.text,
          type: element.message.type,
          requiredMessage: element.message.requiredMessage,
          successMessage: element.message.successMessage,
          checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
        },
        options: {
          range: {
            defaultValue: Number(element.options.range.defaultValue),
            min: Number(element.options.range.min),
            max: Number(element.options.range.max),
            step: Number(element.options.range.step),
          },
          unit: {
            value: element.options.unit.value,
            spaceBetween: element.options.unit.spaceBetween === "true",
            position: element.options.unit.position,
          },
          labels: Object.keys(element.options.labels).reduce(
            (lablesAcc: any, labelKey: string) => {
              lablesAcc[
                `${labelKey}-${Math.random().toString(36).substring(2, 7)}`
              ] = {
                text: element.options.labels[labelKey].text,
                value: Number(element.options.labels[labelKey].value),
                align: element.options.labels[labelKey].align,
                offsetX: element.options.labels[labelKey].offsetX,
                correctX: element.options.labels[labelKey].correctX,
              };
              return lablesAcc;
            },
            {}
          ),
        },
        selected: {
          questionTitle: element.title,
          selectedValue: Number(element.options.range.defaultValue),
        },
      };
    } else if (element.form[formKey].type === "text") {
      return {
        order: Number(element.order),
        uid: formKey,
        type: element.type,
        required: element.required === "true",
        defaultVisible: element.defaultVisible === "true",
        title: element.title,
        description: element.description,
        from: from || [],
        message: {
          text: element.message.text,
          type: element.message.type,
          requiredMessage: element.message.requiredMessage,
          successMessage: element.message.successMessage,
          checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
        },
        options: {
          label: element.options.label,
          placeholder: element.options.placeholder,
        },
        selected: {
          questionTitle: element.title,
          inputValue: "",
        },
      };
    }
  };

  const [questionElements, setQuestionElements] = useState<Record<string, any>>(
    () => {
      /** "Hardcode" interested-products as this will be the first question */
      const firstQuestionKey = "interested-products";

      return {
        [`interested-products-${Math.random().toString(36).substring(2, 7)}`]:
          createQuestionElement(firstQuestionKey, ["initialLoad"]),
      };
    }
  );

  const getNextQuestionKey = (
    currentQuestionKey: string,
    formKey: string
  ): void => {
    const questionKeys = Object.keys(questionElements);
    const currentQuestion = questionElements[currentQuestionKey];
    const currentQuestionIndex = questionKeys.indexOf(currentQuestionKey);
    const formKeys = Object.keys(currentQuestion.form);
    const currentFormIndex = formKeys.indexOf(formKey);

    let error = false;
    questionKeys.forEach((questionKey: string, questionIndex: number) => {
      formKeys.forEach((formKey: string, formIndex: number) => {
        console.log(questionKey, formKey);
        if (
          /** Continue if the current question and form index is less or equal than the question
           * and form index that the button got pressed on or the form was got a success message
           */
          questionIndex < currentQuestionIndex ||
          (questionIndex == currentQuestionIndex &&
            formIndex <= currentFormIndex) ||
          questionElements[questionKey].form[formKey].message.type ===
            "success" ||
          questionElements[questionKey].form[formKey].message.type ===
            "error" ||
          questionElements[questionKey].form[formKey].message.type === "warning"
        ) {
          if (
            /** Test the form for incorrect input */
            ((questionElements[questionKey].form[formKey].type === "checkbox" ||
              questionElements[questionKey].form[formKey].type === "radio") &&
              questionElements[questionKey].form[formKey].selected
                .selectedOptions.length == 0) ||
            (questionElements[questionKey].form[formKey].type === "range" &&
              questionElements[questionKey].form[formKey].selected
                .selectedValue == 0) ||
            (questionElements[questionKey].form[formKey].type === "text" &&
              questionElements[questionKey].form[formKey].selected.inputValue ==
                "")
          ) {
            /** Wrong input
             * We do not care about incorrect inputs on previous forms as long as the current form shows errors
             */
            console.log("user want to continue with incorrect input");
            setQuestionElements((prev) => {
              const updatedElements = { ...prev };
              updatedElements[questionKey].form[formKey].message.text =
                questionElements[questionKey].form[
                  formKey
                ].message.requiredMessage;
              updatedElements[questionKey].form[formKey].message.type = "error";
              return updatedElements;
            });
            /** Continue with form even though the subsequent forms may be invalid, we only want the user
             * to correct the current form or any before it but not after it.
             */
            if (
              questionIndex < currentQuestionIndex ||
              (questionIndex == currentQuestionIndex &&
                formIndex <= currentFormIndex)
            )
              error = true;

            console.log("Do we errror?", error);
          } else if (
            /** Success for form that the button got pressed on */
            error == true &&
            questionIndex == currentQuestionIndex &&
            formIndex == currentFormIndex
          ) {
            /** Correct input at current form, however, previous forms are not correct */
            console.log(
              "correct input at form button got pressed, however, previous forms are not correct"
            );
            setQuestionElements((prev) => {
              const updatedElements = { ...prev };
              updatedElements[questionKey].form[formKey].message.text =
                questionElements[questionKey].form[
                  formKey
                ].message.checkPreviousFormsMessage;
              updatedElements[questionKey].form[formKey].message.type =
                "warning";
              return updatedElements;
            });
          } else {
            /** Continue with checking that elements that had previously shown an
             * error and not clicked button to continue but rather on a different form
             */
            setQuestionElements((prev) => {
              const updatedElements = { ...prev };
              updatedElements[currentQuestionKey].form[formKey].message.text =
                questionElements[currentQuestionKey].form[
                  formKey
                ].message.successMessage;
              updatedElements[currentQuestionKey].form[formKey].message.type =
                "success";
              return updatedElements;
            });
          }
        }
      });
    });
    if (error) return;

    // if (
    //   ((questionElements[currentQuestionKey].form[formKey].type ===
    //     "checkbox" ||
    //     questionElements[currentQuestionKey].form[formKey].type === "radio") &&
    //     questionElements[currentQuestionKey].form[formKey].selected
    //       .selectedOptions.length == 0) ||
    //   (questionElements[currentQuestionKey].form[formKey].type === "range" &&
    //     questionElements[currentQuestionKey].form[formKey].selected
    //       .selectedValue == 0) ||
    //   (questionElements[currentQuestionKey].form[formKey].type === "text" &&
    //     questionElements[currentQuestionKey].form[formKey].selected
    //       .inputValue == "")
    // ) {
    //   console.log("user want to continue with incorrect input");
    // }
    // console.log(
    //   "correct input",
    //   currentQuestion,
    //   formKey,
    //   currentFormIndex,
    //   formKeys.length - 1,
    //   questionKeys,
    //   questionKeys[currentFormIndex + 1]
    // );

    /** Route to next form in question */
    if (currentFormIndex !== -1 && currentFormIndex < formKeys.length - 1) {
      setQuestionElements((prev) => {
        const updatedElements = { ...prev };
        updatedElements[currentQuestionKey].form[formKey].message.text =
          questionElements[currentQuestionKey].form[
            formKey
          ].message.successMessage;
        updatedElements[currentQuestionKey].form[formKey].message.type =
          "success";
        return updatedElements;
      });

      router.push(`#${formKeys[currentFormIndex + 1]}`);
      return;
    }

    /** Route to same form as a "coping" mechanism to focus on the last form, implementation
     * to send form is missing and this needs to be rewritten when done.
     */
    const currentIndex = questionKeys.indexOf(currentQuestionKey);
    if (currentIndex === -1 || currentIndex === questionKeys.length - 1) {
      setQuestionElements((prev) => {
        const updatedElements = { ...prev };
        updatedElements[currentQuestionKey].form[formKey].message.text =
          questionElements[currentQuestionKey].form[
            formKey
          ].message.successMessage;
        updatedElements[currentQuestionKey].form[formKey].message.type =
          "success";
        return updatedElements;
      });

      router.push(`#${formKey}`);
      return;
    }

    /** Route to the next question in line */
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      updatedElements[currentQuestionKey].form[formKey].message.text =
        questionElements[currentQuestionKey].form[
          formKey
        ].message.successMessage;
      updatedElements[currentQuestionKey].form[formKey].message.type =
        "success";
      return updatedElements;
    });
    router.push(`#${questionKeys[currentIndex + 1]}`);
    return;
  };

  const addQuestionElement = (
    from: {
      fromQuestionKey: string;
      fromFormKey: string;
      fromOptionKey: string;
    },
    questionKey: string
  ) => {
    /** Get the old "from" sources to aid deletion in case of reselection */
    const fromArray = [
      ...(questionElements[from.fromQuestionKey].form[from.fromFormKey].from ||
        []),
    ];
    fromArray.push(from.fromOptionKey);
    const questionKeyUid = `${questionKey}-${Math.random().toString(36).substring(2, 7)}`;
    console.log(
      "addQuestionElement",
      fromArray,
      createQuestionElement(questionKey, fromArray),
      questionKeyUid
    );
    setQuestionElements((prev) => ({
      ...prev,
      [questionKeyUid]: createQuestionElement(questionKey, fromArray),
    }));
  };

  const addFormElement = (
    from: {
      fromQuestionKey: string;
      fromFormKey: string;
      fromOptionKey: string;
    },
    formKey: string
  ) => {
    console.log("addFormElement", from, formKey);
    /** Get the old "from" sources to aid deletion in case of reselection */
    const fromArray = [
      ...(questionElements[from.fromQuestionKey].form[from.fromFormKey].from ||
        []),
    ];
    fromArray.push(from.fromOptionKey);
    const formKeyUid = `${formKey}-${Math.random().toString(36).substring(2, 7)}`;
    console.log(
      "addFormElement",
      fromArray,
      createFormElement(
        questionElements[from.fromQuestionKey].uid,
        formKey,
        fromArray
      ),
      formKeyUid
    );
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      updatedElements[from.fromQuestionKey].form[formKeyUid] =
        createFormElement(
          questionElements[from.fromQuestionKey].uid,
          formKey,
          fromArray
        );
      return updatedElements;
    });
  };

  const removeQuestionElement = (fromOptionKey: string) => {
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      Object.keys(updatedElements).forEach((key) => {
        if (updatedElements[key].from.includes(fromOptionKey)) {
          delete updatedElements[key];
        }
      });
      return updatedElements;
    });
  };

  const removeFormElement = (
    fromQuestionKey: string,
    fromOptionKey: string
  ) => {
    console.log("initiate removeFormElement", fromQuestionKey, fromOptionKey);
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      Object.keys(updatedElements[fromQuestionKey].form).forEach((key) => {
        if (
          updatedElements[fromQuestionKey].form[key].from.includes(
            fromOptionKey
          )
        ) {
          delete updatedElements[fromQuestionKey].form[key];
        }
      });
      return updatedElements;
    });
  };

  console.log(
    "questionElements",
    questionElements,
    Object.keys(questionElements)
  );

  const funnelElementKeys = (element: string) =>
    Object.keys(messages.LandingPage.ContactUs.Funnel[element]);

  /** Flush server state - This is dirty and should be handled better
   * Rerender the component to use the client's section ids for continue button
   * This is due to the server rendering the compontent using the useState and then the client
   * recreates the state using different keys as they are created on initializing the state.
   */
  useEffect(() => {
    setQuestionElements((prev) => ({}));
    setQuestionElements(() => {
      const firstQuestionKey = "interested-products";

      return {
        [`interested-products-${Math.random().toString(36).substring(2, 7)}`]:
          createQuestionElement(firstQuestionKey, ["initialLoad"]),
      };
    });
  }, []);

  return (
    <div className="flex flex-col justify-center max-w-3xl mx-auto">
      {Object.keys(questionElements).map((questionKey: any, index: any) => (
        <section id={questionKey} key={index} className="mt-10 scroll-mt-20">
          {/** Title and description of question */}
          <div className="text-center">
            <div className="text-2xl font-bold">
              {questionElements[questionKey].title}
            </div>
            <div className="">{questionElements[questionKey].description}</div>
          </div>
          {/** Form */}
          <div className="">
            {Object.keys(questionElements[questionKey].form).map(
              (formKey: any, index: any) => (
                <section
                  key={formKey}
                  id={formKey}
                  className="w-full scroll-mt-20"
                >
                  {/** Title and description of form */}
                  <div className="text-center mt-5 mb-5">
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {questionElements[questionKey].form[formKey].title}
                    </div>
                    <div className="">
                      {questionElements[questionKey].form[formKey].description}
                    </div>
                  </div>
                  {questionElements[questionKey].form[formKey].type ===
                    "checkbox" ||
                  questionElements[questionKey].form[formKey].type ===
                    "radio" ? (
                    <ul className="grid w-full gap-6 md:grid-cols-3">
                      {Object.keys(
                        questionElements[questionKey].form[formKey].options
                      ).map((optionKey: any, index: any) => (
                        <>
                          <li key={optionKey}>
                            <input
                              type={
                                questionElements[questionKey].form[formKey]
                                  .type === "checkbox"
                                  ? "checkbox"
                                  : "radio"
                              }
                              name={formKey}
                              id={optionKey}
                              value=""
                              onChange={(e) => {
                                const { checked, id } = e.target;
                                console.log("onchange", checked, id);
                                if (checked) {
                                  /** Clean deselection for radio */
                                  if (
                                    questionElements[questionKey].form[formKey]
                                      .selected.selectedOptionsUid.length > 0 &&
                                    questionElements[questionKey].form[formKey]
                                      .type === "radio"
                                  ) {
                                    questionElements[questionKey].form[
                                      formKey
                                    ].selected.selectedOptionsUid.map(
                                      (optionUid: string) => {
                                        removeFormElement(
                                          questionKey,
                                          optionUid
                                        );
                                        removeQuestionElement(optionUid);
                                      }
                                    );
                                  }

                                  if (
                                    questionElements[questionKey].form[formKey]
                                      .options[optionKey].addForm !== ""
                                  ) {
                                    addFormElement(
                                      {
                                        fromQuestionKey: questionKey,
                                        fromFormKey: formKey,
                                        fromOptionKey: optionKey,
                                      },
                                      questionElements[questionKey].form[
                                        formKey
                                      ].options[optionKey].addForm
                                    );
                                  }
                                  if (
                                    questionElements[questionKey].form[formKey]
                                      .options[optionKey].addQuestion !== ""
                                  ) {
                                    console.log("request add Question");
                                    addQuestionElement(
                                      {
                                        fromQuestionKey: questionKey,
                                        fromFormKey: formKey,
                                        fromOptionKey: optionKey,
                                      },
                                      questionElements[questionKey].form[
                                        formKey
                                      ].options[optionKey].addQuestion
                                    );
                                  }
                                } else {
                                  /** Gets used for checkbox only, use "Clean deselection for radio above for radio type" */
                                  removeFormElement(questionKey, optionKey);
                                  removeQuestionElement(optionKey);
                                }

                                setQuestionElements((prev) => {
                                  /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
                                  const updatedElements = { ...prev };
                                  const form =
                                    updatedElements[questionKey].form[formKey];
                                  if (checked) {
                                    if (
                                      questionElements[questionKey].form[
                                        formKey
                                      ].type === "checkbox"
                                    ) {
                                      form.selected.selectedOptions.push(
                                        questionElements[questionKey].form[
                                          formKey
                                        ].options[optionKey].title
                                      );
                                      form.selected.selectedOptionsUid.push(
                                        optionKey
                                      );
                                    } else if (
                                      questionElements[questionKey].form[
                                        formKey
                                      ].type === "radio"
                                    ) {
                                      /** Radio - only one option can be selected */
                                      form.selected.selectedOptions = [
                                        questionElements[questionKey].form[
                                          formKey
                                        ].options[optionKey].title,
                                      ];
                                      form.selected.selectedOptionsUid = [
                                        optionKey,
                                      ];
                                    }
                                  } else {
                                    /** Remove selectedOptions which only works for checkbox (radio cannot detect deselection) */
                                    form.selected.selectedOptions =
                                      form.selected.selectedOptions.filter(
                                        (option: string) =>
                                          option !==
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options[optionKey].title
                                      );
                                    form.selected.selectedOptionsUid =
                                      form.selected.selectedOptionsUid.filter(
                                        (option: string) => option !== optionKey
                                      );
                                    // if (
                                    //   form.selected[selectedOptionIndex]
                                    //     .selectedOptions.length === 0
                                    // ) {
                                    //   form.selected.splice(
                                    //     selectedOptionIndex,
                                    //     1
                                    //   );
                                    // }
                                  }
                                  return updatedElements;
                                });
                              }}
                              className="hidden peer"
                              required={true}
                            />
                            <label
                              htmlFor={optionKey}
                              className="inline-flex items-center justify-between w-full p-5 text-synergy-dark-grey bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 dark:peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                            >
                              <div className="block">
                                <svg
                                  className="mb-2 w-7 h-7 text-sky-500"
                                  fill="currentColor"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 512 512"
                                >
                                  <path d="M418.2 177.2c-5.4-1.8-10.8-3.5-16.2-5.1.9-3.7 1.7-7.4 2.5-11.1 12.3-59.6 4.2-107.5-23.1-123.3-26.3-15.1-69.2.6-112.6 38.4-4.3 3.7-8.5 7.6-12.5 11.5-2.7-2.6-5.5-5.2-8.3-7.7-45.5-40.4-91.1-57.4-118.4-41.5-26.2 15.2-34 60.3-23 116.7 1.1 5.6 2.3 11.1 3.7 16.7-6.4 1.8-12.7 3.8-18.6 5.9C38.3 196.2 0 225.4 0 255.6c0 31.2 40.8 62.5 96.3 81.5 4.5 1.5 9 3 13.6 4.3-1.5 6-2.8 11.9-4 18-10.5 55.5-2.3 99.5 23.9 114.6 27 15.6 72.4-.4 116.6-39.1 3.5-3.1 7-6.3 10.5-9.7 4.4 4.3 9 8.4 13.6 12.4 42.8 36.8 85.1 51.7 111.2 36.6 27-15.6 35.8-62.9 24.4-120.5-.9-4.4-1.9-8.9-3-13.5 3.2-.9 6.3-1.9 9.4-2.9 57.7-19.1 99.5-50 99.5-81.7 0-30.3-39.4-59.7-93.8-78.4zM282.9 92.3c37.2-32.4 71.9-45.1 87.7-36 16.9 9.7 23.4 48.9 12.8 100.4-.7 3.4-1.4 6.7-2.3 10-22.2-5-44.7-8.6-67.3-10.6-13-18.6-27.2-36.4-42.6-53.1 3.9-3.7 7.7-7.2 11.7-10.7zM167.2 307.5c5.1 8.7 10.3 17.4 15.8 25.9-15.6-1.7-31.1-4.2-46.4-7.5 4.4-14.4 9.9-29.3 16.3-44.5 4.6 8.8 9.3 17.5 14.3 26.1zm-30.3-120.3c14.4-3.2 29.7-5.8 45.6-7.8-5.3 8.3-10.5 16.8-15.4 25.4-4.9 8.5-9.7 17.2-14.2 26-6.3-14.9-11.6-29.5-16-43.6zm27.4 68.9c6.6-13.8 13.8-27.3 21.4-40.6s15.8-26.2 24.4-38.9c15-1.1 30.3-1.7 45.9-1.7s31 .6 45.9 1.7c8.5 12.6 16.6 25.5 24.3 38.7s14.9 26.7 21.7 40.4c-6.7 13.8-13.9 27.4-21.6 40.8-7.6 13.3-15.7 26.2-24.2 39-14.9 1.1-30.4 1.6-46.1 1.6s-30.9-.5-45.6-1.4c-8.7-12.7-16.9-25.7-24.6-39s-14.8-26.8-21.5-40.6zm180.6 51.2c5.1-8.8 9.9-17.7 14.6-26.7 6.4 14.5 12 29.2 16.9 44.3-15.5 3.5-31.2 6.2-47 8 5.4-8.4 10.5-17 15.5-25.6zm14.4-76.5c-4.7-8.8-9.5-17.6-14.5-26.2-4.9-8.5-10-16.9-15.3-25.2 16.1 2 31.5 4.7 45.9 8-4.6 14.8-10 29.2-16.1 43.4zM256.2 118.3c10.5 11.4 20.4 23.4 29.6 35.8-19.8-.9-39.7-.9-59.5 0 9.8-12.9 19.9-24.9 29.9-35.8zM140.2 57c16.8-9.8 54.1 4.2 93.4 39 2.5 2.2 5 4.6 7.6 7-15.5 16.7-29.8 34.5-42.9 53.1-22.6 2-45 5.5-67.2 10.4-1.3-5.1-2.4-10.3-3.5-15.5-9.4-48.4-3.2-84.9 12.6-94zm-24.5 263.6c-4.2-1.2-8.3-2.5-12.4-3.9-21.3-6.7-45.5-17.3-63-31.2-10.1-7-16.9-17.8-18.8-29.9 0-18.3 31.6-41.7 77.2-57.6 5.7-2 11.5-3.8 17.3-5.5 6.8 21.7 15 43 24.5 63.6-9.6 20.9-17.9 42.5-24.8 64.5zm116.6 98c-16.5 15.1-35.6 27.1-56.4 35.3-11.1 5.3-23.9 5.8-35.3 1.3-15.9-9.2-22.5-44.5-13.5-92 1.1-5.6 2.3-11.2 3.7-16.7 22.4 4.8 45 8.1 67.9 9.8 13.2 18.7 27.7 36.6 43.2 53.4-3.2 3.1-6.4 6.1-9.6 8.9zm24.5-24.3c-10.2-11-20.4-23.2-30.3-36.3 9.6.4 19.5.6 29.5.6 10.3 0 20.4-.2 30.4-.7-9.2 12.7-19.1 24.8-29.6 36.4zm130.7 30c-.9 12.2-6.9 23.6-16.5 31.3-15.9 9.2-49.8-2.8-86.4-34.2-4.2-3.6-8.4-7.5-12.7-11.5 15.3-16.9 29.4-34.8 42.2-53.6 22.9-1.9 45.7-5.4 68.2-10.5 1 4.1 1.9 8.2 2.7 12.2 4.9 21.6 5.7 44.1 2.5 66.3zm18.2-107.5c-2.8.9-5.6 1.8-8.5 2.6-7-21.8-15.6-43.1-25.5-63.8 9.6-20.4 17.7-41.4 24.5-62.9 5.2 1.5 10.2 3.1 15 4.7 46.6 16 79.3 39.8 79.3 58 0 19.6-34.9 44.9-84.8 61.4zm-149.7-15c25.3 0 45.8-20.5 45.8-45.8s-20.5-45.8-45.8-45.8c-25.3 0-45.8 20.5-45.8 45.8s20.5 45.8 45.8 45.8z" />
                                </svg>
                                <div className="w-full text-lg font-semibold">
                                  {
                                    questionElements[questionKey].form[formKey]
                                      .options[optionKey].title
                                  }
                                </div>
                                <div className="w-full text-sm">
                                  {
                                    questionElements[questionKey].form[formKey]
                                      .options[optionKey].description
                                  }
                                </div>
                              </div>
                            </label>
                          </li>
                        </>
                      ))}
                      <p
                        className={`text-sm mt-2 min-h-[1.57rem] ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
                      >
                        {
                          questionElements[questionKey].form[formKey].message
                            .text
                        }
                      </p>
                    </ul>
                  ) : questionElements[questionKey].form[formKey].type ===
                    "range" ? (
                    <>
                      <div className="relative mb-6">
                        <div
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
                        </div>
                        <label htmlFor="labels-range-input" className="sr-only">
                          Labels range
                        </label>
                        <input
                          id="labels-range-input"
                          type="range"
                          value={
                            questionElements[questionKey].form[formKey].selected
                              .selectedValue
                          }
                          min={
                            questionElements[questionKey].form[formKey].options
                              .range.min
                          }
                          max={
                            questionElements[questionKey].form[formKey].options
                              .range.max
                          }
                          step={
                            questionElements[questionKey].form[formKey].options
                              .range.step
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          onChange={(e) => {
                            const { value } = e.target;
                            setQuestionElements((prev) => {
                              const updatedElements = { ...prev };
                              updatedElements[questionKey].form[
                                formKey
                              ].selected.selectedValue = Number(value);
                              return updatedElements;
                            });
                          }}
                        />
                        {Object.keys(
                          questionElements[questionKey].form[formKey].options
                            .labels
                        ).map((labelKey: any, index: any) => (
                          <button
                            key={labelKey}
                            className={`absolute ${
                              questionElements[questionKey].form[formKey]
                                .options.labels[labelKey].align === "start"
                                ? `start-${questionElements[questionKey].form[formKey].options.labels[labelKey].offsetX}`
                                : `end-${questionElements[questionKey].form[formKey].options.labels[labelKey].offsetX}`
                            } -translate-x-[${questionElements[questionKey].form[formKey].options.labels[labelKey].correctX}] -bottom-6 text-sm text-gray-500 dark:text-gray-400`}
                            onClick={() => {
                              setQuestionElements((prev) => {
                                const updatedElements = { ...prev };
                                updatedElements[questionKey].form[
                                  formKey
                                ].selected.selectedValue =
                                  questionElements[questionKey].form[
                                    formKey
                                  ].options.labels[labelKey].value;
                                return updatedElements;
                              });
                            }}
                          >
                            {
                              questionElements[questionKey].form[formKey]
                                .options.labels[labelKey].text
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
                        {
                          questionElements[questionKey].form[formKey].message
                            .text
                        }
                      </p>
                    </>
                  ) : (
                    questionElements[questionKey].form[formKey].type ===
                      "text" && (
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor={formKey}
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {
                              questionElements[questionKey].form[formKey]
                                .options.label
                            }
                          </label>
                          <input
                            type="text"
                            id={formKey}
                            className={`bg-gray-50 block w-full p-2.5 text-sm rounded-lg border ${questionElements[questionKey].form[formKey].message.type === "success" ? "border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-500" : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"} `}
                            placeholder={
                              questionElements[questionKey].form[formKey]
                                .options.placeholder
                            }
                            required={
                              questionElements[questionKey].form[formKey]
                                .required
                            }
                            onChange={(e) => {
                              const { value } = e.target;
                              setQuestionElements((prev) => {
                                const updatedElements = { ...prev };
                                updatedElements[questionKey].form[
                                  formKey
                                ].selected.inputValue = value;
                                return updatedElements;
                              });
                            }}
                          />
                          <p
                            className={`text-sm mt-2 min-h-[1.57rem] ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
                          >
                            {
                              questionElements[questionKey].form[formKey]
                                .message.text
                            }
                          </p>
                        </div>
                      </div>
                    )
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={() => getNextQuestionKey(questionKey, formKey)}
                      className="px-3 py-1 rounded-md bg-synergy-light-blue text-white "
                    >
                      Weiter
                    </button>
                  </div>
                </section>
              )
            )}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Funnel;
