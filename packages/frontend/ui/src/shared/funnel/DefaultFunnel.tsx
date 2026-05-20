"use client";

import { useMessages, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useRef } from "react";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import Link from "next/link";
import { aside, label, p, q } from "framer-motion/client";
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
import {
  BadgeCheck,
  BatteryCharging,
  Building2,
  Cable,
  Car,
  CircleHelp,
  Fence,
  Gauge,
  Heater,
  House,
  HousePlug,
  LandPlot,
  Layers,
  PanelTop,
  PanelTopOpen,
  Plug,
  PlugZap,
  Snowflake,
  Sun,
  Warehouse,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FunnelPrefillEntry = {
  value: unknown;
  confidence?: number;
  sourceQuote?: string | null;
  sourcePage?: number | null;
  fieldKey?: string;
  documentName?: string;
  fileUid?: string;
  label?: string;
};

type FunnelPrefillResult = {
  applied: string[];
  skipped: Array<{
    formUid: string;
    label?: string;
    reason: string;
    value: unknown;
  }>;
};

type QuestionTransitionDirection = "next" | "previous";
type QuestionTransitionState = {
  phase: "idle" | "rotating";
  direction: QuestionTransitionDirection;
  currentQuestionKey?: string;
  targetQuestionKey?: string;
};

const QUESTION_TRANSITION_ROTATE_MS = 560;

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
        formKey: string,
      ) => { status: string },
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

  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const funnelQuestionViewportRef = useRef<HTMLDivElement | null>(null);
  const questionTransitionTimersRef = useRef<ReturnType<typeof setTimeout>[]>(
    [],
  );
  const [questionTransition, setQuestionTransition] =
    useState<QuestionTransitionState>({
      phase: "idle",
      direction: "next",
    });
  const [questionTransitionHeight, setQuestionTransitionHeight] = useState<
    number | null
  >(null);

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
            false,
          );
          return acc;
        },
        {},
      );
      setReferencingFirstQuestionElementKey(
        Object.keys(questionElementsRawReduce)[0] || null,
      );

      return questionElementsRawReduce;
    },
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
    colors: ["#0CC0DF", "#333333", "#EFEFEF"],
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
    colors: ["#0CC0DF", "#333333", "#EFEFEF"],
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
            false,
          );
          return acc;
        },
        {},
      );

      setReferencingFirstQuestionElementKey(
        Object.keys(questionElementsRawReduce)[0] || null,
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
      referencingFirstQuestionElementKey,
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
    referencingFirstQuestionElementKey,
  );

  const countQuestions = (): {
    totalQuestions: number;
    completedQuestions: number;
  } => {
    const visibleQuestionKeys = Object.keys(questionElements ?? {}).filter(
      (questionKey) => isVisibleEntity(questionElements[questionKey]),
    );

    return {
      totalQuestions: visibleQuestionKeys.length,
      completedQuestions: visibleQuestionKeys.filter((questionKey) =>
        isQuestionComplete(questionElements[questionKey]),
      ).length,
    };
  };

  const [questionCounts, setQuestionCounts] = useState(() => countQuestions());

  const countQuestionsAndSet = () => {
    setQuestionCounts(countQuestions());
  };

  const debouncedCountQuestionsAndSet = debounce(countQuestionsAndSet, 100);

  /** Used for initial client render and is needed as countQuestions
   * does not recognize a newly created question when evoked
   * from the button click or on new question creation
   */
  useEffect(() => {
    debouncedCountQuestionsAndSet();
  }, [Object.keys(questionElements ?? {}).length]);

  const clearQuestionTransitionTimers = useCallback(() => {
    questionTransitionTimersRef.current.forEach((timer) => clearTimeout(timer));
    questionTransitionTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearQuestionTransitionTimers();
  }, [clearQuestionTransitionTimers]);

  const prefersReducedMotion = useCallback((): boolean => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return true;
    }

    return false;
  }, []);

  const getScrollBehavior = useCallback((): ScrollBehavior => {
    if (prefersReducedMotion()) {
      return "auto";
    }

    return "smooth";
  }, [prefersReducedMotion]);

  const scrollToFunnelQuestionTop = useCallback(
    (behavior?: ScrollBehavior) => {
      if (typeof window === "undefined") return;

      window.requestAnimationFrame(() => {
        funnelQuestionViewportRef.current?.scrollIntoView({
          behavior: behavior ?? getScrollBehavior(),
          block: "start",
        });
      });
    },
    [getScrollBehavior],
  );

  const scrollToFunnelElement = useCallback(
    (elementId: string) => {
      if (typeof window === "undefined") return;

      window.requestAnimationFrame(() => {
        document.getElementById(elementId)?.scrollIntoView({
          behavior: getScrollBehavior(),
          block: "start",
        });
      });
    },
    [getScrollBehavior],
  );

  const setWindowQuestionId = useCallback((questionKey: string) => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    url.searchParams.set("currentQuestionId", questionKey);
    url.hash = "";
    window.history.replaceState({}, "", url.toString());
  }, []);

  const transitionToQuestion = useCallback(
    (
      targetQuestionKey: string | undefined,
      direction: QuestionTransitionDirection,
      currentQuestionKey?: string,
    ) => {
      if (!targetQuestionKey) return;

      if (questionPresentation !== "window") {
        scrollToFunnelElement(targetQuestionKey);
        return;
      }

      const activeQuestionKey =
        currentQuestionKey ??
        (typeof window !== "undefined"
          ? (new URL(window.location.href).searchParams.get(
              "currentQuestionId",
            ) ?? undefined)
          : undefined);

      if (activeQuestionKey === targetQuestionKey) {
        scrollToFunnelQuestionTop();
        return;
      }

      if (prefersReducedMotion()) {
        clearQuestionTransitionTimers();
        setQuestionTransitionHeight(null);
        setWindowQuestionId(targetQuestionKey);
        setQuestionTransition({
          phase: "idle",
          direction,
        });
        scrollToFunnelQuestionTop();
        return;
      }

      clearQuestionTransitionTimers();
      setQuestionTransitionHeight(
        funnelQuestionViewportRef.current?.getBoundingClientRect().height ??
          null,
      );
      setQuestionTransition({
        phase: "rotating",
        direction,
        currentQuestionKey: activeQuestionKey,
        targetQuestionKey,
      });
      scrollToFunnelQuestionTop("auto");

      const rotateTimer = setTimeout(() => {
        setWindowQuestionId(targetQuestionKey);
        setQuestionTransition({
          phase: "idle",
          direction,
        });
        setQuestionTransitionHeight(null);
      }, QUESTION_TRANSITION_ROTATE_MS);

      questionTransitionTimersRef.current.push(rotateTimer);
    },
    [
      clearQuestionTransitionTimers,
      questionPresentation,
      prefersReducedMotion,
      scrollToFunnelElement,
      scrollToFunnelQuestionTop,
      setWindowQuestionId,
    ],
  );

  const getNextQuestionKey = (
    currentQuestionKey: string,
    formKey: string,
    redirect: "next" | "previous" | "none" = "none",
  ): { status: string } => {
    const questionKeys = Object.keys(questionElements);
    const currentQuestion = questionElements[currentQuestionKey];
    const currentQuestionIndex = questionKeys.indexOf(currentQuestionKey);
    const formKeys = Object.keys(currentQuestion.form);
    const currentFormIndex = formKeys.indexOf(formKey);
    const visibleQuestionKeys = getNavigationQuestionKeys(
      questionElements,
      currentQuestionKey,
    );
    const currentVisibleQuestionIndex =
      visibleQuestionKeys.indexOf(currentQuestionKey);
    const visibleFormKeys = getNavigationFormKeys(
      questionElements,
      currentQuestionKey,
      formKey,
    );
    const currentVisibleFormIndex = visibleFormKeys.indexOf(formKey);
    const extractionReviewFlowActive =
      isExtractionReviewFlowActive(questionElements);

    let error = false;
    visibleQuestionKeys.forEach(
      (questionKey: string, questionIndex: number) => {
        getNavigationFormKeys(
          questionElements,
          questionKey,
          questionKey === currentQuestionKey ? formKey : undefined,
        ).forEach((formKey: string, formIndex: number) => {
          console.log(questionKey, formKey);
          console.log(
            "check",
            questionKey,
            formKey,
            isVisibleEntity(questionElements[questionKey]) &&
              (questionIndex < currentQuestionIndex ||
                (questionIndex == currentQuestionIndex &&
                  formIndex <= currentFormIndex) ||
                (!extractionReviewFlowActive &&
                  (questionElements[questionKey].form[formKey].message.type ===
                    "success" ||
                    questionElements[questionKey].form[formKey].message.type ===
                      "error" ||
                    questionElements[questionKey].form[formKey].message.type ===
                      "warning"))),
            // questionElements[questionKey].form[formKey].message
          );
          if (
            /** Continue if the current question is visible to the user and form index is less or equal than the question
             * and form index that the button got pressed on or the form was got a success message
             */
            isVisibleEntity(questionElements[questionKey]) &&
            isVisibleEntity(questionElements[questionKey].form[formKey]) &&
            (questionIndex < currentVisibleQuestionIndex ||
              (questionIndex == currentVisibleQuestionIndex &&
                formIndex <= currentVisibleFormIndex) ||
              (!extractionReviewFlowActive &&
                (questionElements[questionKey].form[formKey].message.type ===
                  "success" ||
                  questionElements[questionKey].form[formKey].message.type ===
                    "error" ||
                  questionElements[questionKey].form[formKey].message.type ===
                    "warning")))
          ) {
            if (
              /** Test the form for incorrect input only if the form is a required
               * input, otherwise we have no business validating it.
               */
              isRequiredForm(questionElements[questionKey].form[formKey]) &&
              (((questionElements[questionKey].form[formKey].type ===
                "checkbox" ||
                questionElements[questionKey].form[formKey].type === "radio" ||
                questionElements[questionKey].form[formKey].type ===
                  "select") &&
                questionElements[questionKey].form[formKey].selected
                  .selectedOptions.length == 0) ||
                (questionElements[questionKey].form[formKey].type === "range" &&
                  Number(
                    questionElements[questionKey].form[formKey].selected
                      .selectedValue,
                  ) <
                    questionElements[questionKey].form[formKey].options.range
                      .min) ||
                ((questionElements[questionKey].form[formKey].type === "text" ||
                  questionElements[questionKey].form[formKey].type ===
                    "email" ||
                  questionElements[questionKey].form[formKey].type === "tel" ||
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
                "correct input at form button got pressed, however, previous forms are not correct",
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
                if (redirect === "next") {
                  markExtractionReviewed(
                    updatedElements[questionKey].form[formKey],
                  );
                }
                return updatedElements;
              });
            }
          }
        });
      },
    );

    debouncedCountQuestionsAndSet();

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
        if (redirect === "next") {
          markExtractionReviewed(
            updatedElements[currentQuestionKey].form[formKey],
          );
        }
        return updatedElements;
      });
      console.log("Push to next question2", visibleQuestionKeys);
      if (redirect === "next")
        scrollToFunnelElement(visibleFormKeys[currentVisibleFormIndex + 1]);
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
            questionElements[currentQuestionKey].form[formKey].message,
          );
          updatedElements[currentQuestionKey].form[formKey].message.text =
            questionElements[currentQuestionKey].form[
              formKey
            ].message.successMessage;
          updatedElements[currentQuestionKey].form[formKey].message.type =
            "success";
          if (redirect === "next") {
            markExtractionReviewed(
              updatedElements[currentQuestionKey].form[formKey],
            );
          }
          return updatedElements;
        });

        console.log("Push to next question1", visibleQuestionKeys);

        if (redirect === "next") scrollToFunnelElement(formKey);
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
      if (redirect === "next") {
        markExtractionReviewed(
          updatedElements[currentQuestionKey].form[formKey],
        );
      }
      return updatedElements;
    });
    console.log("Push to next question", visibleQuestionKeys);
    if (redirect === "next") {
      transitionToQuestion(
        visibleQuestionKeys[currentVisibleQuestionIndex + 1],
        "next",
        currentQuestionKey,
      );
    } else if (redirect === "previous") {
      transitionToQuestion(
        visibleQuestionKeys[
          currentVisibleQuestionIndex - 1 >= 0
            ? currentVisibleQuestionIndex - 1
            : 0
        ],
        "previous",
        currentQuestionKey,
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
    question: any,
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
        useUidAsKey,
      ),
      questionKeyUid,
    );
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      const fromQuestionIndex = Object.keys(updatedElements).indexOf(
        from.fromQuestionKey,
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
          useUidAsKey,
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
    form: any,
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
        true,
      ),
      formKeyUid,
    );
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      const fromFormIndex = Object.keys(
        updatedElements[from.fromQuestionKey].form,
      ).indexOf(from.fromFormKey);
      const newFormElements = Object.entries(
        updatedElements[from.fromQuestionKey].form,
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
          true,
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
    fromOptionKey: string,
  ) => {
    console.log(
      "initiate removeFormElement",
      fromQuestionKey,
      fromOptionKey,
      questionElements[fromQuestionKey],
    );
    setQuestionElements((prev) => {
      const updatedElements = { ...prev };
      Object.keys(updatedElements[fromQuestionKey].form).forEach((key) => {
        if (
          updatedElements[fromQuestionKey].form[key].from.includes(
            fromOptionKey,
          )
        ) {
          console.log(
            "key is included",
            updatedElements[fromQuestionKey].form[key].from,
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
    Object.keys(questionElements ?? {}).length,
  );

  const handleKeyUpCode = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
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
          form.type,
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
              .numberFormat,
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

  const applyFunnelPrefill = useCallback(
    (
      prefill: Record<string, FunnelPrefillEntry>,
      context: {
        documentName: string;
        fileUid: string;
        force?: boolean;
        userReviewed?: boolean;
      },
    ): FunnelPrefillResult => {
      const thresholds = getExtractionThresholds(questionElements);
      const preview = cloneQuestionElements(questionElements);
      const { result } = applyPrefillToQuestionElements({
        elements: preview,
        prefill,
        context,
        thresholds,
      });

      setQuestionElements((prev) => {
        const { elements } = applyPrefillToQuestionElements({
          elements: { ...prev },
          prefill,
          context,
          thresholds,
        });
        return elements;
      });

      debouncedCountQuestionsAndSet();
      return result;
    },
    [debouncedCountQuestionsAndSet, questionElements],
  );

  const removeFunnelPrefill = useCallback(
    (
      formUid: string,
      context: { documentName: string; fileUid: string; force?: boolean },
    ): void => {
      setQuestionElements((prev) => {
        const elements = cloneQuestionElements(prev);
        const resolved = findFormByUid(elements, formUid);

        if (!resolved || resolved.form.extraction?.source !== "llm") {
          return elements;
        }

        if (
          !context.force &&
          context.fileUid &&
          resolved.form.extraction.fileUid &&
          resolved.form.extraction.fileUid !== context.fileUid
        ) {
          return elements;
        }

        clearFormValue(resolved.form);
        delete resolved.form.extraction;
        resolved.form.message.text = "";
        resolved.form.message.type = "info";
        recalculateDependentForms(
          elements,
          resolved.question.uid,
          resolved.form.uid,
          resolved.form,
        );

        return elements;
      });

      debouncedCountQuestionsAndSet();
    },
    [debouncedCountQuestionsAndSet],
  );

  const isQuestionSkippable = (questionKey: string): boolean => {
    const visibleForms = Object.entries(
      questionElements[questionKey]?.form ?? {},
    ).filter(
      ([_, form]: [string, any]) =>
        form.defaultVisible === true && form.type !== "submit-button",
    );

    const hasRequired = visibleForms.some(
      ([_, form]: [string, any]) => form.required === true,
    );
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
    formUid: string,
  ): JSX.Element => {
    const question = Object.values(questionElements).find(
      ({ uid }: { uid: string }) => questionUid === uid,
    );
    const form: any = Object.values(question.form).find(
      (form: any) => form.uid === formUid,
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
    const visibleQuestionKeys = Object.keys(questionElements ?? {}).filter(
      (questionKey: any) => isVisibleEntity(questionElements[questionKey]),
    );
    let filteredQuestionKeys =
      getRenderableQuestionKeys(questionElements) ?? visibleQuestionKeys;

    if (questionPresentation === "window" && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const currentQuestionId = url.searchParams.get("currentQuestionId");
      if (questionTransition.phase === "rotating") {
        const transitionQuestionKeys = [
          questionTransition.currentQuestionKey ?? currentQuestionId,
          questionTransition.targetQuestionKey,
        ].filter(
          (questionKey, index, questionKeys): questionKey is string =>
            Boolean(questionKey) &&
            visibleQuestionKeys.includes(questionKey as string) &&
            questionKeys.indexOf(questionKey) === index,
        );

        if (transitionQuestionKeys.length > 0) {
          return transitionQuestionKeys;
        }
      }
      console.log("currentQuestionId", currentQuestionId, filteredQuestionKeys);
      if (
        currentQuestionId &&
        visibleQuestionKeys.includes(currentQuestionId)
      ) {
        const keepCurrentQuestion =
          !isExtractionReviewFlowActive(questionElements) ||
          questionHasVisibleNonAiAcceptedForm(
            questionElements[currentQuestionId],
          ) ||
          questionHasLlmFileExtraction(questionElements[currentQuestionId]);

        if (keepCurrentQuestion) {
          filteredQuestionKeys = [currentQuestionId];
        } else if (filteredQuestionKeys[0]) {
          url.searchParams.set("currentQuestionId", filteredQuestionKeys[0]);
          window.history.replaceState({}, "", url.toString());
        }
      }
    }
    return filteredQuestionKeys;
  };

  const renderedQuestionKeys = questionElementsToBeRendered();
  const isQuestionTransitionActive = questionTransition.phase === "rotating";
  const overviewQuestionKeys = Object.keys(questionElements ?? {}).filter(
    (questionKey) => isVisibleEntity(questionElements[questionKey]),
  );
  const currentWindowQuestionKey =
    typeof window !== "undefined"
      ? (new URL(window.location.href).searchParams.get("currentQuestionId") ??
        undefined)
      : undefined;
  const activeOverviewQuestionKey =
    questionTransition.phase === "rotating"
      ? (questionTransition.targetQuestionKey ?? currentWindowQuestionKey)
      : currentWindowQuestionKey;
  const activeOverviewQuestionIndex = Math.max(
    overviewQuestionKeys.indexOf(activeOverviewQuestionKey ?? ""),
    0,
  );
  const getQuestionTransitionClassName = (questionKey: string): string => {
    if (!isQuestionTransitionActive) {
      return "funnel-question-idle";
    }

    if (questionKey === questionTransition.targetQuestionKey) {
      return `funnel-question-entering-${questionTransition.direction}`;
    }

    return `funnel-question-exiting-${questionTransition.direction}`;
  };
  const questionProgressPercentage =
    questionCounts.totalQuestions === 0
      ? 0
      : Math.round(
          (questionCounts.completedQuestions / questionCounts.totalQuestions) *
            100,
        );
  const questionTrackFillPercentage =
    questionCounts.totalQuestions <= 1
      ? questionCounts.completedQuestions > 0
        ? 100
        : 0
      : Math.min(
          100,
          (questionCounts.completedQuestions /
            (questionCounts.totalQuestions - 1)) *
            100,
        );

  return (
    <>
      {topBar && topBar(questionElements)}
      <div className="relative flex flex-col justify-center max-w-3xl mx-auto">
        <FunnelQuestionTransitionStyles />
        <div
          className={`funnel-progress-container ${progressContainerClassNames}`}
        >
          {progressContainerBackground && (
            <div className="absolute inset-0 bg-white -top-80"></div>
          )}
          <div className="relative flex justify-between mb-1">
            <span className="text-base font-medium text-synergy-light-blue dark:text-white">
              {t("progress.labels.topLeft")}
            </span>
            <span className="text-sm font-medium text-synergy-light-blue dark:text-white">
              <Confetti
                active={
                  questionCounts.totalQuestions > 0 &&
                  questionCounts.completedQuestions ===
                    questionCounts.totalQuestions
                }
                config={confettiConfigLow}
              />
              {questionCounts.completedQuestions}{" "}
              {t(`progress.labels.topRightDeliminator`)}{" "}
              {questionCounts.totalQuestions}{" "}
              {t(`progress.labels.topRightPostfix`)}{" "}
              {questionProgressPercentage}%
            </span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-synergy-light-blue h-2.5 rounded-full"
              style={{
                width: `${questionTrackFillPercentage}%`,
              }}
            ></div>
            {overviewQuestionKeys.length > 0 && (
              <div
                className="funnel-progress-map"
                aria-label="Funnel question overview"
                role="list"
              >
                {overviewQuestionKeys.map((questionKey, index) => {
                  const question = questionElements[questionKey];
                  const markerPosition =
                    overviewQuestionKeys.length === 1
                      ? 50
                      : (index / (overviewQuestionKeys.length - 1)) * 100;
                  const isCurrent =
                    questionKey === activeOverviewQuestionKey ||
                    (!activeOverviewQuestionKey &&
                      index === activeOverviewQuestionIndex);
                  const isComplete = isQuestionComplete(question);
                  const markerStateClassName = isCurrent
                    ? "funnel-progress-marker-current"
                    : isComplete
                      ? "funnel-progress-marker-complete"
                      : "funnel-progress-marker-upcoming";
                  const tooltipAlignmentClassName =
                    index === 0
                      ? "funnel-progress-tooltip-start"
                      : index === overviewQuestionKeys.length - 1
                        ? "funnel-progress-tooltip-end"
                        : "funnel-progress-tooltip-center";

                  return (
                    <span
                      key={questionKey}
                      className="funnel-progress-marker"
                      style={{ left: `${markerPosition}%` }}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${index + 1}/${overviewQuestionKeys.length}: ${question?.title ?? ""}`}
                    >
                      <span
                        className={`funnel-progress-marker-dot ${markerStateClassName}`}
                      ></span>
                      <span
                        className={`funnel-progress-tooltip ${tooltipAlignmentClassName}`}
                      >
                        <span className="funnel-progress-tooltip-index">
                          {index + 1}/{overviewQuestionKeys.length}
                        </span>
                        <span className="funnel-progress-tooltip-title">
                          {question?.title}
                        </span>
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div
          ref={funnelQuestionViewportRef}
          className={`scroll-mt-40 funnel-question-stage ${
            isQuestionTransitionActive ? "funnel-question-stage-rotating" : ""
          } ${props.ui?.sectionContainerClassNames ?? ""}`}
          style={
            isQuestionTransitionActive && questionTransitionHeight !== null
              ? { height: `${questionTransitionHeight}px` }
              : undefined
          }
        >
          {renderedQuestionKeys.map((questionKey: any, index: any) => (
            <section
              id={questionKey}
              key={questionKey}
              className={`scroll-mt-40 funnel-question-transition ${getQuestionTransitionClassName(questionKey)}`}
            >
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
                  .filter((formKey: any) =>
                    shouldRenderFunnelForm(
                      questionElements,
                      questionKey,
                      formKey,
                    ),
                  )
                  .map((formKey: any, index: any) => (
                    <section
                      key={formKey}
                      id={formKey}
                      className={`w-full scroll-mt-40 col-span-${
                        questionElements[questionKey].form[formKey].span
                      }`}
                    >
                      {/** Title and description of form */}
                      <div className="text-center mt-5 mb-5">
                        <div className="text-lg font-medium text-gray-900 dark:text-white flex items-center justify-center gap-2">
                          {questionElements[questionKey].form[formKey].title}
                          {renderExtractionHint(
                            questionElements[questionKey].form[formKey],
                          )}
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
                                .options,
                            ).map((optionKey: any, index: any) => (
                              <li
                                key={optionKey}
                                className={`col-span-${questionElements[questionKey].form[formKey].options[optionKey].span}`}
                              >
                                <input
                                  type={
                                    questionElements[questionKey].form[formKey]
                                      .type === "checkbox"
                                      ? "checkbox"
                                      : "radio"
                                  }
                                  disabled={
                                    questionElements[questionKey].form[formKey]
                                      .options[optionKey].disabled
                                  }
                                  name={formKey}
                                  id={optionKey}
                                  checked={
                                    questionElements[questionKey].form[
                                      formKey
                                    ].selected.selectedOptionsUid.includes(
                                      optionKey,
                                    ) ||
                                    questionElements[questionKey].form[
                                      formKey
                                    ].selected.selectedOptions.includes(
                                      questionElements[questionKey].form[
                                        formKey
                                      ].options[optionKey].title,
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
                                              optionUid,
                                            );
                                            removeQuestionElement(optionUid);
                                          },
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
                                                  .form,
                                              ).find(
                                                (form: any) =>
                                                  form.uid ===
                                                  questionElements[questionKey]
                                                    .form[formKey].options[
                                                    optionKey
                                                  ].addForm,
                                              )
                                            : questionElementsRaw[
                                                questionElements[questionKey]
                                                  .uid
                                              ].form[
                                                questionElements[questionKey]
                                                  .form[formKey].options[
                                                  optionKey
                                                ].addForm
                                              ],
                                        );
                                      }
                                      if (
                                        questionElements[questionKey].form[
                                          formKey
                                        ].options[optionKey].addQuestion !== ""
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
                                                questionElements,
                                              ).find(
                                                (questionElement: any) =>
                                                  questionElement.uid ===
                                                  questionElements[questionKey]
                                                    .form[formKey].options[
                                                    optionKey
                                                  ].addQuestion,
                                              )
                                            : questionElementsRaw[
                                                questionElements[questionKey]
                                                  .form[formKey].options[
                                                  optionKey
                                                ].addQuestion
                                              ],
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
                                            questionElements[questionKey].form[
                                              formKey
                                            ].options[optionKey].title,
                                          ];
                                          form.selected.selectedOptionsUid = [
                                            ...form.selected.selectedOptionsUid,
                                            optionKey,
                                          ];
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
                                              questionElements[questionKey]
                                                .form[formKey].options[
                                                optionKey
                                              ].title,
                                          );
                                        form.selected.selectedOptionsUid =
                                          form.selected.selectedOptionsUid.filter(
                                            (option: string) =>
                                              option !== optionKey,
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
                                      formKey,
                                    );

                                    /** Update Progress count */
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
                                    {renderFunnelOptionIcon(
                                      questionElements[questionKey].form[
                                        formKey
                                      ].options[optionKey],
                                    )}
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
                                  ? questionElements[questionKey].form[formKey]
                                      .selected.selectedOptions
                                  : questionElements[questionKey].form[formKey]
                                      .selected.selectedOptions[0]
                              }
                              multiple={
                                questionElements[questionKey].form[formKey]
                                  .multiple
                              }
                              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-synergy-light-blue dark:focus:ring-synergy-light-blue"
                              onChange={(e) => {
                                const { selectedOptions } = e.target;
                                const selectedOptionValues = Array.from(
                                  selectedOptions,
                                ).map((option) => option.value);
                                console.log("onchange select", selectedOptions);

                                const selectedOptionKeys =
                                  selectedOptionValues.map((value) => {
                                    return (
                                      Object.keys(
                                        questionElements[questionKey].form[
                                          formKey
                                        ].options,
                                      ).find(
                                        (key) =>
                                          questionElements[questionKey].form[
                                            formKey
                                          ].options[key].title === value,
                                      ) || ""
                                    );
                                  });
                                console.log(
                                  "selectegOptionKeys",
                                  selectedOptionKeys,
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
                                      console.log("about to clean ", optionUid);
                                      /** Only remove form or question if the option is not selected any more */
                                      if (
                                        !selectedOptionKeys.includes(optionUid)
                                      ) {
                                        console.log(
                                          "in cleaning stage ",
                                          optionUid,
                                          questionKey,
                                        );
                                        removeFormElement(
                                          questionKey,
                                          optionUid,
                                        );
                                        removeQuestionElement(optionUid);
                                      }
                                    },
                                  );
                                }

                                selectedOptionKeys.forEach(
                                  (optionKey: string) => {
                                    if (
                                      !questionElements[questionKey].form[
                                        formKey
                                      ].selected.selectedOptionsUid.includes(
                                        optionKey,
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
                                                  .form,
                                              ).find(
                                                (form: any) =>
                                                  form.uid ===
                                                  questionElements[questionKey]
                                                    .form[formKey].options[
                                                    optionKey
                                                  ].addForm,
                                              )
                                            : questionElementsRaw[
                                                questionElements[questionKey]
                                                  .uid
                                              ].form[
                                                questionElements[questionKey]
                                                  .form[formKey].options[
                                                  optionKey
                                                ].addForm
                                              ],
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
                                        ].options[optionKey].addQuestion !== ""
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
                                            questionElements[questionKey].form[
                                              formKey
                                            ].options[optionKey].addQuestion
                                          ],
                                        );
                                      }
                                    }
                                  },
                                );

                                setQuestionElements((prev) => {
                                  const updatedElements = { ...prev };
                                  const form =
                                    updatedElements[questionKey].form[formKey];
                                  form.selected.selectedOptions =
                                    selectedOptionKeys.map(
                                      (optionKey: any) =>
                                        updatedElements[questionKey].form[
                                          formKey
                                        ].options[optionKey].title,
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
                                        ].options[optionKey].title,
                                    )
                                    .toString(),
                                );

                                /** Validate input (especially useful if user forgot input at form above)
                                 * Need to be debounced as it may happen that state is not updated right away
                                 */
                                debouncedGetNextQuestionKey(
                                  questionKey,
                                  formKey,
                                );

                                /** Update Progress count */
                                debouncedCountQuestionsAndSet();
                              }}
                            >
                              {Object.keys(
                                questionElements[questionKey].form[formKey]
                                  .options,
                              ).map((optionKey: any, index: any) => (
                                <option
                                  key={optionKey}
                                  value={
                                    questionElements[questionKey].form[formKey]
                                      .options[optionKey].title
                                  }
                                >
                                  {
                                    questionElements[questionKey].form[formKey]
                                      .options[optionKey].title
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
                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-synergy-light-blue dark:focus:ring-synergy-light-blue"
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
                                      value,
                                    );
                                }}
                                onBlur={() => {
                                  /** Validate input (especially useful if user forgot input at form above)
                                   * Need to be debounced as it may happen that state is not updated right away
                                   */
                                  debouncedGetNextQuestionKey(
                                    questionKey,
                                    formKey,
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
                                className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm ${questionElements[questionKey].form[formKey].message.type === "success" ? "border-green-500 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500 dark:border-green-500 dark:bg-gray-700 dark:text-green-400 dark:placeholder-green-500" : "border-gray-300 text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-synergy-light-blue dark:focus:ring-synergy-light-blue"} `}
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
                                      value,
                                    );
                                }}
                                onBlur={() => {
                                  /** Validate input (especially useful if user forgot input at form above)
                                   * Need to be debounced as it may happen that state is not updated right away
                                   */
                                  debouncedGetNextQuestionKey(
                                    questionKey,
                                    formKey,
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
                            {getNavigationQuestionKeys(
                              questionElements,
                              questionKey,
                            )[0] !== questionKey && (
                              <button
                                onClick={() => {
                                  getNextQuestionKey(
                                    questionKey,
                                    formKey,
                                    "previous",
                                  );
                                }}
                                className="rounded-md bg-synergy-light-blue px-3 py-1 text-white transition-colors hover:bg-synergy-light-blue/90 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2"
                              >
                                Vorherige
                              </button>
                            )}
                          </div>
                          <p
                            className={`mt-2 min-h-[1.57rem] text-sm ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : questionElements[questionKey].form[formKey].message.type === "loading" ? "text-synergy-light-blue" : "text-green-600 dark:text-green-500"} `}
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
                                  getNextQuestionKey,
                                );
                            }}
                            className="inline-flex items-center rounded-md bg-synergy-light-blue px-3 py-1 text-white transition-colors hover:bg-synergy-light-blue/90 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    .selected.inputValue,
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
                                    .options.inputForm.formKey,
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
                          applyFunnelPrefill={applyFunnelPrefill}
                          removeFunnelPrefill={removeFunnelPrefill}
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
                              debouncedCountQuestionsAndSet
                            }
                          />
                        )
                      )}
                      {questionElements[questionKey].form[formKey].type !==
                        "submit-button" &&
                        index ==
                          Object.entries(
                            questionElements[questionKey].form,
                          ).filter(([formKey]) =>
                            shouldRenderFunnelForm(
                              questionElements,
                              questionKey,
                              String(formKey),
                            ),
                          ).length -
                            1 && (
                          <div className="flex justify-between">
                            <div className="flex">
                              {getNavigationQuestionKeys(
                                questionElements,
                                questionKey,
                              )[0] !== questionKey && (
                                <button
                                  onClick={() => {
                                    getNextQuestionKey(
                                      questionKey,
                                      formKey,
                                      "previous",
                                    );
                                  }}
                                  className="rounded-md bg-synergy-light-blue px-3 py-1 text-white transition-colors hover:bg-synergy-light-blue/90 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2"
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
                                    "next",
                                  );
                                }}
                                className="rounded-md bg-synergy-light-blue px-3 py-1 text-white transition-colors hover:bg-synergy-light-blue/90 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2"
                              >
                                {isQuestionSkippable(questionKey)
                                  ? "Überspringen"
                                  : "Weiter"}
                              </button>
                            </div>
                          </div>
                        )}
                    </section>
                  ))}
              </div>
            </section>
          ))}
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
                        className="block h-9 w-9 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-extrabold text-gray-900 focus:border-synergy-light-blue focus:ring-synergy-light-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-synergy-light-blue dark:focus:ring-synergy-light-blue"
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
                  className="mt-4 inline-flex items-center gap-1 rounded-lg bg-synergy-light-blue px-4 py-2 text-white transition-colors hover:bg-synergy-light-blue/90 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2"
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

