import atATMessages from "@com.synergy/frontend-shared-internationalization/messages/at-AT.json";
import enMessages from "@com.synergy/frontend-shared-internationalization/messages/en.json";
import type {
  ExtractionConfig,
  ExtractionFieldConfig,
  ExtractionFieldType,
  ExtractionOptionConfig,
} from "./extraction";

type Messages = any;
type RawRecord = Record<string, any>;

const messagesByLocale: Record<string, Messages> = {
  "at-AT": atATMessages,
  en: enMessages,
};

export function getExtractionConfig(opts: {
  locale: string;
  extractionQuestionUid: string;
  extractionFormUid: string;
}): ExtractionConfig {
  const messages = messagesByLocale[opts.locale] ?? atATMessages;
  const config =
    findExtractionConfig(messages, opts.extractionQuestionUid, opts.extractionFormUid) ??
    findExtractionConfig(atATMessages, opts.extractionQuestionUid, opts.extractionFormUid);

  if (!config) {
    throw new Error(
      `Missing extraction config for ${opts.extractionQuestionUid}.${opts.extractionFormUid}`,
    );
  }

  return config;
}

function findExtractionConfig(
  messages: Messages,
  questionUid: string,
  formUid: string,
): ExtractionConfig | null {
  const questions = messages.LandingPage.ContactUs.Funnel.questions as Record<
    string,
    any
  >;
  const question = findQuestionByUid(questions, questionUid);
  const form = question ? findFormByUid(question, formUid) : null;
  const sharedExtraction = form?.options?.extraction;

  if (!isRecord(sharedExtraction)) {
    return null;
  }

  const { fields: legacyFields, ...sharedConfig } = sharedExtraction;
  const fields = {
    ...(isRecord(legacyFields)
      ? (legacyFields as Record<string, ExtractionFieldConfig>)
      : {}),
    ...collectFormExtractionFields(questions),
  };

  return {
    ...sharedConfig,
    fields,
  } as ExtractionConfig;
}

function findQuestionByUid(
  questions: Record<string, RawRecord>,
  questionUid: string,
): RawRecord | null {
  return (
    questions[questionUid] ??
    Object.values(questions).find((question) => question.uid === questionUid) ??
    null
  );
}

function findFormByUid(
  question: RawRecord,
  formUid: string,
): RawRecord | null {
  const forms = question.form ?? {};
  return (
    forms[formUid] ??
    Object.values(forms).find((form: any) => form?.uid === formUid) ??
    null
  );
}

function collectFormExtractionFields(
  questions: Record<string, RawRecord>,
): Record<string, ExtractionFieldConfig> {
  const fields: Record<string, ExtractionFieldConfig> = {};

  Object.entries(questions).forEach(([questionKey, question]) => {
    Object.entries(question.form ?? {}).forEach(([formKey, form]) => {
      const formExtraction = (form as RawRecord).aiExtraction;
      if (!isRecord(formExtraction) || isDisabled(formExtraction.enabled)) {
        return;
      }

      const questionUid = String(question.uid ?? questionKey);
      const formUid = String((form as RawRecord).uid ?? formKey);

      // The form's own extraction field(s) — for card-popup forms this is the
      // card SELECTION field (which cards to tick).
      if (isRecord(formExtraction.fields)) {
        Object.entries(formExtraction.fields).forEach(([fieldKey, field]) => {
          if (!isRecord(field)) return;
          fields[fieldKey] = normalizeFieldConfig({
            field,
            fieldKey,
            form: form as RawRecord,
            questionUid,
            formUid,
          });
        });
      } else {
        const fieldKey =
          typeof formExtraction.fieldKey === "string" &&
          formExtraction.fieldKey.trim()
            ? formExtraction.fieldKey
            : formUid;

        fields[fieldKey] = normalizeFieldConfig({
          field: formExtraction,
          fieldKey,
          form: form as RawRecord,
          questionUid,
          formUid,
        });
      }

      // For card-popup forms also auto-derive an extraction field for every
      // pop-up sub-field of every card (unless explicitly disabled).
      if (
        (form as RawRecord).type === "card-popup" &&
        !isDisabled(formExtraction.extractCardFields)
      ) {
        collectCardSubFields({
          form: form as RawRecord,
          questionUid,
          formUid,
        }).forEach(([fieldKey, field]) => {
          fields[fieldKey] = field;
        });
      }
    });
  });

  return fields;
}

function normalizeFieldConfig(opts: {
  field: RawRecord;
  fieldKey: string;
  form: RawRecord;
  questionUid: string;
  formUid: string;
}): ExtractionFieldConfig {
  const type = normalizeFieldType(opts.field.type, opts.form);

  return {
    label: stringOrFallback(opts.field.label, formLabel(opts.form, opts.fieldKey)),
    type,
    description: stringOrFallback(
      opts.field.description,
      opts.form.description || opts.form.title || opts.fieldKey,
    ),
    aliases: stringArray(opts.field.aliases),
    instructions: stringOrUndefined(
      opts.field.instructions ?? opts.field.extractionInstructions,
    ),
    unit: stringOrUndefined(opts.field.unit ?? opts.form.options?.unit?.value),
    min: stringOrUndefined(opts.field.min ?? opts.form.options?.range?.min),
    max: stringOrUndefined(opts.field.max ?? opts.form.options?.range?.max),
    target: {
      questionUid: stringOrFallback(opts.field.target?.questionUid, opts.questionUid),
      formUid: stringOrFallback(opts.field.target?.formUid, opts.formUid),
    },
    options:
      type === "single-option" || type === "multi-option"
        ? normalizeOptionConfig(opts.field.options, opts.form)
        : undefined,
  };
}

