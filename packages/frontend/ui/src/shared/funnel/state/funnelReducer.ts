import type { SetStateAction } from "react";
import { createQuestionElement } from "@com.synergy/frontend-ui/CreateElements";
import {
  cloneQuestionElements,
  computeRangeFromFactors,
} from "../utils/funnelHelpers";

export type FunnelElements = Record<string, any>;

export type FunnelFormat = {
  useKey: boolean;
  useStrings: boolean;
  useSelected: boolean;
  useUidAsKey: boolean;
};

export type InitFunnelArgs = {
  questionElementsRaw: Record<string, any>;
  format: FunnelFormat;
};

/** A single `[key, element]` pair ready to be spliced into the tree. */
export type ElementEntry = [string, any];

export type LegalConsentKey =
  | "ai_transfer"
  | "third_party_data"
  | "fagg_waiver";

export type LegalConsentPolicyVersions = Record<string, string>;

export type LegalConsentCheckboxState = {
  checked: boolean;
  changed_at: string | null;
  checked_at: string | null;
  unchecked_at: string | null;
};

export type LegalConsentState = {
  type: "legal-consent";
  defaultVisible: false;
  consent_version: string;
  text_hash: string;
  policy_versions: LegalConsentPolicyVersions;
  consents: Record<LegalConsentKey, boolean>;
  checkboxes: Record<LegalConsentKey, LegalConsentCheckboxState>;
};

export type FunnelAction =
  /**
   * Backward-compatible escape hatch matching React's `setState`. The updater
   * is run against a deep clone so legacy call sites that mutate nested objects
   * no longer corrupt shared state. Used by navigation, prefill, submitFunnel
   * and the delegated child components (Range/FileUpload/Calendly/Llm...).
   */
  | { type: "SET"; updater: SetStateAction<FunnelElements> }
  | { type: "REINIT"; init: InitFunnelArgs }
  | {
      type: "SELECT_OPTION";
      questionKey: string;
      formKey: string;
      optionKey: string;
      formType: "checkbox" | "radio";
    }
  | {
      type: "DESELECT_OPTION";
      questionKey: string;
      formKey: string;
      optionKey: string;
    }
  | {
      type: "SET_SELECT_OPTIONS";
      questionKey: string;
      formKey: string;
      optionKeys: string[];
    }
  | {
      type: "SET_INPUT_VALUE";
      questionKey: string;
      formKey: string;
      value: string;
    }
  | {
      type: "SET_LEGAL_CONSENT";
      consentKey: LegalConsentKey;
      checked: boolean;
      changedAt: string;
      consentVersion: string;
      textHash: string;
      policyVersions: LegalConsentPolicyVersions;
    }
  | {
      type: "ADD_FORMS";
      fromQuestionKey: string;
      fromFormKey: string;
      entries: ElementEntry[];
    }
  | { type: "ADD_QUESTIONS"; fromQuestionKey: string; entries: ElementEntry[] }
  | {
      type: "REMOVE_FORMS_BY_OPTION";
      questionKey: string;
      fromOptionKey: string;
    }
  | { type: "REMOVE_QUESTIONS_BY_OPTION"; fromOptionKey: string };

/**
 * Build the runtime question-element tree from the raw config. Single source of
 * truth for both the initial reducer state and the on-mount re-initialisation
 * (which regenerates client-side keys).
 */