function FunnelQuestionTransitionStyles() {
  return (
    <style>
      {`
        @keyframes funnelQuestionExitNext {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          44% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(22deg) scale(0.96);
          }
          100% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(28deg) scale(0.94);
          }
        }

        @keyframes funnelQuestionEnterNext {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(-28deg) scale(0.94);
          }
          44% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(-22deg) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
        }

        @keyframes funnelQuestionExitPrevious {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          44% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(-22deg) scale(0.96);
          }
          100% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(-28deg) scale(0.94);
          }
        }

        @keyframes funnelQuestionEnterPrevious {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(28deg) scale(0.94);
          }
          44% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(22deg) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
        }

        .funnel-question-stage {
          position: relative;
          overflow: visible;
          perspective: 1400px;
          transform: translateZ(0);
          z-index: 1;
        }

        .funnel-question-stage-rotating {
          display: grid;
          isolation: isolate;
        }

        .funnel-question-stage-rotating > .funnel-question-transition {
          grid-area: 1 / 1;
          pointer-events: none;
        }

        .funnel-question-transition {
          backface-visibility: hidden;
          transform-origin: 50% 50%;
          transform-style: preserve-3d;
          will-change: opacity, transform;
        }

        .funnel-question-exiting-next {
          transform-origin: -18% 145%;
          z-index: 1;
          animation: funnelQuestionExitNext ${QUESTION_TRANSITION_ROTATE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .funnel-question-entering-next {
          transform-origin: 118% 145%;
          z-index: 2;
          animation: funnelQuestionEnterNext ${QUESTION_TRANSITION_ROTATE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .funnel-question-exiting-previous {
          transform-origin: 118% 145%;
          z-index: 1;
          animation: funnelQuestionExitPrevious ${QUESTION_TRANSITION_ROTATE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .funnel-question-entering-previous {
          transform-origin: -18% 145%;
          z-index: 2;
          animation: funnelQuestionEnterPrevious ${QUESTION_TRANSITION_ROTATE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .funnel-progress-container {
          position: relative;
          z-index: 30;
        }

        .funnel-progress-marker {
          align-items: center;
          display: flex;
          justify-content: center;
          left: 0;
          outline: none;
          position: absolute;
          top: 50%;
          transform: translate3d(-50%, -50%, 0);
        }

        .funnel-progress-map {
          height: 0;
          left: 0;
          position: absolute;
          right: 0;
          top: 50%;
          z-index: 10;
        }

        .funnel-progress-marker-dot {
          border-radius: 9999px;
          box-shadow: 0 1px 3px rgb(15 23 42 / 0.18);
          display: block;
          height: 0.75rem;
          transition:
            box-shadow 150ms ease,
            transform 150ms ease;
          width: 0.75rem;
        }

        .funnel-progress-marker:hover .funnel-progress-marker-dot,
        .funnel-progress-marker:focus .funnel-progress-marker-dot,
        .funnel-progress-marker:focus-visible .funnel-progress-marker-dot {
          transform: scale(1.22);
        }

        .funnel-progress-marker:focus-visible .funnel-progress-marker-dot {
          outline: 2px solid rgb(12 192 223 / 0.45);
          outline-offset: 4px;
        }

        .funnel-progress-marker-current {
          background: white;
          border: 2px solid #0cc0df;
          box-shadow:
            0 0 0 4px rgb(12 192 223 / 0.18),
            0 2px 6px rgb(15 23 42 / 0.18);
          height: 1rem;
          width: 1rem;
        }

        .funnel-progress-marker-complete {
          background: #0cc0df;
          border: 2px solid white;
        }

        .funnel-progress-marker-upcoming {
          background: white;
          border: 2px solid #d1d5db;
        }

        .funnel-progress-tooltip {
          background: #111827;
          border-radius: 0.375rem;
          box-shadow: 0 12px 24px rgb(15 23 42 / 0.2);
          color: white;
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.35;
          max-width: 14rem;
          opacity: 0;
          padding: 0.5rem 0.75rem;
          pointer-events: none;
          position: absolute;
          text-align: left;
          top: 1rem;
          transform: translate3d(0, -0.25rem, 0);
          transition:
            opacity 120ms ease,
            transform 120ms ease,
            visibility 120ms ease;
          visibility: hidden;
          width: max-content;
          z-index: 20;
        }

        .funnel-progress-marker:hover .funnel-progress-tooltip,
        .funnel-progress-marker:focus .funnel-progress-tooltip,
        .funnel-progress-marker:focus-visible .funnel-progress-tooltip {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          visibility: visible;
        }

        .funnel-progress-tooltip-center {
          left: 50%;
          transform: translate3d(-50%, -0.25rem, 0);
        }

        .funnel-progress-marker:hover .funnel-progress-tooltip-center,
        .funnel-progress-marker:focus .funnel-progress-tooltip-center,
        .funnel-progress-marker:focus-visible .funnel-progress-tooltip-center {
          transform: translate3d(-50%, 0, 0);
        }

        .funnel-progress-tooltip-start {
          left: 0;
        }

        .funnel-progress-tooltip-end {
          right: 0;
        }

        .funnel-progress-tooltip-index {
          color: #d1d5db;
          display: block;
          font-size: 0.6875rem;
          white-space: nowrap;
        }

        .funnel-progress-tooltip-title {
          display: block;
          white-space: normal;
        }

        @media (prefers-reduced-motion: reduce) {
          .funnel-question-stage-rotating {
            display: block;
          }

          .funnel-question-transition,
          .funnel-question-exiting-next,
          .funnel-question-entering-next,
          .funnel-question-exiting-previous,
          .funnel-question-entering-previous {
            animation: none;
            transform: none;
          }
        }
      `}
    </style>
  );
}

