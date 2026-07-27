"use client";

import { useTranslations } from "next-intl";
import {
  useState,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { debounce } from "@com.synergy/frontend-ui/Debounce";
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
import { AlertTriangle, Info, ShieldCheck } from "lucide-react";
import {
  funnelReducer,
  initFunnelState,
  type LegalConsentKey,
  type FunnelElements,
  type InitFunnelArgs,
} from "./state/funnelReducer";
import { useFunnelElements } from "./hooks/useFunnelElements";
import { CheckboxRadioForm } from "./forms/CheckboxRadioForm";
import { CardPopupForm } from "./forms/CardPopupForm";
import { SelectForm } from "./forms/SelectForm";
import { TextInputForm } from "./forms/TextInputForm";
import { SubmitButtonForm } from "./forms/SubmitButtonForm";
import { CalculationForm } from "./forms/CalculationForm";
import { MontageDatePickerForm } from "./forms/MontageDatePickerForm";
import {
  type FunnelPrefillEntry,
  type FunnelPrefillResult,
  isVisibleEntity,
  isRequiredForm,
  isRequiredGroupSatisfied,
  isQuestionComplete,
  shouldRenderFunnelForm,
  getRenderableQuestionKeys,
  getNavigationQuestionKeys,
  getNavigationFormKeys,
  isExtractionReviewFlowActive,
  questionHasVisibleNonAiAcceptedForm,
  questionHasLlmFileExtraction,
  markExtractionReviewed,
  renderFormRequiredLabel,
  renderExtractionHint,
  applyPrefillToQuestionElements,
  findFormByUid,
  findRuntimeOptionKey,
  recalculateDependentForms,
  clearFormValue,
  getExtractionThresholds,
  cloneQuestionElements,
} from "./utils/funnelHelpers";

type QuestionTransitionDirection = "next" | "previous";
type QuestionTransitionState = {
  phase: "idle" | "rotating";
  direction: QuestionTransitionDirection;
  currentQuestionKey?: string;
  targetQuestionKey?: string;
};

const QUESTION_TRANSITION_ROTATE_MS = 560;
const LEGAL_CONSENT_VERSION = "2026-06-03";
const LEGAL_POLICY_VERSIONS = {
  datenschutzerklaerung: "2026-06-03",
  nutzungsbedingungen: "2026-06-03",
};
const LEGAL_CONSENT_KEYS: LegalConsentKey[] = [
  "ai_transfer",
  "third_party_data",
  "fagg_waiver",
];
const LEGAL_REQUIRE_UPLOAD_AUTH_TICK = true;
const LEGAL_VISIBLE_CONSENT_KEYS = LEGAL_CONSENT_KEYS.filter(
  (consentKey) =>
    consentKey !== "third_party_data" || LEGAL_REQUIRE_UPLOAD_AUTH_TICK,
);
const LEGAL_CONSENT_STATIC_HINT =
  "Die hochgeladenen Dateien werden in unserem Auftrag in der EU (Bunny.net, Slowenien) gespeichert und nach spätestens 30 Tagen automatisch gelöscht. Details: Datenschutzerklärung. Es gelten unsere Nutzungsbedingungen.";

const LEGAL_AI_TRANSPARENCY_NOTICE = {
  title: "Hinweis: KI-gestützte Funktion",
  body: 'Dieser Fragebogen wird mithilfe eines Systems der Künstlichen Intelligenz (KI) betrieben. Ein Sprachmodell („Claude" von Anthropic) liest die von Ihnen hochgeladenen Dokumente automatisiert aus und füllt die Antwortfelder für Sie vor. Die so erzeugten Texte und Werte sind maschinell generiert, können fehlerhaft oder unvollständig sein und ersetzen keine fachliche Beratung. Bitte prüfen Sie alle Vorschläge, bevor Sie das Formular absenden.',
};

const LEGAL_ACCURACY_NOTICE = {
  title: "Hinweis zur Genauigkeit der KI-Vorschläge",
  submitSummary:
    "KI-Vorschläge können Fehler enthalten — bitte alle Felder vor dem Absenden prüfen. Verbindlich sind ausschließlich Ihre abgesendeten Antworten.",
  body: 'Die Vorschläge in diesem Fragebogen wurden mittels eines KI-Sprachmodells aus Ihren Dateien generiert. Trotz sorgfältiger technischer Umsetzung kann es zu Fehlern, Auslassungen, Fehlinterpretationen oder sogenannten „Halluzinationen" kommen. Bitte prüfen Sie sämtliche Felder, bevor Sie den Fragebogen absenden, und korrigieren Sie diese bei Bedarf. Verbindlich sind ausschließlich die von Ihnen abgesendeten Antworten.',
};

const LEGAL_CONSENT_TEXTS: Record<
  LegalConsentKey,
  {
    title: string;
    visible: string;
    details: string;
  }
> = {
  ai_transfer: {
    title: "A (erforderlich)",
    visible:
      'Ich willige ein, dass meine hochgeladenen Dateien durch ein KI-Sprachmodell („Claude" von Anthropic) ausgewertet und dafür in die USA übermittelt werden. Die USA bieten kein gleichwertiges Datenschutzniveau; ein Zugriff durch US-Behörden ist nicht ausgeschlossen.',
    details:
      "Die Übermittlung an Anthropic, PBC (USA) erfolgt auf Grundlage von Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO) sowie meiner ausdrücklichen Einwilligung gemäß Art. 49 Abs. 1 lit. a DSGVO. Anthropic verwendet die übermittelten Inhalte nach eigenen Angaben nicht zum Training. Diese Einwilligung kann ich jederzeit mit Wirkung für die Zukunft widerrufen (formlos per E-Mail). Weitere Informationen in der Datenschutzerklärung.",
  },
  third_party_data: {
    title: "B (erforderlich)",
    visible:
      "Ich bin berechtigt, diese Dateien hochzuladen, habe etwaige betroffene Dritte informiert und lade keine Geheimnis- oder Art.-9-Daten hoch.",
    details:
      "Soweit die Dateien personenbezogene Daten Dritter (z. B. von Familienangehörigen, Mitbewohnern, Vertragspartnern, Mitarbeitern) enthalten, bestätige ich, dass ich diese Personen über die Verarbeitung informiert habe bzw. zu deren Übermittlung berechtigt bin. Ich lade keine Dokumente hoch, die einem Berufs- oder Amtsgeheimnis unterliegen oder besondere Kategorien personenbezogener Daten im Sinne des Art. 9 DSGVO enthalten, soweit dies nicht für meine Anfrage zwingend erforderlich ist.",
  },
  fagg_waiver: {
    title: "C (erforderlich, nur Verbraucher)",
    visible:
      "Ich verlange den sofortigen Beginn und nehme zur Kenntnis, dass mein Rücktrittsrecht (§ 18 FAGG) mit vollständiger Erbringung erlischt.",
    details:
      "Ich verlange ausdrücklich, dass mit der KI-gestützten Auswertung meiner Dateien sofort begonnen wird, und nehme zur Kenntnis, dass mein Rücktrittsrecht nach § 18 Abs. 1 FAGG mit vollständiger Erbringung dieser digitalen Dienstleistung erlischt.",
  },
};

const LEGAL_CONSENT_HASH_TEXT = [
  `consent_version: ${LEGAL_CONSENT_VERSION}`,
  ...LEGAL_VISIBLE_CONSENT_KEYS.flatMap((consentKey) => {
    const text = LEGAL_CONSENT_TEXTS[consentKey];
    return [text.title, text.visible, text.details];
  }),
  LEGAL_CONSENT_STATIC_HINT,
].join("\n\n");

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
  const [legalConsentTextHash, setLegalConsentTextHash] = useState<string>("");

  const initArgs = useMemo<InitFunnelArgs>(
    () => ({
      questionElementsRaw,
      format: { useKey, useStrings, useSelected, useUidAsKey },
    }),
    [questionElementsRaw, useKey, useStrings, useSelected, useUidAsKey],
  );

  const [questionElements, dispatch] = useReducer(
    funnelReducer,
    initArgs,
    initFunnelState,
  );

  /** Backward-compatible setState shim. Existing call sites (navigation,
   * prefill, submitFunnel and the delegated child components) keep using
   * setQuestionElements unchanged; the reducer applies their updater against a
   * deep clone so nested mutations no longer corrupt shared state. */
  const setQuestionElements = useCallback(
    (updater: SetStateAction<FunnelElements>) =>
      dispatch({ type: "SET", updater }),
    [],
  );

  /** Always-current snapshot for stable (debounced) callbacks and the element hook. */
  const questionElementsRef = useRef<FunnelElements>(questionElements);
  questionElementsRef.current = questionElements;

  useEffect(() => {
    let isMounted = true;

    void sha256Hex(LEGAL_CONSENT_HASH_TEXT).then((hash) => {
      if (isMounted) {
        setLegalConsentTextHash(hash);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const legalConsentTextHashReady = legalConsentTextHash.length > 0;
  const legalConsentValues = useMemo(
    () =>
      LEGAL_CONSENT_KEYS.reduce(
        (acc, consentKey) => {
          acc[consentKey] =
            questionElements.__legalConsent?.consents?.[consentKey] === true;
          return acc;
        },
        {} as Record<LegalConsentKey, boolean>,
      ),
    [questionElements.__legalConsent?.consents],
  );
  const hasRequiredLegalConsents =
    legalConsentTextHashReady &&
    LEGAL_VISIBLE_CONSENT_KEYS.every(
      (consentKey) => legalConsentValues[consentKey],
    );
  const legalConsentDisabledReason = legalConsentTextHashReady
    ? "Bitte bestätigen Sie die Pflichtfelder."
    : "Die Einwilligungstexte werden vorbereitet.";
  const handleLegalConsentChange = useCallback(
    (consentKey: LegalConsentKey, checked: boolean) => {
      if (!legalConsentTextHashReady) return;

      dispatch({
        type: "SET_LEGAL_CONSENT",
        consentKey,
        checked,
        changedAt: new Date().toISOString(),
        consentVersion: LEGAL_CONSENT_VERSION,
        textHash: legalConsentTextHash,
        policyVersions: LEGAL_POLICY_VERSIONS,
      });
    },
    [legalConsentTextHash, legalConsentTextHashReady],
  );

  const { applyOptionSideEffects, removeOptionSideEffects } = useFunnelElements(
    {
      dispatch,
      questionElementsRef,
      questionElementsRaw,
      format: { useKey, useStrings, useSelected, useUidAsKey },
    },
  );

  const firstQuestionKey = Object.keys(questionElements)[0] ?? null;

  useEffect(() => {
    children && children(questionElements);
  }, [children, questionElements]);

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

  /** Re-initialise on the client after mount so the runtime keys are generated
   * client-side (the server render uses different random keys). Single source of
   * truth via initFunnelState - no duplicated init logic. */
  useEffect(() => {
    dispatch({ type: "REINIT", init: initArgs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set the current question id to the URL for advanced use
  // to start where the user left off (requires saving state)
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      questionPresentation !== "window" ||
      !firstQuestionKey
    ) {
      return;
    }

    const url = new URL(window.location.href);
    const paramId = url.searchParams.get("currentQuestionId");

    // Keep an existing, still-valid currentQuestionId; otherwise reset to the
    // first question key.
    if (!paramId || !questionElements[paramId]) {
      url.searchParams.set("currentQuestionId", firstQuestionKey);
      window.history.replaceState({}, "", url.toString());
    }
  }, [firstQuestionKey, questionPresentation, questionElements]);

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

  /** Stable debounced fn (created once) reading the latest snapshot via ref so
   * the debounce timer actually persists across renders. */
  const debouncedCountQuestionsAndSet = useMemo(
    () =>
      debounce(() => {
        const elements = questionElementsRef.current;
        const visibleQuestionKeys = Object.keys(elements ?? {}).filter(
          (questionKey) => isVisibleEntity(elements[questionKey]),
        );
        setQuestionCounts({
          totalQuestions: visibleQuestionKeys.length,
          completedQuestions: visibleQuestionKeys.filter((questionKey) =>
            isQuestionComplete(elements[questionKey]),
          ).length,
        });
      }, 100),
    [questionElementsRef],
  );

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

  useEffect(() => {
    if (questionPresentation !== "window") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      const target = event.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "button" ||
        tag === "a" ||
        target.isContentEditable
      ) {
        return;
      }

      const currentQuestionKey =
        typeof window !== "undefined"
          ? (new URL(window.location.href).searchParams.get(
              "currentQuestionId",
            ) ?? undefined)
          : undefined;
      const elements = questionElementsRef.current;
      if (!currentQuestionKey || !elements[currentQuestionKey]) return;

      const visibleFormKeys = Object.keys(
        elements[currentQuestionKey].form,
      ).filter((fk) =>
        shouldRenderFunnelForm(elements, currentQuestionKey, fk, true),
      );
      const lastFormKey = visibleFormKeys[visibleFormKeys.length - 1];
      if (!lastFormKey) return;

      getNextQuestionKeyRef.current(currentQuestionKey, lastFormKey, "next");
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [questionPresentation]);

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
    const extractionReviewEnabled = questionPresentation === "window";
    const visibleQuestionKeys = getNavigationQuestionKeys(
      questionElements,
      currentQuestionKey,
      extractionReviewEnabled,
    );
    const currentVisibleQuestionIndex =
      visibleQuestionKeys.indexOf(currentQuestionKey);
    const visibleFormKeys = getNavigationFormKeys(
      questionElements,
      currentQuestionKey,
      formKey,
      extractionReviewEnabled,
    );
    const currentVisibleFormIndex = visibleFormKeys.indexOf(formKey);
    const extractionReviewFlowActive =
      extractionReviewEnabled && isExtractionReviewFlowActive(questionElements);

    let error = false;
    visibleQuestionKeys.forEach(
      (questionKey: string, questionIndex: number) => {
        getNavigationFormKeys(
          questionElements,
          questionKey,
          questionKey === currentQuestionKey ? formKey : undefined,
          extractionReviewEnabled,
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
            const groupForm = questionElements[questionKey].form[formKey];
            const inRequiredGroup = Boolean(groupForm.requiredGroup);
            /** Forms sharing a `requiredGroup` are individually optional but the
             * group must hold at least one value (e.g. kWp OR number of panels).
             */
            const requiredGroupSatisfied =
              inRequiredGroup &&
              isRequiredGroupSatisfied(
                questionElements[questionKey],
                groupForm.requiredGroup,
              );
            if (
              /** Test the form for incorrect input only if the form is a required
               * input (or a member of a not-yet-satisfied required group),
               * otherwise we have no business validating it.
               */
              (isRequiredForm(groupForm) || inRequiredGroup) &&
              !requiredGroupSatisfied &&
              (((groupForm.type === "checkbox" ||
                groupForm.type === "radio" ||
                groupForm.type === "select") &&
                groupForm.selected.selectedOptions.length == 0) ||
                (groupForm.type === "range" &&
                  Number(groupForm.selected.selectedValue) <
                    groupForm.options.range.min) ||
                ((groupForm.type === "text" ||
                  groupForm.type === "number" ||
                  groupForm.type === "email" ||
                  groupForm.type === "tel" ||
                  groupForm.type === "textarea") &&
                  groupForm.selected.inputValue == ""))
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

  /** Stable debounced wrappers (created once). They invoke the latest function
   * via a ref so the debounce timer survives re-renders while still closing over
   * up-to-date state. */
  const getNextQuestionKeyRef = useRef(getNextQuestionKey);
  getNextQuestionKeyRef.current = getNextQuestionKey;
  const debouncedGetNextQuestionKey = useMemo(
    () =>
      debounce((questionKey: string, formKey: string) => {
        getNextQuestionKeyRef.current(questionKey, formKey);
      }, 100),
    [],
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

  const calculateFormsRef = useRef(calculateForms);
  calculateFormsRef.current = calculateForms;
  const debouncedCalculateForms = useMemo(
    () =>
      debounce((questionKey: string, formKey: string) => {
        calculateFormsRef.current(questionKey, formKey);
      }, 100),
    [],
  );

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
      const aiPrefillDefaultLabel = t("ui.aiPrefill.defaultLabel");
      const thresholds = getExtractionThresholds(questionElements);
      const preview = cloneQuestionElements(questionElements);
      const { result } = applyPrefillToQuestionElements({
        elements: preview,
        prefill,
        context,
        thresholds,
        getAiPrefillWarningMessage: (label?: string) =>
          t("ui.aiPrefill.warning", {
            label: label ?? aiPrefillDefaultLabel,
          }),
      });

      setQuestionElements((prev) => {
        const { elements } = applyPrefillToQuestionElements({
          elements: { ...prev },
          prefill,
          context,
          thresholds,
          getAiPrefillWarningMessage: (label?: string) =>
            t("ui.aiPrefill.warning", {
              label: label ?? aiPrefillDefaultLabel,
            }),
        });
        return elements;
      });

      debouncedCountQuestionsAndSet();
      return result;
    },
    [debouncedCountQuestionsAndSet, questionElements, t],
  );

  const removeFunnelPrefill = useCallback(
    (
      formUid: string,
      context: {
        documentName: string;
        fileUid: string;
        force?: boolean;
        cardFormUid?: string;
        optionUid?: string;
        cardFieldKey?: string;
      },
    ): void => {
      setQuestionElements((prev) => {
        const elements = cloneQuestionElements(prev);

        // Card-popup sub-fields use opaque short keys; their real card/option/
        // field identity travels on the context. Clear the value straight out
        // of the card's `selected.fields` bucket.
        if (context.cardFormUid && context.optionUid && context.cardFieldKey) {
          const card = findFormByUid(elements, context.cardFormUid);
          const runtimeOptionKey = card
            ? findRuntimeOptionKey(card.form, context.optionUid)
            : null;
          if (
            card &&
            runtimeOptionKey &&
            card.form.selected?.fields?.[runtimeOptionKey]
          ) {
            delete card.form.selected.fields[runtimeOptionKey][
              context.cardFieldKey
            ];
          }
          return elements;
        }

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
      ([_, form]: [string, any]) =>
        form.required === true || Boolean(form.requiredGroup),
    );
    if (hasRequired) return false;

    const hasData = visibleForms.some(([_, form]: [string, any]) => {
      if (
        form.type === "checkbox" ||
        form.type === "radio" ||
        form.type === "select" ||
        form.type === "card-popup"
      ) {
        return form.selected.selectedOptions.length > 0;
      }
      if (
        form.type === "text" ||
        form.type === "number" ||
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
      if (form.type === "montage-datepicker") {
        return Boolean(form.selected?.montageStartDate);
      }
      return false;
    });

    return !hasData;
  };

  const questionElementsToBeRendered = () => {
    // Helper to get the currentQuestionId from the URL if questionPresentation is "window"
    const visibleQuestionKeys = Object.keys(questionElements ?? {}).filter(
      (questionKey: any) => isVisibleEntity(questionElements[questionKey]),
    );
    let filteredQuestionKeys =
      getRenderableQuestionKeys(
        questionElements,
        questionPresentation === "window",
      ) ?? visibleQuestionKeys;

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
        }
        // When the current question should be skipped in the review flow the URL
        // is re-synced to the first renderable question in an effect (see below)
        // to avoid mutating history during render.
      }
    }
    return filteredQuestionKeys;
  };

  const renderedQuestionKeys = questionElementsToBeRendered();

  /** Keep the URL's currentQuestionId in sync when the active question is
   * skipped by the extraction-review flow (side-effect kept out of render). */
  useEffect(() => {
    if (questionPresentation !== "window" || typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    const currentQuestionId = url.searchParams.get("currentQuestionId");
    if (!currentQuestionId || !questionElements[currentQuestionId]) return;
    if (questionTransition.phase === "rotating") return;

    const keepCurrentQuestion =
      !isExtractionReviewFlowActive(questionElements) ||
      questionHasVisibleNonAiAcceptedForm(
        questionElements[currentQuestionId],
      ) ||
      questionHasLlmFileExtraction(questionElements[currentQuestionId]);
    if (keepCurrentQuestion) return;

    const renderable = getRenderableQuestionKeys(questionElements, true)?.[0];
    if (renderable && renderable !== currentQuestionId) {
      url.searchParams.set("currentQuestionId", renderable);
      window.history.replaceState({}, "", url.toString());
    }
  }, [questionElements, questionPresentation, questionTransition.phase]);
  const isQuestionTransitionActive = questionTransition.phase === "rotating";
  const showQuestionNavigationButtons = questionPresentation === "window";
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
  const questionHasVisibleLlmExtractionForm = (questionKey: string): boolean =>
    Object.values(questionElements[questionKey]?.form ?? {}).some(
      (form: any) =>
        isVisibleEntity(form) && form.type === "llm-file-extraction",
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
              {questionProgressPercentage}% ausgefüllt
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
                aria-label={t("ui.accessibility.questionOverviewAriaLabel")}
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
                  const hasError = Object.values(
                    questionElements[questionKey]?.form ?? {},
                  ).some(
                    (form: any) =>
                      isVisibleEntity(form) && form.message?.type === "error",
                  );
                  const markerStateClassName = isCurrent
                    ? "funnel-progress-marker-current"
                    : hasError
                      ? "funnel-progress-marker-error"
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
                      style={{ left: `${markerPosition}%`, cursor: "pointer" }}
                      role="button"
                      tabIndex={0}
                      aria-label={t(
                        "ui.accessibility.questionProgressMarkerAriaLabel",
                        {
                          current: index + 1,
                          total: overviewQuestionKeys.length,
                          title: question?.title ?? "",
                        },
                      )}
                      onClick={() => {
                        const direction =
                          index > activeOverviewQuestionIndex
                            ? "next"
                            : "previous";
                        transitionToQuestion(questionKey, direction);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const direction =
                            index > activeOverviewQuestionIndex
                              ? "next"
                              : "previous";
                          transitionToQuestion(questionKey, direction);
                        }
                      }}
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
              {questionHasVisibleLlmExtractionForm(questionKey) && (
                <LegalAiTransparencyNotice />
              )}
              {/** Form */}
              <div className="grid grid-cols-2 gap-6">
                {Object.keys(questionElements[questionKey].form)
                  .filter((formKey: any) =>
                    shouldRenderFunnelForm(
                      questionElements,
                      questionKey,
                      formKey,
                      questionPresentation === "window",
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
                          {renderFormRequiredLabel(
                            questionElements[questionKey].form[formKey],
                            t("ui.formLabel.required"),
                            t("ui.formLabel.optional"),
                          )}
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
                      {(() => {
                        const form =
                          questionElements[questionKey].form[formKey];
                        switch (form.type) {
                          case "checkbox":
                          case "radio":
                            return (
                              <CheckboxRadioForm
                                questionElements={questionElements}
                                questionKey={questionKey}
                                formKey={formKey}
                                dispatch={dispatch}
                                applyOptionSideEffects={applyOptionSideEffects}
                                removeOptionSideEffects={
                                  removeOptionSideEffects
                                }
                                debouncedGetNextQuestionKey={
                                  debouncedGetNextQuestionKey
                                }
                                debouncedCountQuestionsAndSet={
                                  debouncedCountQuestionsAndSet
                                }
                              />
                            );
                          case "card-popup":
                            return (
                              <CardPopupForm
                                questionElements={questionElements}
                                questionKey={questionKey}
                                formKey={formKey}
                                setQuestionElements={setQuestionElements}
                                debouncedGetNextQuestionKey={
                                  debouncedGetNextQuestionKey
                                }
                                debouncedCountQuestionsAndSet={
                                  debouncedCountQuestionsAndSet
                                }
                                t={t}
                              />
                            );
                          case "select":
                            return (
                              <SelectForm
                                questionElements={questionElements}
                                questionKey={questionKey}
                                formKey={formKey}
                                dispatch={dispatch}
                                applyOptionSideEffects={applyOptionSideEffects}
                                removeOptionSideEffects={
                                  removeOptionSideEffects
                                }
                                debouncedGetNextQuestionKey={
                                  debouncedGetNextQuestionKey
                                }
                                debouncedCountQuestionsAndSet={
                                  debouncedCountQuestionsAndSet
                                }
                              />
                            );
                          case "range":
                            return (
                              <Range
                                questionElements={questionElements}
                                questionKey={questionKey}
                                formKey={formKey}
                                setQuestionElements={setQuestionElements}
                                debouncedGetNextQuestionKey={
                                  debouncedGetNextQuestionKey
                                }
                                debouncedCalculateForms={
                                  debouncedCalculateForms
                                }
                              />
                            );
                          case "text":
                          case "number":
                          case "email":
                          case "tel":
                          case "textarea":
                            return (
                              <TextInputForm
                                questionElements={questionElements}
                                questionKey={questionKey}
                                formKey={formKey}
                                dispatch={dispatch}
                                debouncedGetNextQuestionKey={
                                  debouncedGetNextQuestionKey
                                }
                              />
                            );
                          case "submit-button":
                            return (
                              <>
                                <LegalAccuracyNotice compact />
                                <SubmitButtonForm
                                  questionElements={questionElements}
                                  questionKey={questionKey}
                                  formKey={formKey}
                                  showQuestionNavigationButtons={
                                    showQuestionNavigationButtons
                                  }
                                  confettiConfig={confettiConfig}
                                  t={t}
                                  setQuestionElements={setQuestionElements}
                                  getNextQuestionKey={getNextQuestionKey}
                                  submitFunnel={submitFunnel}
                                />
                              </>
                            );
                          case "calculation":
                            return (
                              <CalculationForm
                                questionElements={questionElements}
                                questionKey={questionKey}
                                formKey={formKey}
                              />
                            );
                          case "file-upload":
                            return (
                              <FileUpload
                                questionKey={questionKey}
                                formKey={formKey}
                                questionElements={questionElements}
                                setQuestionElements={setQuestionElements}
                                STORAGE_ZONE_ACCESS_KEY={
                                  STORAGE_ZONE_ACCESS_KEY
                                }
                              />
                            );
                          case "llm-file-extraction":
                            return (
                              <LlmFileExtraction
                                questionKey={questionKey}
                                formKey={formKey}
                                questionElements={questionElements}
                                setQuestionElements={setQuestionElements}
                                STORAGE_ZONE_ACCESS_KEY={
                                  STORAGE_ZONE_ACCESS_KEY
                                }
                                applyFunnelPrefill={applyFunnelPrefill}
                                removeFunnelPrefill={removeFunnelPrefill}
                                analysisDisabled={!hasRequiredLegalConsents}
                                analysisDisabledReason={
                                  legalConsentDisabledReason
                                }
                                consentGate={
                                  <LegalConsentGate
                                    consents={legalConsentValues}
                                    disabled={!legalConsentTextHashReady}
                                    onChange={handleLegalConsentChange}
                                  />
                                }
                              />
                            );
                          case "calendly":
                            return (
                              <Calendly
                                questionKey={questionKey}
                                formKey={formKey}
                                questionElements={questionElements}
                                setQuestionElements={setQuestionElements}
                                debouncedCountFormsAndSet={
                                  debouncedCountQuestionsAndSet
                                }
                              />
                            );
                          case "montage-datepicker":
                            return (
                              <MontageDatePickerForm
                                questionKey={questionKey}
                                formKey={formKey}
                                questionElements={questionElements}
                                setQuestionElements={setQuestionElements}
                                debouncedCountFormsAndSet={
                                  debouncedCountQuestionsAndSet
                                }
                              />
                            );
                          default:
                            return null;
                        }
                      })()}
                      {questionElements[questionKey].form[formKey].type !==
                        "submit-button" &&
                        showQuestionNavigationButtons &&
                        index ==
                          Object.entries(
                            questionElements[questionKey].form,
                          ).filter(([formKey]) =>
                            shouldRenderFunnelForm(
                              questionElements,
                              questionKey,
                              String(formKey),
                              questionPresentation === "window",
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
                                  {t("ui.navigation.previous")}
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
                                  ? t("ui.navigation.skip")
                                  : t("ui.navigation.next")}
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
                {t("ui.verification.title")}
              </DialogTitle>
              <Description>{t("ui.verification.description")}</Description>
              <p>{t("ui.verification.details")}</p>
              <form className="max-w-sm mx-auto">
                <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
                  {[...Array(6)].map((_, index) => (
                    <div key={index}>
                      <label htmlFor={`code-${index + 1}`} className="sr-only">
                        {t("ui.verification.codeLabel", { index: index + 1 })}
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
                  {t("ui.verification.helperText")}
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
                  {t("ui.verification.verifyButton")}
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

function LegalAiTransparencyNotice() {
  return (
    <section className="mt-6 rounded-lg border border-synergy-light-blue/30 bg-synergy-light-blue/5 p-4 text-left text-synergy-dark-grey shadow-sm dark:border-synergy-light-blue/40 dark:bg-synergy-light-blue/10 dark:text-synergy-light-grey">
      <div className="flex gap-3">
        <Info
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 flex-none text-synergy-light-blue"
          strokeWidth={1.9}
        />
        <div>
          <h2 className="text-base font-semibold">
            {LEGAL_AI_TRANSPARENCY_NOTICE.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300">
            {LEGAL_AI_TRANSPARENCY_NOTICE.body} Weitere Informationen finden Sie
            in unserer{" "}
            <a
              href="/datenschutz"
              className="font-medium text-synergy-light-blue underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2"
            >
              Datenschutzerklärung
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function LegalAccuracyNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-left text-amber-950 shadow-sm dark:border-amber-400/50 dark:bg-amber-500/10 dark:text-amber-100">
        <div className="flex gap-2.5">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 flex-none text-amber-600 dark:text-amber-300"
            strokeWidth={1.9}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-6">
              {LEGAL_ACCURACY_NOTICE.submitSummary}
            </p>
            <details className="group mt-1.5 text-sm leading-6">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-medium text-amber-800 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:text-amber-100 [&::-webkit-details-marker]:hidden">
                Details
                <span
                  aria-hidden="true"
                  className="transition-transform group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <p className="mt-1 text-sm leading-6">
                {LEGAL_ACCURACY_NOTICE.body}
              </p>
            </details>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-left text-amber-950 shadow-sm dark:border-amber-400/50 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex gap-3">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 flex-none text-amber-600 dark:text-amber-300"
          strokeWidth={1.9}
        />
        <div>
          <h2 className="text-base font-semibold">
            {LEGAL_ACCURACY_NOTICE.title}
          </h2>
          <p className="mt-1 text-sm leading-6">{LEGAL_ACCURACY_NOTICE.body}</p>
        </div>
      </div>
    </section>
  );
}

function LegalConsentGate({
  consents,
  disabled,
  onChange,
}: {
  consents: Record<LegalConsentKey, boolean>;
  disabled: boolean;
  onChange: (consentKey: LegalConsentKey, checked: boolean) => void;
}) {
  return (
    <section className="mb-4 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex gap-2.5">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 flex-none text-synergy-light-blue"
          strokeWidth={1.9}
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-synergy-dark-grey dark:text-synergy-light-grey">
            Einwilligungen vor der KI-Auswertung
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-gray-600 dark:text-gray-300">
            Bitte bestätigen Sie die Pflichtfelder, damit die KI-Auswertung
            starten kann.
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {LEGAL_VISIBLE_CONSENT_KEYS.map((consentKey) => {
          const text = LEGAL_CONSENT_TEXTS[consentKey];
          const checkboxId = `legal-consent-${consentKey}`;
          const detailsId = `${checkboxId}-details`;
          const requirementLabel =
            consentKey === "fagg_waiver"
              ? "(erforderlich, Verbraucher)"
              : "(erforderlich)";

          return (
            <div
              key={consentKey}
              className={`rounded-md border px-2.5 py-2 transition-colors ${
                consents[consentKey]
                  ? "border-synergy-light-blue bg-synergy-light-blue/5"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={consents[consentKey]}
                  disabled={disabled}
                  aria-describedby={detailsId}
                  onChange={(event) =>
                    onChange(consentKey, event.currentTarget.checked)
                  }
                  className="mt-0.5 h-4 w-4 flex-none cursor-pointer rounded border-gray-300 text-synergy-light-blue focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={checkboxId}
                    className="cursor-pointer text-xs leading-5 text-synergy-dark-grey dark:text-synergy-light-grey"
                  >
                    {text.visible}{" "}
                    <span className="whitespace-nowrap font-medium text-synergy-light-blue">
                      {requirementLabel}
                    </span>
                  </label>
                  <LegalConsentDetails id={detailsId} details={text.details} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-600 dark:text-gray-300">
        {LEGAL_CONSENT_STATIC_HINT}
      </p>
    </section>
  );
}

function LegalConsentDetails({ id, details }: { id: string; details: string }) {
  return (
    <details id={id} className="group mt-1 text-xs leading-5">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-medium text-synergy-light-blue underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2 [&::-webkit-details-marker]:hidden">
        Details
        <span
          aria-hidden="true"
          className="transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <p className="mt-1 text-gray-600 dark:text-gray-300">{details}</p>
    </details>
  );
}

async function sha256Hex(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    return fallbackStableHash(text);
  }

  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(text));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fallbackStableHash(text: string): string {
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fallback-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

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

        .funnel-progress-marker-error {
          background: #ef4444;
          border: 2px solid white;
          box-shadow:
            0 0 0 3px rgb(239 68 68 / 0.25),
            0 2px 6px rgb(15 23 42 / 0.18);
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

export default DefaultFunnel;