export function initFunnelState(args: InitFunnelArgs): FunnelElements {
  const { questionElementsRaw, format } = args;
  const { useKey, useStrings, useSelected } = format;

  const elements = Object.keys(questionElementsRaw).reduce(
    (acc: FunnelElements, questionKey: string) => {
      // Skip special, non-question entities (e.g. `__legalConsent`). Saved
      // submits persist the full funnel state, so raw data loaded back from the
      // DB can contain these keys, which have no `.form` and must not be run
      // through createQuestionElement.
      if (
        questionKey.startsWith("__") ||
        !questionElementsRaw[questionKey]?.form
      ) {
        return acc;
      }
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

  return {
    ...elements,
    // Preserve a previously saved consent state (loaded from the DB) so the
    // dashboard shows what the user actually agreed to; otherwise start fresh.
    __legalConsent:
      (questionElementsRaw.__legalConsent as LegalConsentState | undefined) ??
      createInitialLegalConsentState(),
  };
}

function createInitialLegalConsentState(): LegalConsentState {
  return {
    type: "legal-consent",
    defaultVisible: false,
    consent_version: "",
    text_hash: "",
    policy_versions: {},
    consents: {
      ai_transfer: false,
      third_party_data: false,
      fagg_waiver: false,
    },
    checkboxes: {
      ai_transfer: createInitialLegalConsentCheckboxState(),
      third_party_data: createInitialLegalConsentCheckboxState(),
      fagg_waiver: createInitialLegalConsentCheckboxState(),
    },
  };
}

function createInitialLegalConsentCheckboxState(): LegalConsentCheckboxState {
  return {
    checked: false,
    changed_at: null,
    checked_at: null,
    unchecked_at: null,
  };
}

/** Immutably replace a single form within a question. */
function updateForm(
  state: FunnelElements,
  questionKey: string,
  formKey: string,
  updater: (form: any) => any,
): FunnelElements {
  const question = state[questionKey];
  if (!question || !question.form[formKey]) return state;
  return {
    ...state,
    [questionKey]: {
      ...question,
      form: {
        ...question.form,
        [formKey]: updater(question.form[formKey]),
      },
    },
  };
}

/**
 * After an input changes, refresh any range form in the same question whose
 * `computeFrom` references the changed form (e.g. the kWp slider derived from
 * panel count × power per panel). Only fires when every factor is present and
 * numeric, so partial input leaves the slider free for manual use.
 */
function recomputeDerivedRanges(
  state: FunnelElements,
  questionKey: string,
  changedFormKey: string,
): FunnelElements {
  const question = state[questionKey];
  if (!question?.form) return state;

  const changedUid = question.form[changedFormKey]?.uid;
  if (!changedUid) return state;

  let result = state;
  for (const rangeFormKey of Object.keys(question.form)) {
    const rangeForm = question.form[rangeFormKey];
    const factors = rangeForm?.computeFrom?.factors;
    if (!Array.isArray(factors) || !factors.includes(changedUid)) continue;

    const derived = computeRangeFromFactors(result[questionKey], rangeForm);
    if (!derived) continue;

    result = updateForm(result, questionKey, rangeFormKey, (form) => ({
      ...form,
      selected: {
        ...form.selected,
        selectedValue: derived.selectedValue,
        rangeValue: derived.rangeValue,
      },
    }));
  }
  return result;
}

export function funnelReducer(
  state: FunnelElements,
  action: FunnelAction,
): FunnelElements {
  switch (action.type) {
    case "SET": {
      const draft = cloneQuestionElements(state);
      const next =
        typeof action.updater === "function"
          ? (action.updater as (prev: FunnelElements) => FunnelElements)(draft)
          : action.updater;
      return next ?? draft;
    }

    case "REINIT":
      return initFunnelState(action.init);

    case "SELECT_OPTION": {
      const { questionKey, formKey, optionKey, formType } = action;
      return updateForm(state, questionKey, formKey, (form) => {
        const title = form.options[optionKey].title;
        const selected =
          formType === "checkbox"
            ? {
                selectedOptions: [...form.selected.selectedOptions, title],
                selectedOptionsUid: [
                  ...form.selected.selectedOptionsUid,
                  optionKey,
                ],
              }
            : {
                /** Radio: only one option can be selected */
                selectedOptions: [title],
                selectedOptionsUid: [optionKey],
              };
        return { ...form, selected: { ...form.selected, ...selected } };
      });
    }

    case "DESELECT_OPTION": {
      const { questionKey, formKey, optionKey } = action;
      return updateForm(state, questionKey, formKey, (form) => {
        const title = form.options[optionKey].title;
        return {
          ...form,
          selected: {
            ...form.selected,
            selectedOptions: form.selected.selectedOptions.filter(
              (option: string) => option !== title,
            ),
            selectedOptionsUid: form.selected.selectedOptionsUid.filter(
              (option: string) => option !== optionKey,
            ),
          },
        };
      });
    }

    case "SET_SELECT_OPTIONS": {
      const { questionKey, formKey, optionKeys } = action;
      return updateForm(state, questionKey, formKey, (form) => ({
        ...form,
        selected: {
          ...form.selected,
          selectedOptions: optionKeys.map(
            (optionKey) => form.options[optionKey].title,
          ),
          selectedOptionsUid: optionKeys,
        },
      }));
    }

    case "SET_INPUT_VALUE": {
      const { questionKey, formKey, value } = action;
      const next = updateForm(state, questionKey, formKey, (form) => ({
        ...form,
        selected: { ...form.selected, inputValue: value },
      }));
      return recomputeDerivedRanges(next, questionKey, formKey);
    }

    case "SET_LEGAL_CONSENT": {
      const {
        consentKey,
        checked,
        changedAt,
        consentVersion,
        textHash,
        policyVersions,
      } = action;
      const current =
        (state.__legalConsent as LegalConsentState | undefined) ??
        createInitialLegalConsentState();
      const currentCheckbox =
        current.checkboxes?.[consentKey] ??
        createInitialLegalConsentCheckboxState();

      return {
        ...state,
        __legalConsent: {
          ...current,
          consent_version: consentVersion,
          text_hash: textHash,
          policy_versions: policyVersions,
          consents: {
            ...current.consents,
            [consentKey]: checked,
          },
          checkboxes: {
            ...current.checkboxes,
            [consentKey]: {
              ...currentCheckbox,
              checked,
              changed_at: changedAt,
              checked_at: checked ? changedAt : currentCheckbox.checked_at,
              unchecked_at: checked ? currentCheckbox.unchecked_at : changedAt,
            },
          },
        },
      };
    }

    case "ADD_FORMS": {
      const { fromQuestionKey, fromFormKey, entries } = action;
      const question = state[fromQuestionKey];
      if (!question || entries.length === 0) return state;
      const formEntries = Object.entries(question.form);
      const fromIndex = formEntries.findIndex(([key]) => key === fromFormKey);
      formEntries.splice(fromIndex + 1, 0, ...entries);
      return {
        ...state,
        [fromQuestionKey]: {
          ...question,
          form: Object.fromEntries(formEntries),
        },
      };
    }

    case "ADD_QUESTIONS": {
      const { fromQuestionKey, entries } = action;
      if (entries.length === 0) return state;
      const questionEntries = Object.entries(state);
      const fromIndex = questionEntries.findIndex(
        ([key]) => key === fromQuestionKey,
      );
      questionEntries.splice(fromIndex + 1, 0, ...entries);
      return Object.fromEntries(questionEntries);
    }

    case "REMOVE_FORMS_BY_OPTION": {
      const { questionKey, fromOptionKey } = action;
      const question = state[questionKey];
      if (!question) return state;
      return {
        ...state,
        [questionKey]: {
          ...question,
          form: Object.fromEntries(
            Object.entries(question.form).filter(
              ([, form]: [string, any]) => !form.from?.includes(fromOptionKey),
            ),
          ),
        },
      };
    }

    case "REMOVE_QUESTIONS_BY_OPTION": {
      const { fromOptionKey } = action;
      return Object.fromEntries(
        Object.entries(state).filter(
          ([, question]: [string, any]) =>
            !question.from?.includes(fromOptionKey),
        ),
      );
    }

    default:
      return state;
  }
}