type FunnelIconConfig = {
  name?: string;
  icon?: string;
  src?: string;
  url?: string;
  alt?: string;
};

const funnelIconComponents: Record<string, LucideIcon> = {
  BadgeCheck,
  BatteryCharging,
  Building2,
  Cable,
  Car,
  CircleHelp,
  Fence,
  Gauge,
  Heater,
  House,
  HousePlug,
  LandPlot,
  Layers,
  PanelTop,
  PanelTopOpen,
  Plug,
  PlugZap,
  Snowflake,
  Sun,
  Warehouse,
  Wrench,
  Zap,
};

function renderFunnelOptionIcon(option: any): JSX.Element {
  const icon = (option?.icon ?? {}) as FunnelIconConfig;
  const iconName = icon.name ?? icon.icon;
  const Icon = iconName ? funnelIconComponents[iconName] : undefined;

  if (Icon) {
    return (
      <Icon
        aria-hidden="true"
        className="mb-2 h-7 w-7 text-synergy-light-blue"
        strokeWidth={1.8}
      />
    );
  }

  const iconSrc = icon.src ?? icon.url;
  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={icon.alt ?? option?.title ?? ""}
        className="mb-2 h-8 w-8 rounded object-cover"
      />
    );
  }

  return (
    <CircleHelp
      aria-hidden="true"
      className="mb-2 h-7 w-7 text-synergy-light-blue"
      strokeWidth={1.8}
    />
  );
}

