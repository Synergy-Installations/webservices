"use client";

import { useMessages, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useRef } from "react";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import Link from "next/link";
import { aside, label, p, q } from "framer-motion/client";
import { useRouter } from "next/navigation";
import { debounce } from "@com.synergy/frontend-ui/Debounce";
import { useDropzone } from "react-dropzone";
import FileUpload from "@com.synergy/frontend-ui/FileUpload";
import LlmFileExtraction from "@com.synergy/frontend-ui/llmFileExtraction";
import Confetti from "react-dom-confetti";
import Calendly from "@com.synergy/frontend-ui/Calendly";
import Range from "@com.synergy/frontend-ui/Range";
import { formatLocaleNumberToUniNumber } from "@com.synergy/frontend-ui/LocaleNumber";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useSignUp, useUser, useSignIn, useClerk } from "@clerk/nextjs";
import {
  PhoneCodeFactor,
  EmailCodeFactor,
  SignInFirstFactor,
} from "@clerk/types";
import { Dispatch, SetStateAction } from "react";
import {
  createQuestionElement,
  createFormElement,
} from "@com.synergy/frontend-ui/CreateElements";

/* eslint-disable-next-line */
export interface DefaultFunnelProps {
  questionElementsRaw: any;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
  config: {
    submitFunnel?(
      questionKey: string,
      formKey: string,
      questionElements: any,
      setQuestionElements: Dispatch<SetStateAction<Record<string, any>>>,
      getNextQuestionKey: (
        questionKey: string,
        formKey: string
      ) => { status: string }
    ): Promise<void>;
    auth?: {
      verifying: boolean;
      setVerifying: Dispatch<SetStateAction<boolean>>;
      handleVerification?(verificationCode: string): void;
    };
    format: {
      // useUid decides whether a new unique key should be created or the existing one (from uid) should be used
      useKey: boolean;
      // useStrings is used to determine whether input will be a string or the standard type
      useStrings: boolean;
      // useSelected is used to determine whether the selected value should be used or the default (fallback) value
      // this is used when we have selected value present and we want to use it
      useSelected: boolean;
      useUidAsKey: boolean;
    };
  };
  ui?: {
    topBar?(questionElements: any): JSX.Element;
    progressContainerClassNames?: string;
    progressContainerBackground?: boolean;
    sectionContainerClassNames?: string;
  };
  questionPresentation?: "scroll" | "window";
  children?(questionElements: any): void;
}

