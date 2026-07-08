/**
 * Derive the scheduling-relevant fields from a funnel Submit. The funnel stores
 * answers in the flexible `data` map keyed by dynamic question ids; the stable
 * handle is each form's `uid`. This mirrors the `getSubmitFormInputValueByUid`
 * lookup used in SubmitList, generalised to the value shapes we need.
 *
 * Form uids (from the funnel questions config):
 *   submit-form-name                       → customer name  (text  → inputValue)
 *   submit-form-email / -telephone         → contact        (text)
 *   submit-form-textarea-address           → address        (textarea → inputValue)
 *   interested-products-range-2            → kWp            (range → rangeValue)
 *   interested-products-komponenten-cards  → components     (card  → selectedOptions[])
 */

interface FormSelected {
  inputValue?: string;
  // For a range form `selectedValue` is the actual value the user set (often a
  // locale-formatted string like "4,25"); `rangeValue` is the slider-thumb
  // position (a logarithmic projection on an exp scale — NOT the value). Always
  // read `selectedValue` for the real number.
  rangeValue?: number;
  selectedValue?: number | string;
  selectedOptions?: string[];
  selectedOptionsUid?: string[];
}

/**
 * Parse a possibly locale-formatted number ("4,25", "1.234,5", "1,234.5", 4.25)
 * into a plain number, or undefined if it isn't numeric. Handles both de-AT
 * (comma decimal, dot thousands) and en (dot decimal, comma thousands).
 */
function parseLocaleNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;
  let s = value.trim().replace(/[^\d.,-]/g, "");
  if (!s) return undefined;
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // The right-most separator is the decimal one; strip the other (thousands).
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

const KWP_UID = "interested-products-range-2";
const COMPONENTS_UID = "interested-products-komponenten-cards";
const NAME_UID = "submit-form-name";
const EMAIL_UID = "submit-form-email";
const PHONE_UID = "submit-form-telephone";
const ADDRESS_UID = "submit-form-textarea-address";

/** Return the `selected` payload of the form whose uid matches, if any. */
function getSelectedByUid(
  submit: any,
  formUid: string
): FormSelected | undefined {
  const questions = Object.values(
    (submit?.data ?? {}) as Record<string, { form?: Record<string, any> }>
  );
  for (const question of questions) {
    const form = Object.values(
      (question?.form ?? {}) as Record<
        string,
        { uid?: string; selected?: FormSelected }
      >
    ).find((entry) => entry?.uid === formUid);
    if (form?.selected) return form.selected;
  }
  return undefined;
}

const inputString = (s?: FormSelected): string => s?.inputValue?.trim() ?? "";

export interface SubmitFields {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  kWp: number;
  components: string[];
}

export function extractSubmitFields(submit: any): SubmitFields {
  const kwpSel = getSelectedByUid(submit, KWP_UID);
  const kWp =
    parseLocaleNumber(kwpSel?.selectedValue) ??
    parseLocaleNumber(kwpSel?.inputValue) ??
    0;

  const componentsSel = getSelectedByUid(submit, COMPONENTS_UID);
  const components = componentsSel?.selectedOptions ?? [];

  return {
    customerName: inputString(getSelectedByUid(submit, NAME_UID)),
    email: inputString(getSelectedByUid(submit, EMAIL_UID)) || submit?.emailAddress || "",
    phone: inputString(getSelectedByUid(submit, PHONE_UID)),
    address: inputString(getSelectedByUid(submit, ADDRESS_UID)),
    kWp: Number.isFinite(kWp) ? kWp : 0,
    components,
  };
}