function isVisibleEntity(entity: any): boolean {
  return entity?.defaultVisible === true || entity?.defaultVisible === "true";
}

function isRequiredForm(form: any): boolean {
  return form?.required === true || form?.required === "true";
}

function isQuestionComplete(question: any): boolean {
  const forms = question?.form ?? {};
  const visibleInputFormKeys = Object.keys(forms).filter(
    (formKey) =>
      isVisibleEntity(forms[formKey]) &&
      forms[formKey].type !== "submit-button",
  );

  if (visibleInputFormKeys.length === 0) return false;

  return visibleInputFormKeys.every(
    (formKey) =>
      forms[formKey].message?.type === "success" ||
      forms[formKey].message?.type === "warning",
  );
}

function getRenderableQuestionKeys(elements: Record<string, any>): string[] {
  const visibleQuestionKeys = Object.keys(elements ?? {}).filter(
    (questionKey) => isVisibleEntity(elements[questionKey]),
  );

  if (!isExtractionReviewFlowActive(elements)) {
    return visibleQuestionKeys;
  }

  const reviewQuestionKeys = visibleQuestionKeys.filter((questionKey) =>
    questionHasVisibleNonAiAcceptedForm(elements[questionKey]),
  );

  return reviewQuestionKeys.length > 0
    ? reviewQuestionKeys
    : visibleQuestionKeys;
}

