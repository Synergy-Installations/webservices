/**
 * Pure helpers for the "an option reveals extra forms/questions" behaviour.
 *
 * An option's `addForm` / `addQuestion` may be a single key (string) or a list
 * of keys (string[]). `toKeyList` normalises both into an array the add logic
 * can loop over, and `resolveAddSource` performs the raw-source lookup that used
 * to be duplicated inline inside the checkbox/radio and select onChange handlers.
 */

export type AddTarget = string | string[] | null | undefined;

/** Normalise an `addForm`/`addQuestion` value into a clean list of keys. */
export const toKeyList = (value: AddTarget): string[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (key): key is string => typeof key === "string" && key !== "",
    );
  }
  if (typeof value === "string" && value !== "") {
    return [value];
  }
  return [];
};

/**
 * Resolve the raw element that should be passed into `createFormElement` /
 * `createQuestionElement` for a given target key.
 *
 * On the dashboard (`useKey`) the runtime keys already equal the uids, so we
 * look the element up by uid inside the live tree. On the landing funnel the
 * raw, un-keyed source lives in `questionElementsRaw` keyed by uid.
 */
export const resolveAddFormSource = (
  targetKey: string,
  ctx: {
    useKey: boolean;
    questionElements: Record<string, any>;
    questionElementsRaw: Record<string, any>;
    fromQuestionKey: string;
  },
): any => {
  const { useKey, questionElements, questionElementsRaw, fromQuestionKey } = ctx;
  if (useKey) {
    return Object.values(questionElements[fromQuestionKey].form).find(
      (form: any) => form.uid === targetKey,
    );
  }
  return questionElementsRaw[questionElements[fromQuestionKey].uid].form[
    targetKey
  ];
};

/** Resolve the raw question element for a given `addQuestion` target key. */
export const resolveAddQuestionSource = (
  targetKey: string,
  ctx: {
    useKey: boolean;
    questionElements: Record<string, any>;
    questionElementsRaw: Record<string, any>;
  },
): any => {
  const { useKey, questionElements, questionElementsRaw } = ctx;
  if (useKey) {
    return Object.values(questionElements).find(
      (questionElement: any) => questionElement.uid === targetKey,
    );
  }
  return questionElementsRaw[targetKey];
};