function normalizeFieldType(
  type: unknown,
  form: RawRecord,
): ExtractionFieldType {
  if (
    type === "number" ||
    type === "text" ||
    type === "single-option" ||
    type === "multi-option"
  ) {
    return type;
  }

  if (form.type === "range") return "number";
  if (
    form.type === "checkbox" ||
    form.type === "select" ||
    form.type === "card-popup"
  ) {
    return form.multiple === "false" || form.multiple === false
      ? "single-option"
      : "multi-option";
  }
  if (form.type === "radio") return "single-option";
  return "text";
}

/**
 * Card-popup sub-fields are keyed by a short, stable token because the key is
 * used as an Anthropic tool-schema property name, which must match
 * `^[a-zA-Z0-9_.-]{1,64}$` (no `::`, no umlauts, max 64 chars). The real
 * form/option/field identity travels on `target.cardFormUid`/`optionUid`/
 * `cardFieldKey` instead. The same algorithm runs on the frontend mirror so the
 * keys line up. */
export function buildCardSubFieldKey(
  formUid: string,
  optionUid: string,
  cardFieldKey: string,
): string {
  return `cf_${fnv1aBase36(`${formUid}::${optionUid}::${cardFieldKey}`)}`;
}

/** Deterministic FNV-1a (32-bit) hash as base36 — must match the frontend copy. */
function fnv1aBase36(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Auto-derive an extraction field for every pop-up sub-field of every card.
 * Each card option owns a `fields` map (text/textarea/choice/file-upload); we
 * skip file uploads and map choice -> single-option, everything else -> text.
 */
function collectCardSubFields(opts: {
  form: RawRecord;
  questionUid: string;
  formUid: string;
}): Array<[string, ExtractionFieldConfig]> {
  const out: Array<[string, ExtractionFieldConfig]> = [];
  const options = isRecord(opts.form.options) ? opts.form.options : {};

  Object.entries(options).forEach(([optionKey, optionRaw]) => {
    if (!isRecord(optionRaw)) return;
    const optionUid = String(optionRaw.uid ?? optionKey);
    const optionTitle = String(optionRaw.title ?? optionUid);
    const cardFields = isRecord(optionRaw.fields) ? optionRaw.fields : {};

    Object.entries(cardFields).forEach(([cardFieldKey, cardFieldRaw]) => {
      if (!isRecord(cardFieldRaw) || cardFieldRaw.type === "file-upload") return;

      const isChoice = cardFieldRaw.type === "choice";
      const type: ExtractionFieldType = isChoice ? "single-option" : "text";
      const fieldLabel = String(cardFieldRaw.label ?? cardFieldKey);
      const label = `${optionTitle} – ${fieldLabel}`;
      const compositeKey = buildCardSubFieldKey(
        opts.formUid,
        optionUid,
        cardFieldKey,
      );
      const placeholder = stringOrUndefined(cardFieldRaw.placeholder);

      out.push([
        compositeKey,
        {
          label,
          type,
          description: placeholder
            ? `${label} (Detail nur relevant, wenn ${optionTitle} betroffen ist). Beispiel: ${placeholder}`
            : `${label} (Detail nur relevant, wenn ${optionTitle} betroffen ist).`,
          aliases: Array.from(new Set([fieldLabel, optionTitle])),
          instructions: undefined,
          unit: undefined,
          min: undefined,
          max: undefined,
          target: {
            questionUid: opts.questionUid,
            formUid: compositeKey,
            cardFormUid: opts.formUid,
            optionUid,
            cardFieldKey,
          },
          options: isChoice
            ? buildCardChoiceOptions(cardFieldRaw.options)
            : undefined,
        },
      ]);
    });
  });

  return out;
}

function buildCardChoiceOptions(
  options: unknown,
): Record<string, ExtractionOptionConfig> {
  if (!isRecord(options)) return {};
  return Object.fromEntries(
    Object.entries(options).map(([choiceKey, choice]) => {
      const choiceRecord = isRecord(choice) ? choice : {};
      return [
        choiceKey,
        {
          targetOptionUid: choiceKey,
          aliases: [String(choiceRecord.title ?? choiceKey)],
        },
      ];
    }),
  );
}

function normalizeOptionConfig(
  options: unknown,
  form: RawRecord,
): Record<string, ExtractionOptionConfig> {
  if (isRecord(options)) {
    return Object.fromEntries(
      Object.entries(options).map(([optionKey, option]) => {
        const optionRecord = isRecord(option) ? option : {};
        return [
          optionKey,
          {
            targetOptionUid: stringOrFallback(
              optionRecord.targetOptionUid,
              optionKey,
            ),
            aliases: stringArray(optionRecord.aliases),
          },
        ];
      }),
    );
  }

  return Object.fromEntries(
    Object.entries(form.options ?? {})
      .filter(([, option]) => isChoiceOption(option))
      .map(([optionKey, option]) => [
        optionKey,
        {
          targetOptionUid: String((option as RawRecord).uid ?? optionKey),
          aliases: [String((option as RawRecord).title ?? optionKey)],
        },
      ]),
  );
}

function isChoiceOption(option: unknown): option is RawRecord {
  return isRecord(option) && typeof option.title === "string";
}

function isDisabled(value: unknown): boolean {
  return value === false || value === "false";
}

function formLabel(form: RawRecord, fieldKey: string): string {
  return form.title || form.options?.label || fieldKey;
}

function stringOrFallback(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
  return strings.length > 0 ? strings : undefined;
}

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