function getNavigationQuestionKeys(
  elements: Record<string, any>,
  currentQuestionKey?: string,
): string[] {
  const visibleQuestionKeys = Object.keys(elements ?? {}).filter(
    (questionKey) => isVisibleEntity(elements[questionKey]),
  );

  if (!isExtractionReviewFlowActive(elements)) {
    return visibleQuestionKeys;
  }

  const reviewQuestionKeys = visibleQuestionKeys.filter((questionKey) =>
    questionHasVisibleNonAiAcceptedForm(elements[questionKey]),
  );
  const baseKeys =
    reviewQuestionKeys.length > 0 ? reviewQuestionKeys : visibleQuestionKeys;

  if (
    currentQuestionKey &&
    visibleQuestionKeys.includes(currentQuestionKey) &&
    !baseKeys.includes(currentQuestionKey)
  ) {
    return visibleQuestionKeys.filter(
      (questionKey) =>
        questionKey === currentQuestionKey || baseKeys.includes(questionKey),
    );
  }

  return baseKeys;
}

function getNavigationFormKeys(
  elements: Record<string, any>,
  questionKey: string,
  currentFormKey?: string,
): string[] {
  const forms = elements[questionKey]?.form ?? {};
  const visibleFormKeys = Object.keys(forms).filter((formKey) =>
    isVisibleEntity(forms[formKey]),
  );

  if (!isExtractionReviewFlowActive(elements)) {
    return visibleFormKeys;
  }

  const navigableFormKeys = visibleFormKeys.filter((formKey) => {
    const form = forms[formKey];
    return (
      form.type === "submit-button" ||
      form.type === "llm-file-extraction" ||
      !formHasAcceptedExtractionValue(form)
    );
  });

  const baseKeys = navigableFormKeys;

  if (
    currentFormKey &&
    navigableFormKeys.includes(currentFormKey) &&
    !baseKeys.includes(currentFormKey)
  ) {
    return navigableFormKeys.filter(
      (formKey) => formKey === currentFormKey || baseKeys.includes(formKey),
    );
  }

  return baseKeys;
}

