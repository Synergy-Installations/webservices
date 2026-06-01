import { formatLocaleNumberToUniNumber } from "@com.synergy/frontend-ui/LocaleNumber";
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

export type FunnelPrefillEntry = {
  value: unknown;
  confidence?: number;
  sourceQuote?: string | null;
  sourcePage?: number | null;
  fieldKey?: string;
  documentName?: string;
  fileUid?: string;
  label?: string;
};

export type FunnelPrefillResult = {
  applied: string[];
  skipped: Array<{
    formUid: string;
    label?: string;
    reason: string;
    value: unknown;
  }>;
};

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

export function renderFunnelOptionIcon(option: any): JSX.Element {
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

export function isVisibleEntity(entity: any): boolean {
  return entity?.defaultVisible === true || entity?.defaultVisible === "true";
}

export function isRequiredForm(form: any): boolean {
  return form?.required === true || form?.required === "true";
}

export function isQuestionComplete(question: any): boolean {
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

export function getRenderableQuestionKeys(
  elements: Record<string, any>,
  extractionReviewEnabled = true,
): string[] {
  const visibleQuestionKeys = Object.keys(elements ?? {}).filter(
    (questionKey) => isVisibleEntity(elements[questionKey]),
  );

  if (!extractionReviewEnabled || !isExtractionReviewFlowActive(elements)) {
    return visibleQuestionKeys;
  }

  const reviewQuestionKeys = visibleQuestionKeys.filter((questionKey) =>
    questionHasVisibleNonAiAcceptedForm(elements[questionKey]),
  );

  return reviewQuestionKeys.length > 0
    ? reviewQuestionKeys
    : visibleQuestionKeys;
}

export function getNavigationQuestionKeys(
  elements: Record<string, any>,
  currentQuestionKey?: string,
  extractionReviewEnabled = true,
): string[] {
  const visibleQuestionKeys = Object.keys(elements ?? {}).filter(
    (questionKey) => isVisibleEntity(elements[questionKey]),
  );

  if (!extractionReviewEnabled || !isExtractionReviewFlowActive(elements)) {
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

export function getNavigationFormKeys(
  elements: Record<string, any>,
  questionKey: string,
  currentFormKey?: string,
  extractionReviewEnabled = true,
): string[] {
  const forms = elements[questionKey]?.form ?? {};
  const visibleFormKeys = Object.keys(forms).filter((formKey) =>
    isVisibleEntity(forms[formKey]),
  );

  if (!extractionReviewEnabled || !isExtractionReviewFlowActive(elements)) {
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

export function shouldRenderFunnelForm(
  elements: Record<string, any>,
  questionKey: string,
  formKey: string,
  extractionReviewEnabled = true,
): boolean {
  const form = elements[questionKey]?.form?.[formKey];
  if (!form || !isVisibleEntity(form)) return false;
  if (!extractionReviewEnabled || !isExtractionReviewFlowActive(elements)) {
    return true;
  }

  return !formHasAcceptedExtractionValue(form);
}

export function isExtractionReviewFlowActive(
  elements: Record<string, any>,
): boolean {
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

export function questionHasVisibleNonAiAcceptedForm(question: any): boolean {
  return Object.values(question?.form ?? {}).some(
    (form: any) =>
      isVisibleEntity(form) && !formHasAcceptedExtractionValue(form),
  );
}

export function questionHasLlmFileExtraction(question: any): boolean {
  return Object.values(question?.form ?? {}).some(
    (form: any) => isVisibleEntity(form) && form.type === "llm-file-extraction",
  );
}

export function formNeedsReview(form: any): boolean {
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

export function formHasAcceptedExtractionValue(form: any): boolean {
  return (
    form.extraction?.source === "llm" &&
    formHasUserValue(form) &&
    !formNeedsReview(form)
  );
}

export function markExtractionReviewed(form: any) {
  if (form.extraction?.source === "llm") {
    form.extraction.userReviewed = true;
  }
}

export function applyPrefillToQuestionElements(opts: {
  elements: Record<string, any>;
  prefill: Record<string, FunnelPrefillEntry>;
  context: {
    documentName: string;
    fileUid: string;
    force?: boolean;
    userReviewed?: boolean;
  };
  thresholds: { green: number; yellow: number };
  getAiPrefillWarningMessage?: (label?: string) => string;
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
        : (opts.getAiPrefillWarningMessage?.(entry.label) ??
          `${entry.label ?? "Wert"} wurde von der KI vorausgefüllt. Bitte prüfen.`);
    result.applied.push(formUid);
  });

  return { elements: opts.elements, result };
}

export function findFormByUid(
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

export function recalculateDependentForms(
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

export function applyValueToForm(form: any, value: unknown): boolean {
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

export function formValueMatchesPrefill(form: any, value: unknown): boolean {
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

export function clearFormValue(form: any): void {
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

export function findRuntimeOptionKey(
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

export function formHasUserValue(form: any): boolean {
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

export function rangePositionForValue(form: any, value: number): number {
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

export function getExtractionThresholds(elements: Record<string, any>): {
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

export function confidenceTier(
  confidence: number,
  thresholds: { green: number; yellow: number },
): "green" | "yellow" | "red" {
  if (confidence >= thresholds.green) return "green";
  if (confidence >= thresholds.yellow) return "yellow";
  return "red";
}

export function renderFormRequiredLabel(
  form: any,
  requiredLabel: string,
  optionalLabel: string,
): JSX.Element | null {
  const excludedTypes = ["submit-button", "calculation"];
  if (excludedTypes.includes(form?.type)) return null;
  if (form?.required === true || form?.required === "true") {
    return (
      <span className="inline-flex items-center rounded bg-synergy-light-blue/10 px-1.5 py-0.5 text-xs font-medium text-synergy-light-blue dark:bg-synergy-light-blue/20">
        {requiredLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
      {optionalLabel}
    </span>
  );
}

export function renderExtractionHint(form: any): JSX.Element | null {
  const extraction = form.extraction;
  if (extraction?.source !== "llm") return null;

  return (
    <span className="inline-flex items-center rounded bg-synergy-light-blue/10 px-1.5 py-0.5 text-xs font-medium text-synergy-light-blue">
      KI Ausgefüllt
    </span>
  );
}

export function cloneQuestionElements(
  elements: Record<string, any>,
): Record<string, any> {
  const structuredCloneFn = (globalThis as any).structuredClone;
  if (typeof structuredCloneFn === "function") {
    return structuredCloneFn(elements);
  }
  return JSON.parse(JSON.stringify(elements));
}
