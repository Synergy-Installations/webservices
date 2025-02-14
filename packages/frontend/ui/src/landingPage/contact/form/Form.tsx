"use client";

import { useMessages, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";

/* eslint-disable-next-line */
export interface FormProps {}

export const Form = (props: FormProps) => {
  const t = useTranslations("LandingPage.ContactUs.Form");

  const [buttonStatusText, setButtonStatusText] = useState<{
    fatal: boolean;
    disabled: boolean;
    text: string;
  }>({
    fatal: false,
    disabled: false,
    text: "",
  });

  const messages: any = useMessages();
  const [formElements, setFormElements] = useState<Record<string, any>>(
    Object.keys(messages.LandingPage.ContactUs.Form.elements).reduce(
      (acc: any, key: string) => {
        const element = messages.LandingPage.ContactUs.Form.elements[key];
        if (element.type === "selection") {
          acc[key] = {
            type: element.type,
            label: element.label,
            options: Object.keys(element.options).reduce(
              (optionsAcc: any, optionKey: string) => {
                optionsAcc[optionKey] = {
                  text: element.options[optionKey].text,
                };
                return optionsAcc;
              },
              {}
            ),
            value: element.options[Object.keys(element.options)[0]].text,
            required: element.optional === "true",
          };
        } else {
          acc[key] = {
            type: element.type,
            label: element.label,
            placeholder: element.placeholder,
            value: "",
            required: element.optional === "true",
          };
        }
        return acc;
      },
      {}
    )
  );

  const formElementKeys = Object.keys(formElements);

  // const getProductBoxKeys = (boxKey: string) =>
  //   Object.keys(messages.LandingPage.Products.ProductCards[productKey][boxKey]);

  // const getProductBoxKeyLength = (boxKey: string) =>
  //   Object.keys(messages.LandingPage.Products.ProductCards[productKey][boxKey])
  //     .length;

  // let orientationRight = t(`${productKey}.orientation`) === "right";

  let debounceTimeout: NodeJS.Timeout;
  const handleChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
    elementKey: any,
    element: any
  ) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      setFormElements({
        ...formElements,
        [elementKey]: { ...element, value: e.target.value },
      });
    }, 300);
  };

  const sendEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setButtonStatusText((elements) => ({ ...elements, disabled: true }));

    const body = {
      to: formElements.email.value,
      message: formElements.message.value,
      formData: Object.keys(formElements).reduce((acc: any, key: string) => {
        /** Keep duplicates out if necessary */
        if (key !== "") {
          acc[key] = formElements[key].value;
        }
        return acc;
      }, {}),
    };


    const res = await fetch("/api/contact/submitForm", {
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((res) => {
        setButtonStatusText({
          fatal: false,
          disabled: true,
          text: "Danke für Ihre Anfrage. Bitte überprüfen Sie Ihre Inbox. Falls die Nachricht nicht angekommen ist, benutzen Sie bitte die unten angegebene E-Mail.",
        });
        setFormElements((prevFormElements) =>
          Object.keys(prevFormElements).reduce(
            (acc: Record<string, any>, key: string) => {
              acc[key] = { ...prevFormElements[key], value: "" };
              return acc;
            },
            {}
          )
        );
      })
      .catch((error) => {
        setButtonStatusText({
          fatal: true,
          disabled: true,
          text: "Es konnte nicht abgeschickt werden, bitte benutzen Sie die E-Mail unten.",
        });
      });
    // You can handle res as you want
  };

  return (
    <div className="max-w-[25rem] mx-auto p-6 rounded-lg shadow-2xl bg-gradient-to-b from-slate-100 to-slate-50/.7 relative before:absolute before:-top-12 before:-left-16 before:w-96 before:h-96 before:bg-slate-900 before:opacity-[.15] before:rounded-full before:blur-3xl before:-z-10">
      <form>
        <div className="space-y-4">
          {formElementKeys.map((elementKey, index) => {
            const element = formElements[elementKey];
            if (element.type === "selection") {
              return (
                <div key={index}>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor={elementKey}
                  >
                    {element.label}
                  </label>
                  <select
                    id={elementKey}
                    className="form-select w-full"
                    required={element.required}
                    onChange={(e) => handleChange(e, elementKey, element)}
                  >
                    {Object.keys(element.options).map((optionKey, index) => (
                      <option key={index}>
                        {element.options[optionKey].text}
                      </option>
                    ))}
                  </select>
                </div>
              );
            } else if (element.type === "textarea") {
              return (
                <div key={index}>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor={elementKey}
                  >
                    {element.label}
                  </label>
                  <textarea
                    id={elementKey}
                    className="form-textarea text-sm w-full"
                    rows={4}
                    onChange={(e) => handleChange(e, elementKey, element)}
                    placeholder={element.placeholder}
                    required={element.required}
                  ></textarea>
                </div>
              );
            } else {
              return (
                <div key={index}>
                  <label
                    className="block text-sm text-slate-800 font-medium mb-2"
                    htmlFor={elementKey}
                  >
                    {element.label}
                  </label>
                  <input
                    id={elementKey}
                    className="form-input text-sm w-full"
                    type="text"
                    onChange={(e) => handleChange(e, elementKey, element)}
                    placeholder={element.placeholder}
                    required={element.required}
                  />
                </div>
              );
            }
          })}
        </div>
        <div className="mt-5">
          <button
            type="submit"
            onClick={(e) => sendEmail(e)}
            className="btn text-slate-100 bg-slate-900 hover:bg-slate-800 w-full shadow disabled:cursor-not-allowed"
            disabled={buttonStatusText.disabled}
          >
            {t("button.text")}
          </button>
          <div
            className={`${buttonStatusText.fatal ? "text-red-500" : "text-green-500"} text-center mt-2`}
          >
            {buttonStatusText.text}
          </div>
        </div>
      </form>

      <div className="text-center mt-6">
        <div className="text-xs text-slate-500">
          Mit dem Absenden stimmen Sie unseren{" "}
          <Link className="underline hover:no-underline" href="/datenschutz">
            Datenschutzrichtlinien
          </Link>{" "}
          zu.
        </div>
      </div>
    </div>
  );
};

export default Form;
