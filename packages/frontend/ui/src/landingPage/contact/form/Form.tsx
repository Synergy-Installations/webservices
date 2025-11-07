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
            required: element.required === "true",
          };
        } else {
          acc[key] = {
            type: element.type,
            label: element.label,
            placeholder: element.placeholder,
            value: element.defaultValue ? element.defaultValue : "",
            required: element.required === "true",
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
    element: any,
    timeout: number = 300
  ) => {
    if (timeout === 0) {
      console.log("Immediate update for", elementKey, e.target.value);
      setFormElements({
        ...formElements,
        [elementKey]: { ...element, value: e.target.value },
      });
      return;
    }
    // Clear the previous timeout if it exists
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      setFormElements({
        ...formElements,
        [elementKey]: { ...element, value: e.target.value },
      });
    }, timeout);
  };

  const sendEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = formElementKeys.filter(
      (key) => formElements[key].required && formElements[key].value === ""
    );
    // console.log("missingFields", missingFields);

    if (missingFields.length > 0) {
      setButtonStatusText({
        fatal: true,
        disabled: false,
        text: "Bitte füllen Sie alle erforderlichen Felder aus.",
      });
      return;
    }

    setButtonStatusText((elements) => ({ ...elements, disabled: true }));
    console.log("formElements", formElements);

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
    console.log("body", body);

    const res = await fetch("/api/contact/submitForm", {
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.status == 200) {
          setButtonStatusText({
            fatal: false,
            disabled: true,
            text: "Danke für Ihre Anfrage. Bitte überprüfen Sie Ihre Inbox. Falls die Nachricht nicht angekommen ist, benutzen Sie bitte die unten angegebene E-Mail.",
          });
        } else {
          setButtonStatusText({
            fatal: true,
            disabled: true,
            text: "Es konnte nicht abgeschickt werden, bitte benutzen Sie die E-Mail unten.",
          });
        }
        // setButtonStatusText({
        //   fatal: false,
        //   disabled: true,
        //   text: "Danke für Ihre Anfrage. Bitte überprüfen Sie Ihre Inbox. Falls die Nachricht nicht angekommen ist, benutzen Sie bitte die unten angegebene E-Mail.",
        // });
        // setFormElements((prevFormElements) =>
        //   Object.keys(prevFormElements).reduce(
        //     (acc: Record<string, any>, key: string) => {
        //       acc[key] = { ...prevFormElements[key], value: "" };
        //       return acc;
        //     },
        //     {}
        //   )
        // );
      })
      .catch((error) => {
        console.error("Error sending email", error);
        // setButtonStatusText({
        //   fatal: true,
        //   disabled: true,
        //   text: "Es konnte nicht abgeschickt werden, bitte benutzen Sie die E-Mail unten.",
        // });
      });
    // You can handle res as you want
  };

  return (
    <div className="max-w-lg mx-auto">
      <form className="space-y-8">
        {/* Optional subtle header without container */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-synergy-light-blue"></div>
            <h3 className="text-2xl font-semibold text-synergy-dark-grey">
              Kontakt aufnehmen
            </h3>
            <div className="w-2 h-2 rounded-full bg-synergy-light-blue"></div>
          </div>
          <p className="text-base text-gray-600 max-w-md mx-auto">
            Wir freuen uns auf Ihre Anfrage und melden uns schnellstmöglich bei
            Ihnen.
          </p>
        </div>

        <div className="space-y-6">
          {formElementKeys.map((elementKey, index) => {
            const element = formElements[elementKey];
            if (element.type === "selection") {
              return (
                <div key={index} className="group">
                  <label
                    className="block text-sm font-semibold text-synergy-dark-grey mb-3 transition-colors group-focus-within:text-synergy-light-blue"
                    htmlFor={elementKey}
                  >
                    {element.label}
                    {element.required && (
                      <span className="text-synergy-light-blue ml-1">*</span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      id={elementKey}
                      className="w-full px-4 py-4 bg-white border-2 border-synergy-light-grey rounded-xl text-synergy-dark-grey font-medium transition-all duration-200 focus:border-synergy-light-blue focus:outline-none focus:ring-4 focus:ring-synergy-light-blue/20 hover:border-synergy-light-blue/50 appearance-none cursor-pointer shadow-sm"
                      required={element.required}
                      onChange={(e) => handleChange(e, elementKey, element)}
                    >
                      {Object.keys(element.options).map((optionKey, index) => (
                        <option key={index} className="font-medium py-2">
                          {element.options[optionKey].text}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-synergy-dark-grey"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            } else if (element.type === "textarea") {
              return (
                <div key={index} className="group">
                  <label
                    className="block text-sm font-semibold text-synergy-dark-grey mb-3 transition-colors group-focus-within:text-synergy-light-blue"
                    htmlFor={elementKey}
                  >
                    {element.label}
                    {element.required && (
                      <span className="text-synergy-light-blue ml-1">*</span>
                    )}
                  </label>
                  <textarea
                    id={elementKey}
                    className="w-full px-4 py-4 bg-white border-2 border-synergy-light-grey rounded-xl text-synergy-dark-grey placeholder-gray-400 transition-all duration-200 focus:border-synergy-light-blue focus:outline-none focus:ring-4 focus:ring-synergy-light-blue/20 hover:border-synergy-light-blue/50 resize-none shadow-sm"
                    rows={5}
                    value={element.value}
                    onChange={(e) => handleChange(e, elementKey, element, 0)}
                    placeholder={element.placeholder}
                    required={element.required}
                  ></textarea>
                </div>
              );
            } else {
              return (
                <div key={index} className="group">
                  <label
                    className="block text-sm font-semibold text-synergy-dark-grey mb-3 transition-colors group-focus-within:text-synergy-light-blue"
                    htmlFor={elementKey}
                  >
                    {element.label}
                    {element.required && (
                      <span className="text-synergy-light-blue ml-1">*</span>
                    )}
                  </label>
                  <input
                    id={elementKey}
                    className="w-full px-4 py-4 bg-white border-2 border-synergy-light-grey rounded-xl text-synergy-dark-grey placeholder-gray-400 transition-all duration-200 focus:border-synergy-light-blue focus:outline-none focus:ring-4 focus:ring-synergy-light-blue/20 hover:border-synergy-light-blue/50 shadow-sm"
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

        <div className="space-y-2 pt-4">
          <button
            type="submit"
            onClick={(e) => sendEmail(e)}
            className="w-full !rounded-[10px] backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue text-white font-semibold py-4 px-6 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-synergy-light-blue/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 shadow-lg"
            disabled={buttonStatusText.disabled}
          >
            <span className="flex items-center justify-center space-x-2">
              <span>{t("button.text")}</span>
              {!buttonStatusText.disabled && (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </span>
          </button>

          {buttonStatusText.text && (
            <div
              className={`p-4 rounded-xl text-sm font-medium text-center shadow-sm ${
                buttonStatusText.fatal
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {buttonStatusText.text}
            </div>
          )}
        </div>

        {/* Footer without background container */}
        <div className="text-center">
          <div className="text-xs text-gray-500">
            Mit dem Absenden stimmen Sie unseren{" "}
            <Link
              className="text-synergy-light-blue hover:text-synergy-light-blue/80 font-medium transition-colors"
              href="/datenschutz"
            >
              Datenschutzrichtlinien
            </Link>{" "}
            zu.
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
