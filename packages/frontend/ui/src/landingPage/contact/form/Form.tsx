"use client";

import { useMessages, useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";

/* eslint-disable-next-line */
export interface FormProps {
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const Form = (props: FormProps) => {
  const { STORAGE_ZONE_ACCESS_KEY } = props;

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
        } else if (element.type === "multipleSelection") {
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
            value: [], // Multiple selection starts with empty array
            required: element.required === "true",
          };
        } else if (element.type === "fileUpload") {
          acc[key] = {
            type: element.type,
            label: element.label,
            value: [], // File upload starts with empty array of files
            required: element.required === "true",
            uploadConfig: {
              region: element.region || "",
              hostname: element.hostname || "storage.bunnycdn.com",
              storageZoneName: element.storageZoneName || "",
              accessKey: STORAGE_ZONE_ACCESS_KEY || "",
              maxFileSize: element.maxFileSize || 10485760, // 10MB default
              allowedTypes: Array.isArray(element.allowedTypes)
                ? element.allowedTypes
                : [],
              pullHostName: element.pullHostName || "",
            },
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
  const sectionTitle = t("copy.section.title");
  const sectionDescription = t("copy.section.description");
  const privacyHref = t("legal.href");

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

  // New handler for multiple selection checkboxes
  const handleMultipleChange = (
    elementKey: string,
    element: any,
    optionValue: string,
    isChecked: boolean
  ) => {
    const currentValues = element.value || [];
    let newValues;

    if (isChecked) {
      // Add the option if it's not already in the array
      newValues = currentValues.includes(optionValue)
        ? currentValues
        : [...currentValues, optionValue];
    } else {
      // Remove the option from the array
      newValues = currentValues.filter((val: string) => val !== optionValue);
    }

    setFormElements({
      ...formElements,
      [elementKey]: { ...element, value: newValues },
    });
  };

  // File upload handler
  const handleFileUpload = useCallback((elementKey: string, element: any) => {
    return (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        // Check file size
        if (file.size > element.uploadConfig.maxFileSize) {
          console.error(`File ${file.name} is too large`);
          return;
        }

        const fileName = `/user-upload/contact-form/${elementKey}/synergy-upload-${Math.random().toString(36).substring(2, 7)}-${file.name}`;

        setFormElements((prev: any) => {
          const updatedElements = { ...prev };
          const formElement = updatedElements[elementKey];

          formElement.value = [
            ...formElement.value,
            {
              uid: fileName,
              name: file.name,
              size: file.size,
              type: file.type,
              localUrl: URL.createObjectURL(file),
              status: "uploading",
              downloadUrl: `${element.uploadConfig.pullHostName ? `${element.uploadConfig.pullHostName}.` : ""}${fileName}`,
            },
          ];
          return updatedElements;
        });

        // Upload file
        const reader = new FileReader();
        reader.onload = async () => {
          const binaryStr = reader.result;

          const hostname = element.uploadConfig.region
            ? `${element.uploadConfig.region}.${element.uploadConfig.hostname}`
            : element.uploadConfig.hostname;

          try {
            const response = await fetch(
              `https://${hostname}/${element.uploadConfig.storageZoneName}${fileName}`,
              {
                method: "PUT",
                headers: {
                  AccessKey: STORAGE_ZONE_ACCESS_KEY || "",
                  "Content-Type": "application/octet-stream",
                },
                body: binaryStr,
              }
            );

            setFormElements((prev: any) => {
              const updatedElements = { ...prev };
              const formElement = updatedElements[elementKey];

              const fileIndex = formElement.value.findIndex(
                (f: any) => f.uid === fileName
              );

              if (fileIndex !== -1) {
                formElement.value[fileIndex].status = response.ok
                  ? "uploaded"
                  : "error";
              }
              return updatedElements;
            });
          } catch (error) {
            console.error("File upload failed:", error);
            setFormElements((prev: any) => {
              const updatedElements = { ...prev };
              const formElement = updatedElements[elementKey];

              const fileIndex = formElement.value.findIndex(
                (f: any) => f.uid === fileName
              );

              if (fileIndex !== -1) {
                formElement.value[fileIndex].status = "error";
              }
              return updatedElements;
            });
          }
        };
        reader.readAsArrayBuffer(file);
      });
    };
  }, []);

  // Remove file handler
  const handleFileRemove = (elementKey: string, fileUid: string) => {
    setFormElements((prev: any) => {
      const updatedElements = { ...prev };
      const formElement = updatedElements[elementKey];
      formElement.value = formElement.value.filter(
        (file: any) => file.uid !== fileUid
      );
      return updatedElements;
    });
  };

  const sendEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = formElementKeys.filter((key) => {
      const element = formElements[key];
      if (!element.required) return false;

      // For multiple selection, check if array is empty
      if (element.type === "multipleSelection") {
        return !element.value || element.value.length === 0;
      }

      // For file upload, check if array is empty or has no successfully uploaded files
      if (element.type === "fileUpload") {
        return (
          !element.value ||
          element.value.length === 0 ||
          !element.value.some((file: any) => file.status === "uploaded")
        );
      }

      // For other fields, check if value is empty string
      return element.value === "";
    });
    // console.log("missingFields", missingFields);

    if (missingFields.length > 0) {
      setButtonStatusText({
        fatal: true,
        disabled: false,
        text: t("copy.messages.missingRequired"),
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
            text: t("copy.messages.success"),
          });
        } else {
          setButtonStatusText({
            fatal: true,
            disabled: true,
            text: t("copy.messages.error"),
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
        setButtonStatusText({
          fatal: true,
          disabled: true,
          text: t("copy.messages.error"),
        });
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
              {sectionTitle}
            </h3>
            <div className="w-2 h-2 rounded-full bg-synergy-light-blue"></div>
          </div>
          <p className="text-base text-gray-600 max-w-md mx-auto">
            {sectionDescription}
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
            } else if (element.type === "multipleSelection") {
              return (
                <div key={index} className="group">
                  <label className="block text-sm font-semibold text-synergy-dark-grey mb-3 transition-colors group-focus-within:text-synergy-light-blue">
                    {element.label}
                    {element.required && (
                      <span className="text-synergy-light-blue ml-1">*</span>
                    )}
                  </label>
                  <div className="space-y-3 p-4 max-h-64 overflow-y-auto bg-white border-2 border-synergy-light-grey rounded-xl transition-all duration-200 hover:border-synergy-light-blue/50">
                    {Object.keys(element.options).map(
                      (optionKey, optionIndex) => {
                        const optionValue = element.options[optionKey].text;
                        const isChecked =
                          element.value?.includes(optionValue) || false;

                        return (
                          <label
                            key={optionIndex}
                            className="flex items-center space-x-3 cursor-pointer group/option hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isChecked}
                                onChange={(e) =>
                                  handleMultipleChange(
                                    elementKey,
                                    element,
                                    optionValue,
                                    e.target.checked
                                  )
                                }
                              />
                              <div
                                className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                                  isChecked
                                    ? "bg-synergy-light-blue border-synergy-light-blue"
                                    : "border-synergy-light-grey group-hover/option:border-synergy-light-blue"
                                }`}
                              >
                                {isChecked && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="text-synergy-dark-grey font-medium select-none">
                              {optionValue}
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            } else if (element.type === "fileUpload") {
              return (
                <div key={index} className="group">
                  <label className="block text-sm font-semibold text-synergy-dark-grey mb-3 transition-colors group-focus-within:text-synergy-light-blue">
                    {element.label}
                    {element.required && (
                      <span className="text-synergy-light-blue ml-1">*</span>
                    )}
                  </label>

                  {/* Drag and Drop Upload Area */}
                  <div
                    className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-synergy-light-grey rounded-xl cursor-pointer bg-white hover:bg-gray-50 hover:border-synergy-light-blue/50 transition-all duration-200 group/upload"
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files);
                      handleFileUpload(elementKey, element)(files);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = true;
                      input.accept =
                        element.uploadConfig.allowedTypes.length > 0
                          ? element.uploadConfig.allowedTypes.join(",")
                          : "";
                      input.onchange = (e: any) => {
                        if (e.target.files) {
                          handleFileUpload(
                            elementKey,
                            element
                          )(Array.from(e.target.files));
                        }
                      };
                      input.click();
                    }}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 group-hover/upload:text-synergy-light-blue transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 20 16"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 group-hover/upload:text-synergy-light-blue transition-colors text-center">
                        {t.rich("copy.upload.cta", {
                          strong: (chunks) => (
                            <span className="font-semibold">{chunks}</span>
                          ),
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {element.uploadConfig.allowedTypes.length > 0
                          ? t("copy.upload.allowedTypes", {
                              types: element.uploadConfig.allowedTypes.join(
                                ", "
                              ),
                            })
                          : t("copy.upload.allowedTypesAll")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("copy.upload.maxSize", {
                          size: (
                            element.uploadConfig.maxFileSize / 1048576
                          ).toFixed(1),
                        })}
                      </p>
                    </div>
                  </div>

                  {/* File List */}
                  {element.value && element.value.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {element.value.map((file: any, fileIndex: number) => (
                        <div
                          key={fileIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            {file.type.startsWith("image/") ? (
                              <img
                                src={
                                  file.status === "uploaded"
                                    ? file.downloadUrl
                                    : file.localUrl
                                }
                                alt={file.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <svg
                                className="w-10 h-10 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M20,8.94a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19l-.09,0L13.06,2H7A3,3,0,0,0,4,5V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V9S20,9,20,8.94ZM14,5.41,16.59,8H14ZM18,19a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V5A1,1,0,0,1,7,4h5V9a1,1,0,0,0,1,1h5Z" />
                              </svg>
                            )}
                            <div>
                              <p className="text-sm font-medium text-synergy-dark-grey">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {file.status === "uploading" && (
                                <div className="w-4 h-4 border-2 border-synergy-light-blue border-t-transparent rounded-full animate-spin"></div>
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  file.status === "uploaded"
                                    ? "text-green-600"
                                    : file.status === "error"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {file.status === "uploading"
                                  ? t("copy.fileStatus.uploading")
                                  : file.status === "uploaded"
                                    ? t("copy.fileStatus.uploaded")
                                    : t("copy.fileStatus.error")}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleFileRemove(elementKey, file.uid)
                              }
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
            {t.rich("legal.text", {
              link: (chunks) => (
                <Link
                  className="text-synergy-light-blue hover:text-synergy-light-blue/80 font-medium transition-colors"
                  href={privacyHref}
                >
                  {chunks}
                </Link>
              ),
            })}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