function shouldRenderFunnelForm(
  elements: Record<string, any>,
  questionKey: string,
  formKey: string,
): boolean {
  const form = elements[questionKey]?.form?.[formKey];
  if (!form || !isVisibleEntity(form)) return false;
  if (!isExtractionReviewFlowActive(elements)) return true;

  return !formHasAcceptedExtractionValue(form);
}

function isExtractionReviewFlowActive(elements: Record<string, any>): boolean {
  return Object.values(elements ?? {}).some((question: any) =>
    Object.values(question.form ?? {}).some((form: any) => {
      if (form.extraction?.source === "llm") return true;
      if (form.type !== "llm-file-extraction") return false;
      return (form.selected?.selectedFiles ?? []).some(
        (file: any) => file.status === "extracted",
      );
    }),
  );
}

function questionHasVisibleNonAiAcceptedForm(question: any): boolean {
  return Object.values(question?.form ?? {}).some(
    (form: any) =>
      isVisibleEntity(form) && !formHasAcceptedExtractionValue(form),
  );
}

function questionHasLlmFileExtraction(question: any): boolean {
  return Object.values(question?.form ?? {}).some(
    (form: any) => isVisibleEntity(form) && form.type === "llm-file-extraction",
  );
}

function formNeedsReview(form: any): boolean {
  if (!form || !isVisibleEntity(form)) return false;
  if (form.type === "submit-button" || form.type === "calculation") {
    return false;
  }
  if (form.type === "llm-file-extraction") return false;

  if (
    form.extraction?.source === "llm" &&
    form.extraction.tier !== "green" &&
    form.extraction.userReviewed !== true
  ) {
    return true;
  }

  if (form.message?.type === "error") return true;

  return isRequiredForm(form) && !formHasUserValue(form);
}

