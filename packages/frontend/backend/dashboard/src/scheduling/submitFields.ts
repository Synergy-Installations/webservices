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
  rangeValue?: number;
  selectedValue?: number;
  selectedOptions?: string[];
  selectedOptionsUid?: string[];
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
    kwpSel?.rangeValue ??
    kwpSel?.selectedValue ??
    Number(kwpSel?.inputValue) ??
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
