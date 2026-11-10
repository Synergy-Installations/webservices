import {
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react";
import type { FunnelElements } from "../state/funnelReducer";
import {
  formHasUserValue,
  getNavigationQuestionKeys,
  isRequiredForm,
  isVisibleEntity,
} from "../utils/funnelHelpers";

type NavigationDirection = "next" | "previous";

/** Only real input controls are navigation stops. Pure displays, info notices,
 * navigation buttons and progress markers are skipped. Range sliders are
 * skipped because the range form already offers a typed value input, file
 * inputs are invisible drop zones. Components can opt further controls in via
 * `data-funnel-field` (e.g. the cards of a card-popup form). */
const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="range"]):not([type="file"])',
  "textarea",
  "select",
  "[data-funnel-field]",
].join(",");

const SUBMIT_SELECTOR = "[data-funnel-submit]";

const TEXT_ENTRY_INPUT_TYPES = new Set([
  "text",
  "email",
  "number",
  "tel",
  "search",
  "url",
  "password",
]);

/** A pending focus after a keyboard-triggered question change is only honoured
 * for a short while, so a later mouse navigation does not steal focus. */
const PENDING_FOCUS_TTL_MS = 2500;

type PendingFocus = {
  fromQuestionKey: string;
  edge: "first" | "last";
  expiresAt: number;
};

type UseFunnelKeyboardNavigationArgs = {
  stageRef: RefObject<HTMLElement | null>;
  questionElementsRef: MutableRefObject<FunnelElements>;
  setQuestionElements: (updater: SetStateAction<FunnelElements>) => void;
  getNextQuestionKeyRef: MutableRefObject<
    (
      questionKey: string,
      formKey: string,
      redirect?: "next" | "previous" | "none",
    ) => { status: string }
  >;
  questionPresentation: string;
  /** Changes whenever a question transition starts or ends. */
  questionTransition: { phase: "idle" | "rotating" };
};

function isTextEntry(
  el: HTMLElement,
): el is HTMLInputElement | HTMLTextAreaElement {
  return (
    el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLInputElement && TEXT_ENTRY_INPUT_TYPES.has(el.type))
  );
}

function isUsable(el: HTMLElement): boolean {
  if ((el as HTMLInputElement).disabled) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  // `display: none` elements have no client rects; visually hidden (sr-only)
  // radio/checkbox inputs still do and stay reachable.
  return el.getClientRects().length > 0;
}

/** Arrow keys keep their normal job inside text: left/right only leave a text
 * field when the caret sits at its start/end, up/down only leave a textarea
 * from its first/last line. */
function arrowLeavesField(el: HTMLElement, key: string): boolean {
  if (!isTextEntry(el)) return true;

  let start: number | null = null;
  let end: number | null = null;
  try {
    start = el.selectionStart;
    end = el.selectionEnd;
  } catch {
    // email/number inputs do not expose a caret position
  }

  if (key === "ArrowUp" || key === "ArrowDown") {
    if (!(el instanceof HTMLTextAreaElement)) return true;
    if (start === null || end === null) return true;
    return key === "ArrowUp"
      ? !el.value.slice(0, start).includes("\n")
      : !el.value.slice(end).includes("\n");
  }

  if (start === null || end === null || start !== end) return false;
  return key === "ArrowLeft" ? start === 0 : end === el.value.length;
}

/** Mirrors the required-input check of the "Weiter" button for a single form.
 * Forms of a `requiredGroup` are left to the button, because the user has to
 * be able to move on to the other member of the group. */
function isMissingRequiredValue(form: any): boolean {
  if (!form || !isVisibleEntity(form) || !isRequiredForm(form)) return false;

  switch (form.type) {
    case "checkbox":
    case "radio":
    case "select":
    case "card-popup":
    case "text":
    case "number":
    case "email":
    case "tel":
    case "textarea":
      return !formHasUserValue(form);
    default:
      return false;
  }
}

function getCurrentQuestionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    new URL(window.location.href).searchParams.get("currentQuestionId") ??
    undefined
  );
}

/**
 * Keyboard navigation between the input fields of the funnel:
 * - Enter, Tab, ArrowDown, ArrowRight → next input field
 * - Shift+Tab, ArrowUp, ArrowLeft → previous input field
 * Moving forward out of a required field is only possible once it is filled.
 * At the end/start of a question the funnel moves on to the next/previous
 * question, exactly like the "Weiter"/"Zurück" buttons.
 */