function formHasAcceptedExtractionValue(form: any): boolean {
  return (
    form.extraction?.source === "llm" &&
    formHasUserValue(form) &&
    !formNeedsReview(form)
  );
}

function markExtractionReviewed(form: any) {
  if (form.extraction?.source === "llm") {
    form.extraction.userReviewed = true;
  }
}

function applyPrefillToQuestionElements(opts: {
  elements: Record<string, any>;
  prefill: Record<string, FunnelPrefillEntry>;
  context: {
    documentName: string;
    fileUid: string;
    force?: boolean;
    userReviewed?: boolean;
  };
  thresholds: { green: number; yellow: number };
}): { elements: Record<string, any>; result: FunnelPrefillResult } {
  const result: FunnelPrefillResult = { applied: [], skipped: [] };

  Object.entries(opts.prefill ?? {}).forEach(([formUid, entry]) => {
    const resolved = findFormByUid(opts.elements, formUid);
    if (!resolved) {
      result.skipped.push({
        formUid,
        label: entry.label,
        reason: "target_not_found",
        value: entry.value,
      });
      return;
    }

    const confidence = Number(entry.confidence ?? 0);
    const tier = confidenceTier(confidence, opts.thresholds);
    if (tier === "red" && !opts.context.force) {
      result.skipped.push({
        formUid,
        label: entry.label,
        reason: "low_confidence",
        value: entry.value,
      });
      return;
    }

    if (formHasUserValue(resolved.form)) {
      if (
        resolved.form.extraction?.source === "llm" &&
        formValueMatchesPrefill(resolved.form, entry.value)
      ) {
        result.applied.push(formUid);
        return;
      }

      if (opts.context.force && resolved.form.extraction?.source === "llm") {
        clearFormValue(resolved.form);
      } else {
        result.skipped.push({
          formUid,
          label: entry.label,
          reason: "already_filled",
          value: entry.value,
        });
        return;
      }
    }

    if (formHasUserValue(resolved.form)) {
      result.skipped.push({
        formUid,
        label: entry.label,
        reason: "already_filled",
        value: entry.value,
      });
      return;
    }

    const applied = applyValueToForm(resolved.form, entry.value);
    if (!applied) {
      result.skipped.push({
        formUid,
        label: entry.label,
        reason: "unsupported_value",
        value: entry.value,
      });
      return;
    }

    recalculateDependentForms(
      opts.elements,
      resolved.question.uid,
      resolved.form.uid,
      resolved.form,
    );
    resolved.form.extraction = {
      source: "llm",
      confidence,
      tier,
      sourceQuote: entry.sourceQuote ?? null,
      sourcePage: entry.sourcePage ?? null,
      fieldKey: entry.fieldKey,
      documentName: entry.documentName ?? opts.context.documentName,
      fileUid: entry.fileUid ?? opts.context.fileUid,
      label: entry.label,
      userModified: false,
      userReviewed: opts.context.userReviewed === true,
    };
    resolved.form.message.type = tier === "green" ? "success" : "warning";
    resolved.form.message.text =
      tier === "green"
        ? resolved.form.message.successMessage
        : `${entry.label ?? "Wert"} wurde von der KI vorausgefuellt. Bitte pruefen.`;
    result.applied.push(formUid);
  });

  return { elements: opts.elements, result };
}

function findFormByUid(
  elements: Record<string, any>,
  formUid: string,
): { questionKey: string; formKey: string; question: any; form: any } | null {
  for (const questionKey of Object.keys(elements)) {
    const question = elements[questionKey];
    const forms = elements[questionKey]?.form ?? {};
    for (const formKey of Object.keys(forms)) {
      if (forms[formKey]?.uid === formUid || formKey === formUid) {
        return { questionKey, formKey, question, form: forms[formKey] };
      }
    }
  }

  return null;
}

function recalculateDependentForms(
  elements: Record<string, any>,
  inputQuestionUid: string,
  inputFormUid: string,
  inputForm: any,
) {
  if (inputForm.type !== "range") return;

  const locale = inputForm.options?.unit?.numberFormat ?? "de-DE";
  const inputValue = formatLocaleNumberToUniNumber(
    String(inputForm.selected?.selectedValue ?? "0"),
    locale,
  );
  if (!Number.isFinite(inputValue)) return;

  Object.values(elements).forEach((question: any) => {
    Object.values(question.form ?? {}).forEach((form: any) => {
      if (
        form.type === "calculation" &&
        form.options?.inputForm?.questionKey === inputQuestionUid &&
        form.options?.inputForm?.formKey === inputFormUid
      ) {
        const formula = String(form.options.maths?.formula ?? "").replace(
          "x",
          String(inputValue),
        );
        const result = Number(Function(`"use strict"; return (${formula});`)());
        if (Number.isFinite(result)) {
          form.selected.inputValue = `${result}`;
        }
      }
    });
  });
}

