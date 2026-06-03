import { useCallback, type Dispatch, type MutableRefObject } from "react";
import {
  createQuestionElement,
  createFormElement,
} from "@com.synergy/frontend-ui/CreateElements";
import type {
  FunnelAction,
  FunnelElements,
  FunnelFormat,
  ElementEntry,
} from "../state/funnelReducer";
import {
  toKeyList,
  resolveAddFormSource,
  resolveAddQuestionSource,
} from "../utils/optionSideEffects";

export type OptionSource = {
  fromQuestionKey: string;
  fromFormKey: string;
  fromOptionKey: string;
};

type UseFunnelElementsArgs = {
  dispatch: Dispatch<FunnelAction>;
  /** Always points at the latest question-element tree (avoids stale closures). */
  questionElementsRef: MutableRefObject<FunnelElements>;
  questionElementsRaw: Record<string, any>;
  format: FunnelFormat;
};

const uniqueKey = (key: string): string =>
  `${key}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * Centralises every add/remove of question/form elements that an option can
 * trigger. `applyOptionSideEffects` replaces the duplicated inline blocks that
 * used to live in the checkbox/radio and select onChange handlers and supports
 * an option revealing *multiple* forms/questions (`addForm`/`addQuestion` may be
 * a single key or an array of keys).
 */
export function useFunnelElements({
  dispatch,
  questionElementsRef,
  questionElementsRaw,
  format,
}: UseFunnelElementsArgs) {
  const { useKey, useStrings, useUidAsKey } = format;

  /** Inherited "from" trail of the triggering form + the clicked option. */
  const buildFromArray = useCallback(
    (from: OptionSource): string[] => {
      const questionElements = questionElementsRef.current;
      const sourceForm =
        questionElements[from.fromQuestionKey].form[from.fromFormKey];
      return [...(sourceForm.from || []), from.fromOptionKey];
    },
    [questionElementsRef],
  );

  const applyOptionSideEffects = useCallback(
    (from: OptionSource, option: any) => {
      const questionElements = questionElementsRef.current;
      const fromArray = buildFromArray(from);

      const formKeys = toKeyList(option.addForm);
      if (formKeys.length > 0) {
        const entries: ElementEntry[] = formKeys.map((formKey) => {
          const source = resolveAddFormSource(formKey, {
            useKey,
            questionElements,
            questionElementsRaw,
            fromQuestionKey: from.fromQuestionKey,
          });
          return [
            uniqueKey(formKey),
            createFormElement(
              questionElements[from.fromQuestionKey].uid,
              formKey,
              source,
              false,
              useStrings,
              false,
              fromArray,
              true,
            ),
          ];
        });
        dispatch({
          type: "ADD_FORMS",
          fromQuestionKey: from.fromQuestionKey,
          fromFormKey: from.fromFormKey,
          entries,
        });
      }

      const questionKeys = toKeyList(option.addQuestion);
      if (questionKeys.length > 0) {
        const entries: ElementEntry[] = questionKeys.map((questionKey) => {
          const source = resolveAddQuestionSource(questionKey, {
            useKey,
            questionElements,
            questionElementsRaw,
          });
          return [
            uniqueKey(questionKey),
            createQuestionElement(
              questionKey,
              source,
              false,
              useStrings,
              false,
              fromArray,
              true,
              useUidAsKey,
            ),
          ];
        });
        dispatch({
          type: "ADD_QUESTIONS",
          fromQuestionKey: from.fromQuestionKey,
          entries,
        });
      }
    },
    [
      buildFromArray,
      dispatch,
      questionElementsRaw,
      questionElementsRef,
      useKey,
      useStrings,
      useUidAsKey,
    ],
  );

  /** Remove every form/question that was added by a given option. */
  const removeOptionSideEffects = useCallback(
    (questionKey: string, fromOptionKey: string) => {
      dispatch({ type: "REMOVE_FORMS_BY_OPTION", questionKey, fromOptionKey });
      dispatch({ type: "REMOVE_QUESTIONS_BY_OPTION", fromOptionKey });
    },
    [dispatch],
  );

  return { applyOptionSideEffects, removeOptionSideEffects };
}