export function useFunnelKeyboardNavigation({
  stageRef,
  questionElementsRef,
  setQuestionElements,
  getNextQuestionKeyRef,
  questionPresentation,
  questionTransition,
}: UseFunnelKeyboardNavigationArgs) {
  const pendingFocusRef = useRef<PendingFocus | null>(null);
  const transitionPhaseRef = useRef(questionTransition.phase);
  transitionPhaseRef.current = questionTransition.phase;

  const getFields = useCallback((): HTMLElement[] => {
    const stage = stageRef.current;
    if (!stage) return [];
    return Array.from(stage.querySelectorAll<HTMLElement>(FIELD_SELECTOR))
      .filter((el) => el.closest("[data-funnel-form]"))
      .filter(isUsable);
  }, [stageRef]);

  const focusField = useCallback((el: HTMLElement) => {
    el.focus({ preventScroll: true });
    // Visually hidden option inputs are represented by their label card.
    const visibleElement =
      el instanceof HTMLInputElement && el.labels?.[0] ? el.labels[0] : el;
    visibleElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (isTextEntry(el) && el instanceof HTMLInputElement) {
      try {
        el.select();
      } catch {
        // not every input type supports select()
      }
    }
  }, []);

  const focusFirstErrorField = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const elements = questionElementsRef.current;
    const formSections = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-funnel-form]"),
    );
    const errorSection = formSections.find((section) => {
      const questionKey = section.closest<HTMLElement>("[data-funnel-question]")
        ?.dataset.funnelQuestion;
      const formKey = section.dataset.funnelForm;
      if (!questionKey || !formKey) return false;
      return elements[questionKey]?.form?.[formKey]?.message?.type === "error";
    });
    const field = getFields().find((el) => errorSection?.contains(el));
    if (field) focusField(field);
  }, [stageRef, questionElementsRef, getFields, focusField]);

  const markRequiredError = useCallback(
    (questionKey: string, formKey: string) => {
      setQuestionElements((prev) => {
        const updatedElements = { ...prev };
        const form = updatedElements[questionKey]?.form?.[formKey];
        if (!form) return updatedElements;
        form.message.text = form.message.requiredMessage;
        form.message.type = "error";
        return updatedElements;
      });
    },
    [setQuestionElements],
  );

  /** Leave the current question via the regular navigation logic. */
  const changeQuestion = useCallback(
    (questionSection: HTMLElement, direction: NavigationDirection): boolean => {
      if (questionPresentation !== "window") return false;

      const questionKey = questionSection.dataset.funnelQuestion;
      if (!questionKey) return false;

      const elements = questionElementsRef.current;
      const navigationQuestionKeys = getNavigationQuestionKeys(
        elements,
        questionKey,
      );
      const isFirstQuestion = navigationQuestionKeys[0] === questionKey;
      const isLastQuestion =
        navigationQuestionKeys[navigationQuestionKeys.length - 1] ===
        questionKey;
      if (direction === "previous" && isFirstQuestion) return true;
      if (direction === "next" && isLastQuestion) return false;

      // Like the "Weiter"/"Zurück" buttons, which sit below the last form.
      const formSections =
        questionSection.querySelectorAll<HTMLElement>("[data-funnel-form]");
      const formKey = formSections[formSections.length - 1]?.dataset.funnelForm;
      if (!formKey) return false;

      pendingFocusRef.current = {
        fromQuestionKey: questionKey,
        edge: direction === "next" ? "first" : "last",
        expiresAt: Date.now() + PENDING_FOCUS_TTL_MS,
      };

      const result = getNextQuestionKeyRef.current(
        questionKey,
        formKey,
        direction,
      );
      if (result.status === "error") {
        pendingFocusRef.current = null;
        // Wait for the error messages to be rendered.
        setTimeout(focusFirstErrorField, 0);
      }
      return true;
    },
    [
      questionPresentation,
      questionElementsRef,
      getNextQuestionKeyRef,
      focusFirstErrorField,
    ],
  );

  const move = useCallback(
    (
      active: HTMLElement,
      direction: NavigationDirection,
      skipRestOfForm = false,
    ): boolean => {
      const fields = getFields();
      const index = fields.indexOf(active);
      const activeFormSection =
        active.closest<HTMLElement>("[data-funnel-form]");
      const activeQuestionSection = active.closest<HTMLElement>(
        "[data-funnel-question]",
      );
      let target: HTMLElement | undefined;

      if (index !== -1 && skipRestOfForm) {
        target = fields
          .slice(index + 1)
          .find((el) => !activeFormSection?.contains(el));
      } else if (index !== -1) {
        target = fields[index + (direction === "next" ? 1 : -1)];
      } else if (direction === "next") {
        target = fields.find(
          (el) =>
            active.compareDocumentPosition(el) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
      } else {
        target = [...fields]
          .reverse()
          .find(
            (el) =>
              active.compareDocumentPosition(el) &
              Node.DOCUMENT_POSITION_PRECEDING,
          );
      }

      /** Required fields have to be filled before moving forward. */
      if (
        direction === "next" &&
        index !== -1 &&
        activeFormSection &&
        activeQuestionSection &&
        (!target || !activeFormSection.contains(target))
      ) {
        const questionKey = activeQuestionSection.dataset.funnelQuestion;
        const formKey = activeFormSection.dataset.funnelForm;
        const form =
          questionKey && formKey
            ? questionElementsRef.current[questionKey]?.form?.[formKey]
            : undefined;
        if (questionKey && formKey && isMissingRequiredValue(form)) {
          markRequiredError(questionKey, formKey);
          return true;
        }
      }

      if (target) {
        focusField(target);
        return true;
      }

      if (direction === "next") {
        const submitButton =
          stageRef.current?.querySelector<HTMLElement>(SUBMIT_SELECTOR);
        if (submitButton && submitButton !== active && isUsable(submitButton)) {
          focusField(submitButton);
          return true;
        }
      }

      const questionSection =
        activeQuestionSection ??
        stageRef.current?.querySelector<HTMLElement>("[data-funnel-question]");
      if (!questionSection) return false;
      return changeQuestion(questionSection, direction);
    },
    [
      getFields,
      questionElementsRef,
      markRequiredError,
      focusField,
      stageRef,
      changeQuestion,
    ],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (transitionPhaseRef.current === "rotating") {
        if (["Tab", "Enter"].includes(event.key)) event.preventDefault();
        return;
      }

      const active = event.target as HTMLElement;
      if (!stage.contains(active)) return;
      const isField = active.matches(FIELD_SELECTOR);

      let direction: NavigationDirection | null = null;
      switch (event.key) {
        case "Tab":
          direction = event.shiftKey ? "previous" : "next";
          break;
        case "Enter": {
          if (event.shiftKey) return;
          // Buttons and links keep Enter for clicking (e.g. opening a card).
          if (
            !isField ||
            active instanceof HTMLButtonElement ||
            active instanceof HTMLAnchorElement
          ) {
            return;
          }
          direction = "next";
          break;
        }
        case "ArrowDown":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowLeft":
          if (!isField || event.shiftKey) return;
          if (!arrowLeavesField(active, event.key)) return;
          direction =
            event.key === "ArrowDown" || event.key === "ArrowRight"
              ? "next"
              : "previous";
          break;
        default:
          return;
      }

      /** Enter on an option card jumps to the next form instead of the next
       * option; an unselected radio option gets selected first, like a click. */
      const isOption =
        active instanceof HTMLInputElement &&
        (active.type === "radio" || active.type === "checkbox");
      if (event.key === "Enter" && isOption) {
        event.preventDefault();
        if (active.type === "radio" && !active.checked) {
          active.click();
          // Let the selection (and forms it adds) render first.
          setTimeout(() => move(active, "next", true), 0);
          return;
        }
        move(active, "next", true);
        return;
      }

      if (move(active, direction)) event.preventDefault();
    };

    stage.addEventListener("keydown", handleKeyDown);
    return () => stage.removeEventListener("keydown", handleKeyDown);
  }, [stageRef, move]);

  /** After a keyboard-triggered question change, focus the first field of the
   * new question (or the last one when going back). */
  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending || questionTransition.phase !== "idle") return;
    if (Date.now() > pending.expiresAt) {
      pendingFocusRef.current = null;
      return;
    }
    const currentQuestionKey = getCurrentQuestionId();
    if (!currentQuestionKey || currentQuestionKey === pending.fromQuestionKey) {
      return;
    }
    pendingFocusRef.current = null;

    const fields = getFields();
    const field =
      pending.edge === "first" ? fields[0] : fields[fields.length - 1];
    if (field) focusField(field);
  }, [questionTransition, getFields, focusField]);
}