function applyValueToForm(form: any, value: unknown): boolean {
  if (form.type === "range") {
    const numberValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numberValue)) return false;

    const locale = form.options?.unit?.numberFormat ?? "de-DE";
    form.selected.selectedValue = numberValue.toLocaleString(locale, {
      maximumFractionDigits: 2,
    });
    form.selected.rangeValue = rangePositionForValue(form, numberValue);
    return true;
  }

  if (
    form.type === "text" ||
    form.type === "email" ||
    form.type === "tel" ||
    form.type === "textarea"
  ) {
    if (typeof value !== "string" && typeof value !== "number") return false;
    form.selected.inputValue = String(value);
    return true;
  }

  if (
    form.type === "checkbox" ||
    form.type === "radio" ||
    form.type === "select"
  ) {
    const targetOptionUids = (Array.isArray(value) ? value : [value]).filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
    const runtimeOptionKeys = targetOptionUids
      .map((targetOptionUid) => findRuntimeOptionKey(form, targetOptionUid))
      .filter((item): item is string => Boolean(item));

    if (runtimeOptionKeys.length === 0) return false;

    const finalOptionKeys =
      form.type === "radio" ? runtimeOptionKeys.slice(0, 1) : runtimeOptionKeys;
    form.selected.selectedOptionsUid = finalOptionKeys;
    form.selected.selectedOptions = finalOptionKeys.map(
      (optionKey) => form.options[optionKey].title,
    );
    return true;
  }

  return false;
}

function formValueMatchesPrefill(form: any, value: unknown): boolean {
  if (form.type === "range") {
    const locale = form.options?.unit?.numberFormat ?? "de-DE";
    const current = formatLocaleNumberToUniNumber(
      String(form.selected?.selectedValue ?? "0"),
      locale,
    );
    const next = typeof value === "number" ? value : Number(value);
    return (
      Number.isFinite(current) &&
      Number.isFinite(next) &&
      Math.abs(current - next) <= Math.max(0.0001, Math.abs(next) * 0.0001)
    );
  }

  if (
    form.type === "text" ||
    form.type === "email" ||
    form.type === "tel" ||
    form.type === "textarea"
  ) {
    return (
      String(form.selected?.inputValue ?? "")
        .trim()
        .toLowerCase() ===
      String(value ?? "")
        .trim()
        .toLowerCase()
    );
  }

  if (
    form.type === "checkbox" ||
    form.type === "radio" ||
    form.type === "select"
  ) {
    const selected = (form.selected?.selectedOptionsUid ?? [])
      .map(String)
      .sort();
    const targetOptionUids = (Array.isArray(value) ? value : [value])
      .filter((item): item is string => typeof item === "string")
      .map((targetOptionUid) => findRuntimeOptionKey(form, targetOptionUid))
      .filter((item): item is string => Boolean(item))
      .sort();

    return (
      selected.length === targetOptionUids.length &&
      selected.every(
        (item: string, index: number) => item === targetOptionUids[index],
      )
    );
  }

  return false;
}

function clearFormValue(form: any): void {
  if (form.type === "range") {
    const defaultValue = Number(form.options?.range?.defaultValue ?? 0);
    const locale = form.options?.unit?.numberFormat ?? "de-DE";
    form.selected.selectedValue = defaultValue.toLocaleString(locale, {
      maximumFractionDigits: 2,
    });
    form.selected.rangeValue = rangePositionForValue(form, defaultValue);
    return;
  }

  if (
    form.type === "text" ||
    form.type === "email" ||
    form.type === "tel" ||
    form.type === "textarea"
  ) {
    form.selected.inputValue = "";
    return;
  }

  if (
    form.type === "checkbox" ||
    form.type === "radio" ||
    form.type === "select"
  ) {
    form.selected.selectedOptions = [];
    form.selected.selectedOptionsUid = [];
  }
}

function findRuntimeOptionKey(
  form: any,
  targetOptionUid: string,
): string | null {
  return (
    Object.keys(form.options ?? {}).find(
      (optionKey) =>
        optionKey === targetOptionUid ||
        form.options[optionKey]?.uid === targetOptionUid,
    ) ?? null
  );
}

function formHasUserValue(form: any): boolean {
  if (
    form.type === "checkbox" ||
    form.type === "radio" ||
    form.type === "select"
  ) {
    return (form.selected?.selectedOptionsUid?.length ?? 0) > 0;
  }

  if (
    form.type === "text" ||
    form.type === "email" ||
    form.type === "tel" ||
    form.type === "textarea"
  ) {
    return String(form.selected?.inputValue ?? "").trim() !== "";
  }

  if (form.type === "range") {
    const locale = form.options?.unit?.numberFormat ?? "de-DE";
    const current = formatLocaleNumberToUniNumber(
      String(form.selected?.selectedValue ?? "0"),
      locale,
    );
    const defaultValue = Number(form.options?.range?.defaultValue ?? 0);
    return (
      Number.isFinite(current) && Math.abs(current - defaultValue) > 0.0001
    );
  }

  return false;
}

function rangePositionForValue(form: any, value: number): number {
  const range = form.options?.range ?? {};
  const min = Number(range.min ?? 0);
  const max = Number(range.max ?? value);
  const clamped = Math.max(min, Math.min(max, value));

  if (range.type !== "exp") return clamped;

  const safeMin = Math.max(0.01, min);
  const safeMax = Math.max(safeMin, max);
  const safeValue = Math.max(safeMin, clamped);
  if (safeMax === safeMin) return safeMin;

  return (
    (Math.log(safeValue / safeMin) / Math.log(safeMax / safeMin)) *
      (safeMax - safeMin) +
    safeMin
  );
}

function getExtractionThresholds(elements: Record<string, any>): {
  green: number;
  yellow: number;
} {
  for (const question of Object.values(elements)) {
    for (const form of Object.values((question as any).form ?? {})) {
      const confidence = (form as any).options?.extraction?.confidence;
      if (confidence) {
        return {
          green: Number(confidence.green ?? 0.85),
          yellow: Number(confidence.yellow ?? 0.55),
        };
      }
    }
  }

  return { green: 0.85, yellow: 0.55 };
}

function confidenceTier(
  confidence: number,
  thresholds: { green: number; yellow: number },
): "green" | "yellow" | "red" {
  if (confidence >= thresholds.green) return "green";
  if (confidence >= thresholds.yellow) return "yellow";
  return "red";
}

function renderExtractionHint(form: any): JSX.Element | null {
  const extraction = form.extraction;
  if (!extraction) return null;

  const confidence = Number(extraction.confidence ?? 0);
  const className =
    extraction.tier === "green"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : extraction.tier === "yellow"
        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  const quote = extraction.sourceQuote
    ? ` Quelle: ${String(extraction.sourceQuote).slice(0, 160)}`
    : "";
  const title = `KI ${Math.round(confidence * 100)}%${extraction.sourcePage ? `, S. ${extraction.sourcePage}` : ""}.${quote}`;

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${className}`}
      title={title}
    >
      KI {Math.round(confidence * 100)}%
    </span>
  );
}

function cloneQuestionElements(
  elements: Record<string, any>,
): Record<string, any> {
  const structuredCloneFn = (globalThis as any).structuredClone;
  if (typeof structuredCloneFn === "function") {
    return structuredCloneFn(elements);
  }
  return JSON.parse(JSON.stringify(elements));
}

export default DefaultFunnel;
