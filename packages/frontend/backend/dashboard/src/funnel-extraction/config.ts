import atATMessages from "@com.synergy/frontend-shared-internationalization/messages/at-AT.json";
import enMessages from "@com.synergy/frontend-shared-internationalization/messages/en.json";
import type { ExtractionConfig } from "./extraction";

type Messages = any;

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
  const question = questions[questionUid];
  const form = question?.form?.[formUid];

  if (form?.type === "llm-file-extraction" && form.options?.extraction) {
    return form.options.extraction as ExtractionConfig;
  }

  for (const [questionKey, candidateQuestion] of Object.entries(questions)) {
    if (questionKey !== questionUid) continue;
    for (const [formKey, candidateForm] of Object.entries(
      (candidateQuestion as any).form ?? {},
    )) {
      if (formKey === formUid && (candidateForm as any).options?.extraction) {
        return (candidateForm as any).options.extraction as ExtractionConfig;
      }
    }
  }

  return null;
}