export const DefaultFunnel = (props: DefaultFunnelProps) => {
  const {
    questionElementsRaw,
    STORAGE_ZONE_ACCESS_KEY,
    questionPresentation = "window",
    children,
  } = props;
  const {
    submitFunnel,
    auth,
    format: { useKey, useStrings, useSelected, useUidAsKey },
  } = props.config;
  const {
    topBar,
    progressContainerClassNames = "",
    progressContainerBackground = false,
  } = props.ui ?? {};
  const { verifying = false, setVerifying, handleVerification } = auth ?? {};

  const t = useTranslations("LandingPage.ContactUs.Funnel");
  const router = useRouter();

  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [verificationButtonClicked, setVerificationButtonClicked] =
    useState<boolean>(false);

  // Use a reference to store the first question element key generated firstly
  // from the server and changes later by the client to purpusefully recreate state
  // in useEffect when needed (e.g. url queryParameters)
  const [
    referencingFirstQuestionElementKey,
    setReferencingFirstQuestionElementKey,
  ] = useState<string | null>(null);

  const [questionElements, setQuestionElements] = useState<Record<string, any>>(
    () => {
      console.log("recreate state");
      const questionElementKeys = Object.keys(questionElementsRaw);

      const questionElementsRawReduce = questionElementKeys.reduce(
        (acc: Record<string, any>, questionKey: string) => {
          const key = `${questionKey}-${Math.random().toString(36).substring(2, 7)}`;
          acc[useKey ? questionKey : key] = createQuestionElement(
            useKey ? questionElementsRaw[questionKey].uid : key,
            questionElementsRaw[questionKey],
            useKey,
            useStrings,
            useSelected,
            ["initialLoad"],
            false
          );
          return acc;
        },
        {}
      );
      setReferencingFirstQuestionElementKey(
        Object.keys(questionElementsRawReduce)[0] || null
      );

      return questionElementsRawReduce;
    }
  );

  children && children(questionElements);

  const confettiConfig = {
    angle: 90,
    spread: 69,
    startVelocity: 40,
    elementCount: 80,
    dragFriction: 0.06,
    duration: 5000,
    stagger: 8,
    width: "20px",
    height: "10px",
    perspective: "500px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
  };

  const confettiConfigLow = {
    angle: 90,
    spread: 360,
    startVelocity: 25,
    elementCount: 120,
    dragFriction: 0.11,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    perspective: "500px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
  };

  /** Flush server state - This is dirty and should be handled better
   * Rerender the component to use the client's section ids for continue button
   * This is due to the server rendering the compontent using the useState and then the client
   * recreates the state using different keys as they are created on initializing the state.
   */
  useEffect(() => {
    setQuestionElements((prev) => ({}));
    setQuestionElements(() => {
      const questionElementKeys = Object.keys(questionElementsRaw);

      const questionElementsRawReduce = questionElementKeys.reduce(
        (acc: Record<string, any>, questionKey: string) => {
          const key = `${questionKey}-${Math.random().toString(36).substring(2, 7)}`;
          acc[useKey ? questionKey : key] = createQuestionElement(
            useKey ? questionElementsRaw[questionKey].uid : questionKey,
            questionElementsRaw[questionKey],
            useKey,
            useStrings,
            useSelected,
            ["initialLoad"],
            false
          );
          return acc;
        },
        {}
      );

      setReferencingFirstQuestionElementKey(
        Object.keys(questionElementsRawReduce)[0] || null
      );

      return questionElementsRawReduce;
    });
  }, []);

  const setQuestionElementParameters = () => {
    if (
      typeof window !== "undefined" &&
      questionPresentation === "window" &&
      Object.keys(questionElements).length > 0
    ) {
      console.log("set currentQuestionId to URL", questionElements);
      const firstKey = Object.keys(questionElements)[0];
      let currentQuestionId = firstKey;
      const url = new URL(window.location.href);

      // If currentQuestionId is already in the query, use it if valid, else set to firstKey
      const paramId = url.searchParams.get("currentQuestionId");
      if (paramId && questionElements[paramId]) {
        currentQuestionId = paramId;
      } else {
        url.searchParams.set("currentQuestionId", firstKey);
        window.history.replaceState({}, "", url.toString());
      }
    }
  };

  // Set the current question id to the URL for advanced use
  // to start where the user left off (requires saving state)
  useEffect(() => {
    console.log(
      "setQuestionElementParameters",
      referencingFirstQuestionElementKey
    );
    const url = new URL(window.location.href);
    if (
      // typeof window !== "undefined" &&
      questionPresentation === "window" &&
      url.searchParams.get("currentQuestionId") !==
      Object.keys(questionElements)[0]
    ) {
      setQuestionElementParameters();
    }

    // if (
    //   typeof window !== "undefined" &&
    //   questionPresentation === "window" &&
    //   Object.keys(questionElements).length > 0
    // ) {
    //   debouncedSetQuestionElementParameters();
    // }
  }, [referencingFirstQuestionElementKey]);

  console.log(
    "referenceFirstQuestionElementKey",
    referencingFirstQuestionElementKey
  );

  const countForms = (): { totalForms: number; successForms: number } => {
    let totalForms = 0;
    let successForms = 0;

    Object.keys(questionElements ?? {}).forEach((questionKey) => {
      if (questionElements[questionKey].defaultVisible == false) {
        return;
      }
      console.log("addToCount", questionKey);
      const forms = questionElements[questionKey].form;
      console.log("add", Object.keys(forms).length);
      /** Remove the submit button form as it is not user input
       */
      totalForms += Object.keys(forms).filter(
        (formKey) =>
          forms[formKey].defaultVisible == true &&
          forms[formKey].type !== "submit-button"
      ).length;
      successForms += Object.keys(forms).filter(
        (formKey) =>
          /** Make sure that the form is visible to the user */
          forms[formKey].defaultVisible == true &&
          /** Make sure not to count the submit button as it is not user input */
          forms[formKey].type !== "submit-button" &&
          (forms[formKey].message.type === "success" ||
            /** Forms with a warning are correct, however, something else (like the form above) is
             * incorrect which gives an error message but not the form itself.
             */
            forms[formKey].message.type === "warning")
      ).length;
    });
    return { totalForms, successForms };
  };

  const [formCounts, setFormCounts] = useState(() => countForms());

  const countFormsAndSet = () => {
    setFormCounts(countForms());
  };

  const debouncedCountFormsAndSet = debounce(countFormsAndSet, 100);

  /** Used for initial client render and is needed as countForms
   * does not recognize a newly created question when evoked
   * from the button click or on new question creation
   */
  useEffect(() => {
    debouncedCountFormsAndSet();
  }, [Object.keys(questionElements ?? {}).length]);

  const getNextQuestionKey = (
    currentQuestionKey: string,
    formKey: string,
    redirect: "next" | "previous" | "none" = "none"
  ): { status: string } => {
    const questionKeys = Object.keys(questionElements);
    const currentQuestion = questionElements[currentQuestionKey];
    const currentQuestionIndex = questionKeys.indexOf(currentQuestionKey);
    const formKeys = Object.keys(currentQuestion.form);
    const currentFormIndex = formKeys.indexOf(formKey);
    const visibleQuestionKeys = questionKeys.filter((key) => {
      return questionElements[key].defaultVisible === true;
    });
    const currentVisibleQuestionIndex =
      visibleQuestionKeys.indexOf(currentQuestionKey);
    const visibleFormKeys = formKeys.filter((key) => {
      return currentQuestion.form[key].defaultVisible === true;
    });
    const currentVisibleFormIndex = visibleFormKeys.indexOf(formKey);

    let error = false;
    visibleQuestionKeys.forEach(
      (questionKey: string, questionIndex: number) => {
        Object.keys(questionElements[questionKey].form)
          .filter(
            (key) =>
              questionElements[questionKey].form[key].defaultVisible == true
          )
          .forEach((formKey: string, formIndex: number) => {
            console.log(questionKey, formKey);
            console.log(
              "check",
              questionKey,
              formKey,
              questionElements[questionKey].defaultVisible === true &&
              (questionIndex < currentQuestionIndex ||
                (questionIndex == currentQuestionIndex &&
                  formIndex <= currentFormIndex) ||
                questionElements[questionKey].form[formKey].message.type ===
                "success" ||
                questionElements[questionKey].form[formKey].message.type ===
                "error" ||
                questionElements[questionKey].form[formKey].message.type ===
                "warning")
              // questionElements[questionKey].form[formKey].message
            );
            if (
              /** Continue if the current question is visible to the user and form index is less or equal than the question
               * and form index that the button got pressed on or the form was got a success message
               */
              questionElements[questionKey].defaultVisible === true &&
              questionElements[questionKey].form[formKey].defaultVisible ===
              true &&
              (questionIndex < currentVisibleQuestionIndex ||
                (questionIndex == currentVisibleQuestionIndex &&
                  formIndex <= currentVisibleFormIndex) ||
                questionElements[questionKey].form[formKey].message.type ===
                "success" ||
                questionElements[questionKey].form[formKey].message.type ===
                "error" ||
                questionElements[questionKey].form[formKey].message.type ===
                "warning")
            ) {
              if (
                /** Test the form for incorrect input only if the form is a required
                 * input, otherwise we have no business validating it.
                 */
                questionElements[questionKey].form[formKey].required &&
                (((questionElements[questionKey].form[formKey].type ===
                  "checkbox" ||
                  questionElements[questionKey].form[formKey].type ===
                  "radio" ||
                  questionElements[questionKey].form[formKey].type ===
                  "select") &&
                  questionElements[questionKey].form[formKey].selected
                    .selectedOptions.length == 0) ||
                  (questionElements[questionKey].form[formKey].type ===
                    "range" &&
                    Number(
                      questionElements[questionKey].form[formKey].selected
                        .selectedValue
                    ) <
                    questionElements[questionKey].form[formKey].options.range
                      .min) ||
                  ((questionElements[questionKey].form[formKey].type ===
                    "text" ||
                    questionElements[questionKey].form[formKey].type ===
                    "email" ||
                    questionElements[questionKey].form[formKey].type ===
                    "tel" ||
                    questionElements[questionKey].form[formKey].type ===
                    "textarea") &&
                    questionElements[questionKey].form[formKey].selected
                      .inputValue == ""))
              ) {
                /** Wrong input
                 * We do not care about incorrect inputs on previous forms as long as the current form shows errors
                 */
                console.log("user wants to continue with incorrect input");
                setQuestionElements((prev) => {
                  const updatedElements = { ...prev };
                  // Check if the question and form still exist, the questionElement could have been removed
                  // and we go through the old state, updatedElements is the new state
                  if (
                    !updatedElements[questionKey] ||
                    !updatedElements[questionKey].form[formKey]
                  ) {
                    return updatedElements;
                  }
                  updatedElements[questionKey].form[formKey].message.text =
                    questionElements[questionKey].form[
                      formKey
                    ].message.requiredMessage;
                  updatedElements[questionKey].form[formKey].message.type =
                    "error";
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
                questionIndex == currentVisibleQuestionIndex &&
                formIndex == currentVisibleFormIndex
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
              } else if (
                /** No error at current form, does not check "submint-form" because it does not have
                 * anything to check for and get handled seperatly
                 */
                questionElements[questionKey].form[formKey].type !==
                "submit-button"
              ) {
                /** Continue with checking that elements that had previously shown an
                 * error and not clicked button to continue but rather on a different form
                 */
                setQuestionElements((prev) => {
                  const updatedElements = { ...prev };
                  if (
                    !updatedElements[questionKey] ||
                    !updatedElements[questionKey].form[formKey]
                  ) {
                    return updatedElements;
                  }
                  updatedElements[questionKey].form[formKey].message.text =
                    questionElements[questionKey].form[
                      formKey
                    ].message.successMessage;
                  updatedElements[questionKey].form[formKey].message.type =
                    "success";
                  return updatedElements;
                });
              }
            }
          });
      }
    );

    debouncedCountFormsAndSet();

    // Check if there is an error in the form if we redirect forward,
    // if so, return error status
    if (error && redirect === "next") return { status: "error" };

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
    if (
      currentVisibleFormIndex !== -1 &&
      currentVisibleFormIndex < visibleFormKeys.length - 1
    ) {
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
      console.log("Push to next question2", visibleQuestionKeys);
      if (redirect === "next")
        router.push(`#${visibleFormKeys[currentVisibleFormIndex + 1]}`);
      return { status: "success" };
    }

    /** Route to same form as a "coping" mechanism to focus on the last form, implementation
     * to send form is missing and this needs to be rewritten when done.
     */
    const currentIndex = questionKeys.indexOf(currentQuestionKey);
    if (
      redirect !== "previous" &&
      (currentVisibleQuestionIndex === -1 ||
        currentVisibleQuestionIndex === visibleQuestionKeys.length - 1)
    ) {
      console.log("when is this called?", currentQuestionKey, formKey);
      if (
        questionElements[currentQuestionKey].form[formKey].type !==
        "submit-button"
      ) {
        setQuestionElements((prev) => {
          const updatedElements = { ...prev };
          console.log(
            "about to update",
            currentQuestionKey,
            formKey,
            questionElements[currentQuestionKey].form[formKey].message
          );
          updatedElements[currentQuestionKey].form[formKey].message.text =
            questionElements[currentQuestionKey].form[
              formKey
            ].message.successMessage;
          updatedElements[currentQuestionKey].form[formKey].message.type =
            "success";
          return updatedElements;
        });

        console.log("Push to next question1", visibleQuestionKeys);

        if (redirect === "next") router.push(`#${formKey}`);
      }

      return { status: "success" };
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
    console.log("Push to next question", visibleQuestionKeys);
    if (redirect === "next") {
      // Change the searchParameters in the URL to the next question to render the next question
      if (questionPresentation === "window") {
        const url = new URL(window.location.href);
        url.searchParams.set(
          "currentQuestionId",
          visibleQuestionKeys[currentVisibleQuestionIndex + 1]
        );
        window.history.replaceState({}, "", url.toString());
        // router.push(
        //   `?currentQuestionId=${visibleQuestionKeys[currentVisibleQuestionIndex + 1]}`
        // );
      }
      router.push(`#${visibleQuestionKeys[currentVisibleQuestionIndex + 1]}`);
    } else if (redirect === "previous") {
      // Change the searchParameters in the URL to the previous question to render the previous question
      if (questionPresentation === "window") {
        const url = new URL(window.location.href);
        url.searchParams.set(
          "currentQuestionId",
          visibleQuestionKeys[
          currentVisibleQuestionIndex - 1 >= 0
            ? currentVisibleQuestionIndex - 1
            : 0
          ]
        );
        // Does not work with submit-button for whatever reason
        console.log("previous", url.toString());
        window.history.replaceState({}, "", url.toString());
        // router.push(
        //   `?currentQuestionId=${visibleQuestionKeys[currentVisibleQuestionIndex - 1]}`
        // );
      }
      router.push(
        `#${visibleQuestionKeys[currentVisibleQuestionIndex - 1 > 0 ? currentVisibleQuestionIndex - 1 : 0]}`
      );
    }
    return { status: "success" };
  };

  const debouncedGetNextQuestionKey = debounce(getNextQuestionKey, 100);

  const addQuestionElement = (
    from: {
      fromQuestionKey: string;
      fromFormKey: string;
      fromOptionKey: string;
    },
    questionKey: string,
    question: any
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
      createQuestionElement(
        questionKey,
        question,
        // We are creating a new question element so we need to create a unique key
        false,
        useStrings,
        // We are creating a new question element so we do not have previously selected value
        false,
        fromArray,
        true,
        useUidAsKey
      ),
      questionKeyUid
    );
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      const fromQuestionIndex = Object.keys(updatedElements).indexOf(
        from.fromQuestionKey
      );
      const newQuestionElements = Object.entries(updatedElements);
      newQuestionElements.splice(fromQuestionIndex + 1, 0, [
        questionKeyUid,
        createQuestionElement(
          questionKey,
          question,
          // We are creating a new question element so we need to create a unique key
          false,
          useStrings,
          // We are creating a new question element so we do not have previously selected value
          false,
          fromArray,
          true,
          useUidAsKey
        ),
      ]);
      return Object.fromEntries(newQuestionElements);
    });
  };

  const addFormElement = (
    from: {
      fromQuestionKey: string;
      fromFormKey: string;
      fromOptionKey: string;
    },
    formKey: string,
    form: any
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
      form,
      createFormElement(
        questionElements[from.fromQuestionKey].uid,
        formKey,
        form,
        // We are creating a new form element so we need to create a unique key
        false,
        useStrings,
        // We are creating a new question element so we do not have previously selected value
        false,
        fromArray,
        true
      ),
      formKeyUid
    );
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      const fromFormIndex = Object.keys(
        updatedElements[from.fromQuestionKey].form
      ).indexOf(from.fromFormKey);
      const newFormElements = Object.entries(
        updatedElements[from.fromQuestionKey].form
      );
      newFormElements.splice(fromFormIndex + 1, 0, [
        formKeyUid,
        createFormElement(
          questionElements[from.fromQuestionKey].uid,
          formKey,
          form,
          // We are creating a new form element so we need to create a unique key
          false,
          useStrings,
          // We are creating a new question element so we do not have previously selected value
          false,
          fromArray,
          true
        ),
      ]);
      updatedElements[from.fromQuestionKey].form =
        Object.fromEntries(newFormElements);
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
    console.log(
      "initiate removeFormElement",
      fromQuestionKey,
      fromOptionKey,
      questionElements[fromQuestionKey]
    );
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      Object.keys(updatedElements[fromQuestionKey].form).forEach((key) => {
        if (
          updatedElements[fromQuestionKey].form[key].from.includes(
            fromOptionKey
          )
        ) {
          console.log(
            "key is included",
            updatedElements[fromQuestionKey].form[key].from
          );
          delete updatedElements[fromQuestionKey].form[key];
        }
      });
      return updatedElements;
    });
  };

  console.log(
    "questionElements",
    questionElements,
    Object.keys(questionElements ?? {}).length
  );

  const handleKeyUpCode = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const { value } = event.currentTarget;
    if (value.length === 0 && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    } else if (value.length === 1 && index < codeInputsRef.current.length - 1) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handlePasteCode = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text");
    const digits = pasteData.replace(/\D/g, "").split("");

    digits.forEach((digit, index) => {
      if (codeInputsRef.current[index]) {
        codeInputsRef.current[index]!.value = digit;
        if (index < codeInputsRef.current.length - 1) {
          codeInputsRef.current[index + 1]?.focus();
        }
      }
    });
  };

  const getVerificationCode = (): string => {
    return codeInputsRef.current.map((input) => input?.value || "").join("");
  };

  const calculateForms = (questionKey: string, formKey: string) => {
    Object.keys(questionElements).forEach((questionKeyLoop: string) => {
      const question = questionElements[questionKeyLoop];
      Object.keys(question.form).forEach((formKeyLoop: string) => {
        const form = question.form[formKeyLoop];
        console.log(
          "calculateFormsBeforeSelection",
          questionKey,
          formKey,
          questionKeyLoop,
          formKeyLoop,
          form.type
        );
        if (
          /** Only calculate if the calling form is the one linked to the calculating form */
          form.type === "calculation" &&
          form.options.inputForm.questionKey ===
          questionElements[questionKey].uid &&
          form.options.inputForm.formKey ===
          questionElements[questionKey].form[formKey].uid
        ) {
          console.log("calculateForms", questionKeyLoop, formKeyLoop);
          /** The input form is the one that calls the function and only the correct
           * calculation form is calculated using the if statement above
           */
          const inputForm = questionElements[questionKey].form[formKey];
          const maths = form.options.maths;
          const inputValue = formatLocaleNumberToUniNumber(
            inputForm.selected.selectedValue,
            questionElements[questionKey].form[formKey].options.unit
              .numberFormat
          );
          console.log("inputValue", inputValue);
          const formula = maths.formula.replace("x", inputValue.toString());
          console.log("formula", formula);
          const result = eval(formula);
          const unit = maths.unit;
          const spaceBetween = maths.spaceBetween;
          const position = maths.position;

          setQuestionElements((prev) => {
            const updatedElements = { ...prev };
            updatedElements[questionKeyLoop].form[
              formKeyLoop
            ].selected.inputValue = `${result}`;
            return updatedElements;
          });
        }
      });
    });
  };

  const debouncedCalculateForms = debounce(calculateForms, 100);

  const isQuestionSkippable = (questionKey: string): boolean => {
    const visibleForms = Object.entries(
      questionElements[questionKey]?.form ?? {}
    ).filter(
      ([_, form]: [string, any]) =>
        form.defaultVisible === true && form.type !== "submit-button"
    );

    const hasRequired = visibleForms.some(([_, form]: [string, any]) => form.required === true);
    if (hasRequired) return false;

    const hasData = visibleForms.some(([_, form]: [string, any]) => {
      if (
        form.type === "checkbox" ||
        form.type === "radio" ||
        form.type === "select"
      ) {
        return form.selected.selectedOptions.length > 0;
      }
      if (
        form.type === "text" ||
        form.type === "email" ||
        form.type === "tel" ||
        form.type === "textarea"
      ) {
        return form.selected.inputValue !== "";
      }
      if (form.type === "file-upload" || form.type === "llm-file-extraction") {
        return form.selected.selectedFiles.length > 0;
      }
      if (form.type === "calendly") {
        return form.selected.scheduledEvent?.event?.uri !== "";
      }
      return false;
    });

    return !hasData;
  };

  const renderAfterMathsCalculation = (
    questionUid: string,
    formUid: string
  ): JSX.Element => {
    const question = Object.values(questionElements).find(
      ({ uid }: { uid: string }) => questionUid === uid
    );
    const form: any = Object.values(question.form).find(
      (form: any) => form.uid === formUid
    );

    console.log("renderAfterMathsCalculation", form);
    return (
      <div
        className={`flex justify-end ${form.options.unit.spaceBetween && "gap-1"}`}
      >
        <span className="text-synergy-dark-grey dark:text-gray-400">
          {form.selected.selectedValue}
        </span>
        <span
          className={`text-synergy-dark-grey dark:text-gray-400 flex justify-end ${form.options.unit.position === "before" && "order-first"}`}
        >
          {form.options.unit.value}
        </span>
      </div>
    );
  };

  const questionElementsToBeRendered = () => {
    // Helper to get the currentQuestionId from the URL if questionPresentation is "window"
    let filteredQuestionKeys = Object.keys(questionElements ?? {}).filter(
      (questionKey: any) =>
        questionElements[questionKey]?.defaultVisible === true
    );

    if (questionPresentation === "window" && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const currentQuestionId = url.searchParams.get("currentQuestionId");
      console.log("currentQuestionId", currentQuestionId, filteredQuestionKeys);
      if (
        currentQuestionId &&
        filteredQuestionKeys.includes(currentQuestionId)
      ) {
        filteredQuestionKeys = [currentQuestionId];
      }
    }
    return filteredQuestionKeys;
  };

  return (
    <>
      {topBar && topBar(questionElements)}
      <div className="relative flex flex-col justify-center max-w-3xl mx-auto">
        <div className={`${progressContainerClassNames}`}>
          {progressContainerBackground && (
            <div className="absolute inset-0 bg-white -top-80"></div>
          )}
          <div className="relative flex justify-between mb-1">
            <span className="text-base font-medium text-synergy-light-blue dark:text-white">
              {t("progress.labels.topLeft")}
            </span>
            <span className="text-sm font-medium text-synergy-light-blue dark:text-white">
              <Confetti
                active={formCounts.successForms === formCounts.totalForms}
                config={confettiConfigLow}
              />
              {formCounts.successForms}{" "}
              {t(`progress.labels.topRightDeliminator`)} {formCounts.totalForms}{" "}
              {t(`progress.labels.topRightPostfix`)}{" "}
              {formCounts.totalForms === 0
                ? 0
                : Math.round(
                  (formCounts.successForms / formCounts.totalForms) * 100
                )}
              %
            </span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-synergy-light-blue h-2.5 rounded-full"
              style={{
                width: `${formCounts.totalForms === 0 ? 0 : (formCounts.successForms / formCounts.totalForms) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <div className={`${props.ui?.sectionContainerClassNames ?? ""}`}>
          {questionElementsToBeRendered().map(
            (questionKey: any, index: any) => (
              <section id={questionKey} key={index} className="scroll-mt-40">
                {/** Title and description of question */}
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {questionElements[questionKey]?.defaultVisible === true}
                    {questionElements[questionKey].title}
                  </div>
                  <div className="">
                    {questionElements[questionKey].description}
                  </div>
                </div>
                {/** Form */}
                <div className="grid grid-cols-2 gap-6">
                  {Object.keys(questionElements[questionKey].form)
                    .filter(
                      (formKey: any) =>
                        questionElements[questionKey].form[formKey]
                          .defaultVisible === true
                    )
                    .map((formKey: any, index: any) => (
                      <section
                        key={formKey}
                        id={formKey}
                        className={`w-full scroll-mt-40 col-span-${questionElements[questionKey].form[formKey].span
                          }`}
                      >
                        {/** Title and description of form */}
                        <div className="text-center mt-5 mb-5">
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {questionElements[questionKey].form[formKey].title}
                          </div>
                          <div className="">
                            {
                              questionElements[questionKey].form[formKey]
                                .description
                            }
                          </div>
                        </div>
                        {questionElements[questionKey].form[formKey].type ===
                          "checkbox" ||
                          questionElements[questionKey].form[formKey].type ===
                          "radio" ? (
                          <>
                            <ul className="grid w-full gap-6 grid-flow-row md:grid-cols-6">
                              {Object.keys(
                                questionElements[questionKey].form[formKey]
                                  .options
                              ).map((optionKey: any, index: any) => (
                                <li
                                  key={optionKey}
                                  className={`col-span-${questionElements[questionKey].form[formKey].options[optionKey].span}`}
                                >
                                  <input
                                    type={
                                      questionElements[questionKey].form[
                                        formKey
                                      ].type === "checkbox"
                                        ? "checkbox"
                                        : "radio"
                                    }
                                    disabled={
                                      questionElements[questionKey].form[
                                        formKey
                                      ].options[optionKey].disabled
                                    }
                                    name={formKey}
                                    id={optionKey}
                                    checked={
                                      questionElements[questionKey].form[
                                        formKey
                                      ].selected.selectedOptionsUid.includes(
                                        optionKey
                                      ) ||
                                      questionElements[questionKey].form[
                                        formKey
                                      ].selected.selectedOptions.includes(
                                        questionElements[questionKey].form[
                                          formKey
                                        ].options[optionKey].title
                                      )
                                    }
                                    tabIndex={0}
                                    onChange={(e) => {
                                      const { checked, id } = e.target;
                                      console.log("onchange", checked, id);
                                      if (checked) {
                                        /** Clean deselection for radio */
                                        if (
                                          questionElements[questionKey].form[
                                            formKey
                                          ].selected.selectedOptionsUid.length >
                                          0 &&
                                          questionElements[questionKey].form[
                                            formKey
                                          ].type === "radio"
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
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options[optionKey].addForm !== ""
                                        ) {
                                          addFormElement(
                                            {
                                              fromQuestionKey: questionKey,
                                              fromFormKey: formKey,
                                              fromOptionKey: optionKey,
                                            },
                                            questionElements[questionKey].form[
                                              formKey
                                            ].options[optionKey].addForm,
                                            // On dashboard where we get the uid in the key in questionElementsRaw, we need to find the element
                                            useKey
                                              ? Object.values(
                                                questionElements[questionKey]
                                                  .form
                                              ).find(
                                                (form: any) =>
                                                  form.uid ===
                                                  questionElements[
                                                    questionKey
                                                  ].form[formKey].options[
                                                    optionKey
                                                  ].addForm
                                              )
                                              : questionElementsRaw[
                                                questionElements[questionKey]
                                                  .uid
                                              ].form[
                                              questionElements[questionKey]
                                                .form[formKey].options[
                                                optionKey
                                              ].addForm
                                              ]
                                          );
                                        }
                                        if (
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options[optionKey].addQuestion !==
                                          ""
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
                                            ].options[optionKey].addQuestion,
                                            useKey
                                              ? Object.values(
                                                questionElements
                                              ).find(
                                                (questionElement: any) =>
                                                  questionElement.uid ===
                                                  questionElements[
                                                    questionKey
                                                  ].form[formKey].options[
                                                    optionKey
                                                  ].addQuestion
                                              )
                                              : questionElementsRaw[
                                              questionElements[questionKey]
                                                .form[formKey].options[
                                                optionKey
                                              ].addQuestion
                                              ]
                                          );
                                        }
                                      } else {
                                        /** Gets used for checkbox only, use "Clean deselection for radio above for radio type" */
                                        removeFormElement(
                                          questionKey,
                                          optionKey
                                        );
                                        removeQuestionElement(optionKey);
                                      }

                                      setQuestionElements((prev) => {
                                        /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
                                        const updatedElements = { ...prev };
                                        const form =
                                          updatedElements[questionKey].form[
                                          formKey
                                          ];
                                        if (checked) {
                                          if (
                                            questionElements[questionKey].form[
                                              formKey
                                            ].type === "checkbox"
                                          ) {
                                            form.selected.selectedOptions = [
                                              ...form.selected.selectedOptions,
                                              questionElements[questionKey]
                                                .form[formKey].options[
                                                optionKey
                                              ].title,
                                            ];
                                            form.selected.selectedOptionsUid = [
                                              ...form.selected
                                                .selectedOptionsUid,
                                              optionKey,
                                            ];
                                          } else if (
                                            questionElements[questionKey].form[
                                              formKey
                                            ].type === "radio"
                                          ) {
                                            /** Radio - only one option can be selected */
                                            form.selected.selectedOptions = [
                                              questionElements[questionKey]
                                                .form[formKey].options[
                                                optionKey
                                              ].title,
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
                                                questionElements[questionKey]
                                                  .form[formKey].options[
                                                  optionKey
                                                ].title
                                            );
                                          form.selected.selectedOptionsUid =
                                            form.selected.selectedOptionsUid.filter(
                                              (option: string) =>
                                                option !== optionKey
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

                                      /** Validate input (especially useful if user forgot input at form above)
                                       * Need to be debounced as it may happen that state is not updated right away
                                       */
                                      debouncedGetNextQuestionKey(
                                        questionKey,
                                        formKey
                                      );

                                      /** Update Progress count */
                                      debouncedCountFormsAndSet();
                                    }}
                                    className="hidden peer"
                                    required={true}
                                  />
                                  <label
                                    htmlFor={optionKey}
                                    className="inline-flex items-center justify-between peer-disabled:cursor-not-allowed w-full p-5 text-synergy-dark-grey bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 dark:peer-checked:border-blue-600 hover:text-gray-600 peer-disabled:hover:text-synergy-dark-grey peer-disabled:hover:bg-white dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
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
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options[optionKey].title
                                        }
                                      </div>
                                      <div className="w-full text-sm">
                                        {
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options[optionKey].description
                                        }
                                      </div>
                                    </div>
                                  </label>
                                </li>
                              ))}
                            </ul>
                            <p
                              className={`text-sm w-full inline-block mt-2 min-h-[1.57rem] ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
                            >
                              {
                                questionElements[questionKey].form[formKey]
                                  .message.text
                              }
                            </p>
                          </>
                        ) : questionElements[questionKey].form[formKey].type ===
                          "select" ? (
                          <div
                            key={formKey}
                            className="grid gap-6 md:grid-cols-2"
                          >
                            <div className="">
                              <label
                                htmlFor={formKey}
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                {
                                  questionElements[questionKey].form[formKey]
                                    .label
                                }
                              </label>
                              <select
                                id={formKey}
                                // defaultValue={
                                //   questionElements[questionKey].form[formKey]
                                //     .defaultValue
                                // }
                                value={
                                  questionElements[questionKey].form[formKey]
                                    .multiple
                                    ? questionElements[questionKey].form[
                                      formKey
                                    ].selected.selectedOptions
                                    : questionElements[questionKey].form[
                                      formKey
                                    ].selected.selectedOptions[0]
                                }
                                multiple={
                                  questionElements[questionKey].form[formKey]
                                    .multiple
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={(e) => {
                                  const { selectedOptions } = e.target;
                                  const selectedOptionValues = Array.from(
                                    selectedOptions
                                  ).map((option) => option.value);
                                  console.log(
                                    "onchange select",
                                    selectedOptions
                                  );

                                  const selectedOptionKeys =
                                    selectedOptionValues.map((value) => {
                                      return (
                                        Object.keys(
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options
                                        ).find(
                                          (key) =>
                                            questionElements[questionKey].form[
                                              formKey
                                            ].options[key].title === value
                                        ) || ""
                                      );
                                    });
                                  console.log(
                                    "selectegOptionKeys",
                                    selectedOptionKeys
                                  );

                                  /** Clean deselection for deselected elements */
                                  if (
                                    questionElements[questionKey].form[formKey]
                                      .selected.selectedOptionsUid.length > 0
                                  ) {
                                    questionElements[questionKey].form[
                                      formKey
                                    ].selected.selectedOptionsUid.map(
                                      (optionUid: string) => {
                                        console.log(
                                          "about to clean ",
                                          optionUid
                                        );
                                        /** Only remove form or question if the option is not selected any more */
                                        if (
                                          !selectedOptionKeys.includes(
                                            optionUid
                                          )
                                        ) {
                                          console.log(
                                            "in cleaning stage ",
                                            optionUid,
                                            questionKey
                                          );
                                          removeFormElement(
                                            questionKey,
                                            optionUid
                                          );
                                          removeQuestionElement(optionUid);
                                        }
                                      }
                                    );
                                  }

                                  selectedOptionKeys.forEach(
                                    (optionKey: string) => {
                                      if (
                                        !questionElements[questionKey].form[
                                          formKey
                                        ].selected.selectedOptionsUid.includes(
                                          optionKey
                                        )
                                      ) {
                                        if (
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options[optionKey].addForm !== ""
                                        ) {
                                          addFormElement(
                                            {
                                              fromQuestionKey: questionKey,
                                              fromFormKey: formKey,
                                              fromOptionKey: optionKey,
                                            },
                                            questionElements[questionKey].form[
                                              formKey
                                            ].options[optionKey].addForm,
                                            // On dashboard where we get the uid in the key in questionElementsRaw, we need to find the element
                                            useKey
                                              ? Object.values(
                                                questionElements[questionKey]
                                                  .form
                                              ).find(
                                                (form: any) =>
                                                  form.uid ===
                                                  questionElements[
                                                    questionKey
                                                  ].form[formKey].options[
                                                    optionKey
                                                  ].addForm
                                              )
                                              : questionElementsRaw[
                                                questionElements[questionKey]
                                                  .uid
                                              ].form[
                                              questionElements[questionKey]
                                                .form[formKey].options[
                                                optionKey
                                              ].addForm
                                              ]
                                          );
                                          // addFormElement(
                                          //   {
                                          //     fromQuestionKey: questionKey,
                                          //     fromFormKey: formKey,
                                          //     fromOptionKey: optionKey,
                                          //   },
                                          //   questionElements[questionKey].form[
                                          //     formKey
                                          //   ].options[optionKey].addForm,
                                          //   questionElementsRaw[
                                          //     questionElements[questionKey].uid
                                          //   ].form[
                                          //     questionElements[questionKey].form[
                                          //       formKey
                                          //     ].options[optionKey].addForm
                                          //   ]
                                          // );
                                        }
                                        if (
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options[optionKey].addQuestion !==
                                          ""
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
                                            ].options[optionKey].addQuestion,
                                            questionElementsRaw[
                                            questionElements[questionKey]
                                              .form[formKey].options[
                                              optionKey
                                            ].addQuestion
                                            ]
                                          );
                                        }
                                      }
                                    }
                                  );

                                  setQuestionElements((prev) => {
                                    const updatedElements = { ...prev };
                                    const form =
                                      updatedElements[questionKey].form[
                                      formKey
                                      ];
                                    form.selected.selectedOptions =
                                      selectedOptionKeys.map(
                                        (optionKey: any) =>
                                          updatedElements[questionKey].form[
                                            formKey
                                          ].options[optionKey].title
                                      );
                                    form.selected.selectedOptionsUid =
                                      selectedOptionKeys;

                                    return updatedElements;
                                  });

                                  localStorage.setItem(
                                    `${questionElements[questionKey].uid}-${questionElements[questionKey].form[formKey].uid}`,
                                    selectedOptionKeys
                                      .map(
                                        (optionKey: any) =>
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options[optionKey].title
                                      )
                                      .toString()
                                  );

                                  /** Validate input (especially useful if user forgot input at form above)
                                   * Need to be debounced as it may happen that state is not updated right away
                                   */
                                  debouncedGetNextQuestionKey(
                                    questionKey,
                                    formKey
                                  );

                                  /** Update Progress count */
                                  debouncedCountFormsAndSet();
                                }}
                              >
                                {Object.keys(
                                  questionElements[questionKey].form[formKey]
                                    .options
                                ).map((optionKey: any, index: any) => (
                                  <option
                                    key={optionKey}
                                    value={
                                      questionElements[questionKey].form[
                                        formKey
                                      ].options[optionKey].title
                                    }
                                  >
                                    {
                                      questionElements[questionKey].form[
                                        formKey
                                      ].options[optionKey].title
                                    }
                                  </option>
                                ))}
                              </select>
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
                        ) : questionElements[questionKey].form[formKey].type ===
                          "range" ? (
                          <Range
                            questionElements={questionElements}
                            questionKey={questionKey}
                            formKey={formKey}
                            setQuestionElements={setQuestionElements}
                            debouncedGetNextQuestionKey={
                              debouncedGetNextQuestionKey
                            }
                            debouncedCalculateForms={debouncedCalculateForms}
                          />
                        ) : questionElements[questionKey].form[formKey].type ===
                          "text" ||
                          questionElements[questionKey].form[formKey].type ===
                          "email" ||
                          questionElements[questionKey].form[formKey].type ===
                          "tel" ||
                          questionElements[questionKey].form[formKey].type ===
                          "textarea" ? (
                          <div className="grid gap-6">
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
                              {questionElements[questionKey].form[formKey]
                                .type === "textarea" ? (
                                <textarea
                                  id={formKey}
                                  rows={
                                    questionElements[questionKey].form[formKey]
                                      .options.rows
                                  }
                                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  placeholder={
                                    questionElements[questionKey].form[formKey]
                                      .options.placeholder
                                  }
                                  required={
                                    questionElements[questionKey].form[formKey]
                                      .required
                                  }
                                  value={
                                    questionElements[questionKey].form[formKey]
                                      .selected.inputValue
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

                                    /** Save input in localStorage if dared */
                                    questionElements[questionKey].form[formKey]
                                      .localStorage &&
                                      localStorage.setItem(
                                        `${questionElements[questionKey].uid}-${questionElements[questionKey].form[formKey].uid}`,
                                        value
                                      );
                                  }}
                                  onBlur={() => {
                                    /** Validate input (especially useful if user forgot input at form above)
                                     * Need to be debounced as it may happen that state is not updated right away
                                     */
                                    debouncedGetNextQuestionKey(
                                      questionKey,
                                      formKey
                                    );
                                  }}
                                ></textarea>
                              ) : (
                                <input
                                  type={
                                    questionElements[questionKey].form[formKey]
                                      .type
                                  }
                                  id={formKey}
                                  className={`bg-gray-50 block w-full p-2.5 text-sm rounded-lg border ${questionElements[questionKey].form[formKey].message.type === "success" ? "border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-500" : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"} `}
                                  placeholder={
                                    questionElements[questionKey].form[formKey]
                                      .options.placeholder
                                  }
                                  value={
                                    questionElements[questionKey].form[formKey]
                                      .selected.inputValue
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

                                    /** Save input in localStorage if dared */
                                    questionElements[questionKey].form[formKey]
                                      .localStorage &&
                                      localStorage.setItem(
                                        `${questionElements[questionKey].uid}-${questionElements[questionKey].form[formKey].uid}`,
                                        value
                                      );
                                  }}
                                  onBlur={() => {
                                    /** Validate input (especially useful if user forgot input at form above)
                                     * Need to be debounced as it may happen that state is not updated right away
                                     */
                                    debouncedGetNextQuestionKey(
                                      questionKey,
                                      formKey
                                    );
                                  }}
                                />
                              )}
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
                        ) : questionElements[questionKey].form[formKey].type ===
                          "submit-button" ? (
                          <div className="flex justify-between">
                            <div className="flex">
                              {Object.keys(questionElements ?? {}).filter(k => questionElements[k]?.defaultVisible === true)[0] !== questionKey && (
                                <button
                                  onClick={() => {
                                    getNextQuestionKey(
                                      questionKey,
                                      formKey,
                                      "previous"
                                    );
                                  }}
                                  className="px-3 py-1 rounded-md bg-synergy-light-blue text-white "
                                >
                                  Vorherige
                                </button>
                              )}
                            </div>
                            <p
                              className={`text-sm mt-2 min-h-[1.57rem] ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : questionElements[questionKey].form[formKey].message.type === "loading" ? "text-blue-600 dark:text-blue-500" : "text-green-600 dark:text-green-500"} `}
                            >
                              {
                                questionElements[questionKey].form[formKey]
                                  .message.text
                              }
                            </p>
                            <button
                              onClick={() => {
                                submitFunnel &&
                                  submitFunnel(
                                    questionKey,
                                    formKey,
                                    questionElements,
                                    setQuestionElements,
                                    getNextQuestionKey
                                  );
                              }}
                              className="px-3 py-1 inline-flex items-center rounded-md bg-synergy-light-blue text-white"
                              disabled={
                                questionElements[questionKey].form[formKey]
                                  .message.type !== "info" &&
                                questionElements[questionKey].form[formKey]
                                  .message.type !== "warning"
                              }
                            >
                              <>
                                <Confetti
                                  active={
                                    questionElements[questionKey].form[formKey]
                                      .message.type === "success"
                                  }
                                  config={confettiConfig}
                                />
                                {questionElements[questionKey].form[formKey]
                                  .message.type === "loading" && (
                                    <svg
                                      aria-hidden="true"
                                      role="status"
                                      className="inline w-4 h-4 me-3 text-white animate-spin"
                                      viewBox="0 0 100 101"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="#E5E7EB"
                                      />
                                      <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  )}
                                {
                                  questionElements[questionKey].form[formKey]
                                    .options.button.text
                                }
                              </>
                            </button>
                          </div>
                        ) : questionElements[questionKey].form[formKey].type ===
                          "calculation" ? (
                          <>
                            <div className="flex justify-center items-center gap-1 text-lg">
                              <div
                                className={`flex font-semibold justify-center ${questionElements[questionKey].form[formKey].options.maths.spaceBetween && "gap-1"}`}
                              >
                                <span className="text-synergy-dark-grey dark:text-gray-400">
                                  {Number(
                                    questionElements[questionKey].form[formKey]
                                      .selected.inputValue
                                  ).toLocaleString()}
                                </span>
                                <span
                                  className={`text-synergy-dark-grey dark:text-gray-400 flex justify-end ${questionElements[questionKey].form[formKey].options.maths.position === "before" && "order-first"}`}
                                >
                                  {
                                    questionElements[questionKey].form[formKey]
                                      .options.maths.unit
                                  }
                                </span>
                              </div>
                              <div className="flex gap-1 items-center">
                                <span className="">
                                  {
                                    questionElements[questionKey].form[formKey]
                                      .options.afterMaths.before
                                  }
                                </span>
                                <div className="font-semibold">
                                  {renderAfterMathsCalculation(
                                    questionElements[questionKey].form[formKey]
                                      .options.inputForm.questionKey,
                                    questionElements[questionKey].form[formKey]
                                      .options.inputForm.formKey
                                  )}
                                </div>
                                <span className="">
                                  {
                                    questionElements[questionKey].form[formKey]
                                      .options.afterMaths.after
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <p
                                className={`text-sm mt-2 min-h-[1.57rem] ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
                              >
                                {
                                  questionElements[questionKey].form[formKey]
                                    .message.text
                                }
                              </p>
                            </div>
                          </>
                        ) : questionElements[questionKey].form[formKey].type ===
                          "file-upload" ? (
                          <FileUpload
                            questionKey={questionKey}
                            formKey={formKey}
                            questionElements={questionElements}
                            setQuestionElements={setQuestionElements}
                            STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
                          />
                        ) : questionElements[questionKey].form[formKey].type ===
                          "llm-file-extraction" ? (
                          <LlmFileExtraction
                            questionKey={questionKey}
                            formKey={formKey}
                            questionElements={questionElements}
                            setQuestionElements={setQuestionElements}
                            STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
                          />
                        ) : (
                          questionElements[questionKey].form[formKey].type ===
                          "calendly" && (
                            <Calendly
                              questionKey={questionKey}
                              formKey={formKey}
                              questionElements={questionElements}
                              setQuestionElements={setQuestionElements}
                              debouncedCountFormsAndSet={
                                debouncedCountFormsAndSet
                              }
                            />
                          )
                        )}
                        {questionElements[questionKey].form[formKey].type !==
                          "submit-button" &&
                          index ==
                          Object.entries(
                            questionElements[questionKey].form
                          ).filter(
                            ([_, form]) =>
                              (form as { defaultVisible: boolean })
                                .defaultVisible === true
                          ).length -
                          1 && (
                            <div className="flex justify-between">
                              <div className="flex">
                                {Object.keys(questionElements ?? {}).filter(k => questionElements[k]?.defaultVisible === true)[0] !== questionKey && (
                                  <button
                                    onClick={() => {
                                      getNextQuestionKey(
                                        questionKey,
                                        formKey,
                                        "previous"
                                      );
                                    }}
                                    className="px-3 py-1 rounded-md bg-synergy-light-blue text-white "
                                  >
                                    Vorherige
                                  </button>
                                )}
                              </div>
                              <div className="flex">
                                <button
                                  onClick={() => {
                                    getNextQuestionKey(
                                      questionKey,
                                      formKey,
                                      "next"
                                    );
                                  }}
                                  className="px-3 py-1 rounded-md bg-synergy-light-blue text-white "
                                >
                                  {isQuestionSkippable(questionKey) ? "Überspringen" : "Weiter"}
                                </button>
                              </div>
                            </div>
                          )}
                      </section>
                    ))}
                </div>
              </section>
            )
          )}
        </div>

        <Dialog
          open={verifying}
          onClose={() => setVerifying && setVerifying(false)}
          className="relative z-50"
        >
          {/* The backdrop, rendered as a fixed sibling to the panel container */}
          <DialogBackdrop className="fixed inset-0 bg-black/30" />

          {/* Full-screen container to center the panel */}
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            {/* The actual dialog panel  */}
            <DialogPanel className="max-w-lg space-y-4 bg-white p-12 rounded-2xl border border-synergy-dark-grey shadow-lg">
              <DialogTitle className="font-bold">
                E-Mail verifikation
              </DialogTitle>
              <Description>
                Geben Sie den Code ein, den Sie per E-Mail erhalten haben, um
                zum Dashboard zu gelangen.
              </Description>
              <p>
                Mit dem Dashboard können Sie weitere Projekte eintragen, Ihre
                Formulare verwalten und Ihre Einstellungen anpassen.
              </p>
              <form className="max-w-sm mx-auto">
                <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
                  {[...Array(6)].map((_, index) => (
                    <div key={index}>
                      <label htmlFor={`code-${index + 1}`} className="sr-only">
                        Code {index + 1}
                      </label>
                      <input
                        ref={(el) => {
                          codeInputsRef.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        id={`code-${index + 1}`}
                        className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        required
                        onKeyUp={(e) => handleKeyUpCode(index, e)}
                        onPaste={handlePasteCode}
                      />
                    </div>
                  ))}
                </div>
                <p
                  id="helper-text-explanation"
                  className="mt-2 text-sm text-gray-500 dark:text-gray-400"
                >
                  Please introduce the 6-digit code we sent via email.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationButtonClicked(true);
                    setTimeout(() => {
                      setVerificationButtonClicked(false);
                    }, 5000);
                    handleVerification &&
                      handleVerification(getVerificationCode());
                  }}
                  className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                  disabled={verificationButtonClicked}
                >
                  Verify
                  {verificationButtonClicked && (
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </button>
              </form>
              {/* <div className="flex gap-4">
              <button onClick={() => setVerifying(false)}>Cancel</button>
              <button onClick={() => setVerifying(false)}>Deactivate</button>
            </div> */}
            </DialogPanel>
          </div>
        </Dialog>
      </div>
    </>
  );
};

export default DefaultFunnel;
