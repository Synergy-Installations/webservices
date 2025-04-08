export const createQuestionElement = (
  questionKeyRef: string,
  question: any,
  from?: Array<string> | null,
  convertVisiblityToTrue?: boolean
) => {
  const element = question;
  const questionKey: string =
    Object.keys(question).find((key) => key === questionKeyRef) ||
    questionKeyRef;

  // Convert visibility to true by default
  convertVisiblityToTrue =
    convertVisiblityToTrue === undefined ? true : convertVisiblityToTrue;
  return {
    title: element.title,
    description: element.description,
    from: from || [],
    uid: questionKey,
    version: element.version,
    defaultVisible:
      element.defaultVisible === "false" && convertVisiblityToTrue
        ? true
        : element.defaultVisible === "true",
    form: Object.keys(element.form).reduce(
      (formAcc: Record<string, any>, formKey: string) => {
        if (
          element.form[formKey].type === "checkbox" ||
          element.form[formKey].type === "radio"
        ) {
          formAcc[`${formKey}-${Math.random().toString(36).substring(2, 7)}`] =
            {
              order: Number(element.form[formKey].order),
              uid: formKey,
              type: element.form[formKey].type,
              multiple: element.form[formKey].multiple === "true",
              required: element.form[formKey].required === "true",
              defaultVisible: element.form[formKey].defaultVisible === "true",
              title: element.form[formKey].title,
              description: element.form[formKey].description,
              from: from || [],
              localStorage: element.form[formKey].localStorage === "true",
              span: element.form[formKey].span,
              message: {
                text: element.form[formKey].message.text,
                type: element.form[formKey].message.type,
                requiredMessage: element.form[formKey].message.requiredMessage,
                successMessage: element.form[formKey].message.successMessage,
                checkPreviousFormsMessage:
                  element.form[formKey].message.checkPreviousFormsMessage,
              },
              options: Object.keys(element.form[formKey].options).reduce(
                (optionsAcc: any, optionKey: string) => {
                  optionsAcc[
                    `${optionKey}-${Math.random().toString(36).substring(2, 7)}`
                  ] = {
                    text: element.form[formKey].options[optionKey].title,
                    type: element.form[formKey].options[optionKey].type,
                    uid: optionKey,
                    title: element.form[formKey].options[optionKey].title,
                    disabled:
                      element.form[formKey].options[optionKey].disabled ===
                      "true",
                    span: element.form[formKey].options[optionKey].span,
                    description:
                      element.form[formKey].options[optionKey].description,
                    addQuestion:
                      element.form[formKey].options[optionKey].addQuestion,
                    addForm: element.form[formKey].options[optionKey].addForm,
                    icon: {
                      src: element.form[formKey].options[optionKey].icon.src,
                      alt: element.form[formKey].options[optionKey].icon.alt,
                    },
                  };
                  return optionsAcc;
                },
                {}
              ),
              selected: {
                questionTitle: element.form[formKey].title,
                selectedOptions: [],
                selectedOptionsUid: [],
              },
            };
        } else if (element.form[formKey].type === "select") {
          formAcc[`${formKey}-${Math.random().toString(36).substring(2, 7)}`] =
            {
              order: Number(element.form[formKey].order),
              uid: formKey,
              type: element.form[formKey].type,
              multiple: element.form[formKey].multiple === "true",
              required: element.form[formKey].required === "true",
              defaultVisible: element.form[formKey].defaultVisible === "true",
              title: element.form[formKey].title,
              description: element.form[formKey].description,
              localStorage: element.form[formKey].localStorage === "true",
              span: element.form[formKey].span,
              defaultValue: element.form[formKey].defaultValue,
              label: element.form[formKey].label,
              from: from || [],
              message: {
                text: element.form[formKey].message.text,
                type: element.form[formKey].message.type,
                requiredMessage: element.form[formKey].message.requiredMessage,
                successMessage: element.form[formKey].message.successMessage,
                checkPreviousFormsMessage:
                  element.form[formKey].message.checkPreviousFormsMessage,
              },
              options: Object.keys(element.form[formKey].options).reduce(
                (optionsAcc: any, optionKey: string) => {
                  optionsAcc[
                    `${optionKey}-${Math.random().toString(36).substring(2, 7)}`
                  ] = {
                    type: element.form[formKey].options[optionKey].type,
                    title: element.form[formKey].options[optionKey].title,
                    value: element.form[formKey].options[optionKey].value,
                    uid: optionKey,
                    addQuestion:
                      element.form[formKey].options[optionKey].addQuestion,
                    addForm: element.form[formKey].options[optionKey].addForm,
                  };
                  return optionsAcc;
                },
                {}
              ),
              selected: {
                questionTitle: element.form[formKey].label,
                selectedOptions:
                  typeof window !== "undefined"
                    ? localStorage
                        .getItem(`${questionKey}-${formKey}`)
                        ?.split(",") || []
                    : element.form[formKey].defaultValue,
                selectedOptionsUid: [],
              },
            };
        } else if (element.form[formKey].type === "range") {
          formAcc[`${formKey}-${Math.random().toString(36).substring(2, 7)}`] =
            {
              order: Number(element.form[formKey].order),
              uid: formKey,
              type: element.form[formKey].type,
              required: element.form[formKey].required === "true",
              defaultVisible: element.form[formKey].defaultVisible === "true",
              title: element.form[formKey].title,
              description: element.form[formKey].description,
              localStorage: element.form[formKey].localStorage === "true",
              span: element.form[formKey].span,
              from: from || [],
              message: {
                text: element.form[formKey].message.text,
                type: element.form[formKey].message.type,
                requiredMessage: element.form[formKey].message.requiredMessage,
                successMessage: element.form[formKey].message.successMessage,
                checkPreviousFormsMessage:
                  element.form[formKey].message.checkPreviousFormsMessage,
              },
              options: {
                buttons: {
                  incrementBy: Number(
                    element.form[formKey].options.buttons.incrementBy
                  ),
                  decrementBy: Number(
                    element.form[formKey].options.buttons.decrementBy
                  ),
                },
                range: {
                  defaultValue: Number(
                    element.form[formKey].options.range.defaultValue
                  ),
                  min: Number(element.form[formKey].options.range.min),
                  max: Number(element.form[formKey].options.range.max),
                  step: Number(element.form[formKey].options.range.step),
                  type: element.form[formKey].options.range.type,
                },
                unit: {
                  value: element.form[formKey].options.unit.value,
                  spaceBetween:
                    element.form[formKey].options.unit.spaceBetween === "true",
                  position: element.form[formKey].options.unit.position,
                  numberFormat: element.form[formKey].options.unit.numberFormat,
                },
                labels: Object.keys(
                  element.form[formKey].options.labels
                ).reduce((lablesAcc: any, labelKey: string) => {
                  lablesAcc[
                    `${labelKey}-${Math.random().toString(36).substring(2, 7)}`
                  ] = {
                    text: element.form[formKey].options.labels[labelKey].text,
                    uid: labelKey,
                    value: Number(
                      element.form[formKey].options.labels[labelKey].value
                    ),
                    align: element.form[formKey].options.labels[labelKey].align,
                    offsetX:
                      element.form[formKey].options.labels[labelKey].offsetX,
                    correctX:
                      element.form[formKey].options.labels[labelKey].correctX,
                  };
                  return lablesAcc;
                }, {}),
              },
              selected: {
                questionTitle: element.form[formKey].title,
                selectedValue: element.form[formKey].options.range.defaultValue,
                rangeValue: Number(
                  element.form[formKey].options.range.defaultValue
                ),
              },
            };
        } else if (
          element.form[formKey].type === "text" ||
          element.form[formKey].type === "email" ||
          element.form[formKey].type === "tel" ||
          element.form[formKey].type === "textarea"
        ) {
          formAcc[`${formKey}-${Math.random().toString(36).substring(2, 7)}`] =
            {
              order: Number(element.form[formKey].order),
              uid: formKey,
              type: element.form[formKey].type,
              required: element.form[formKey].required === "true",
              defaultVisible: element.form[formKey].defaultVisible === "true",
              title: element.form[formKey].title,
              description: element.form[formKey].description,
              localStorage: element.form[formKey].localStorage === "true",
              span: element.form[formKey].span,
              from: from || [],
              message: {
                text: element.form[formKey].message.text,
                type: element.form[formKey].message.type,
                requiredMessage: element.form[formKey].message.requiredMessage,
                successMessage: element.form[formKey].message.successMessage,
                checkPreviousFormsMessage:
                  element.form[formKey].message.checkPreviousFormsMessage,
              },
              options: {
                label: element.form[formKey].options.label,
                placeholder: element.form[formKey].options.placeholder,
                rows:
                  element.form[formKey].type === "textarea"
                    ? Number(element.form[formKey].options.rows)
                    : 1,
              },
              selected: {
                questionTitle:
                  element.form[formKey].title === ""
                    ? element.form[formKey].options.label
                    : element.form[formKey].title,
                inputValue:
                  typeof window !== "undefined"
                    ? localStorage.getItem(`${questionKey}-${formKey}`) || ""
                    : "",
              },
            };
        } else if (element.form[formKey].type === "submit-button") {
          formAcc[`${formKey}-${Math.random().toString(36).substring(2, 7)}`] =
            {
              order: Number(element.form[formKey].order),
              uid: formKey,
              type: element.form[formKey].type,
              required: element.form[formKey].required === "true",
              defaultVisible: element.form[formKey].defaultVisible === "true",
              title: element.form[formKey].title,
              description: element.form[formKey].description,
              localStorage: element.form[formKey].localStorage === "true",
              span: element.form[formKey].span,
              from: from || [],
              message: {
                text: element.form[formKey].message.text,
                type: element.form[formKey].message.type,
                errorMessage: element.form[formKey].message.errorMessage,
                successMessage: element.form[formKey].message.successMessage,
                loadingMessage: element.form[formKey].message.loadingMessage,
                checkPreviousFormsMessage:
                  element.form[formKey].message.checkPreviousFormsMessage,
              },
              options: {
                button: {
                  text: element.form[formKey].options.button.text,
                },
              },
              /** There is no need for selected as the button does not hold any
               * values from the user.
               */
            };
        } else if (element.form[formKey].type === "calculation") {
          formAcc[`${formKey}-${Math.random().toString(36).substring(2, 7)}`] =
            {
              order: Number(element.form[formKey].order),
              uid: formKey,
              type: element.form[formKey].type,
              required: element.form[formKey].required === "true",
              defaultVisible: element.form[formKey].defaultVisible === "true",
              title: element.form[formKey].title,
              description: element.form[formKey].description,
              localStorage: element.form[formKey].localStorage === "true",
              span: element.form[formKey].span,
              from: from || [],
              message: {
                text: element.form[formKey].message.text,
                type: element.form[formKey].message.type,
                errorMessage: element.form[formKey].message.errorMessage,
                successMessage: element.form[formKey].message.successMessage,
                loadingMessage: element.form[formKey].message.loadingMessage,
                checkPreviousFormsMessage:
                  element.form[formKey].message.checkPreviousFormsMessage,
              },
              options: {
                inputForm: {
                  questionKey:
                    element.form[formKey].options.inputForm.questionKey,
                  formKey: element.form[formKey].options.inputForm.formKey,
                },
                maths: {
                  type: element.form[formKey].options.maths.type,
                  formula: element.form[formKey].options.maths.formula,
                  unit: element.form[formKey].options.maths.unit,
                  spaceBetween:
                    element.form[formKey].options.maths.spaceBetween === "true",
                  position: element.form[formKey].options.maths.position,
                },
                afterMaths: {
                  before: element.form[formKey].options.afterMaths.before,
                  after: element.form[formKey].options.afterMaths.after,
                },
              },
              selected: {
                questionTitle: element.form[formKey].title,
                inputValue: "0",
              },
            };
        } else if (element.form[formKey].type === "file-upload") {
          formAcc[`${formKey}-${Math.random().toString(36).substring(2, 7)}`] =
            {
              order: Number(element.form[formKey].order),
              uid: formKey,
              type: element.form[formKey].type,
              required: element.form[formKey].required === "true",
              defaultVisible: element.form[formKey].defaultVisible === "true",
              title: element.form[formKey].title,
              description: element.form[formKey].description,
              localStorage: element.form[formKey].localStorage === "true",
              span: element.form[formKey].span,
              from: from || [],
              message: {
                text: element.form[formKey].message.text,
                type: element.form[formKey].message.type,
                errorMessage: element.form[formKey].message.errorMessage,
                successMessage: element.form[formKey].message.successMessage,
                loadingMessage: element.form[formKey].message.loadingMessage,
                checkPreviousFormsMessage:
                  element.form[formKey].message.checkPreviousFormsMessage,
              },
              options: {
                upload: {
                  hostname: element.form[formKey].options.upload.hostname,
                  storageZoneName:
                    element.form[formKey].options.upload.storageZoneName,
                  region: element.form[formKey].options.upload.region,
                  filesAccepted:
                    element.form[formKey].options.upload.filesAccepted,
                  multipleFiles:
                    element.form[formKey].options.upload.multipleFiles,
                  uploadingText:
                    element.form[formKey].options.upload.uploadingText,
                  uploadError: element.form[formKey].options.upload.uploadError,
                  uploadSuccess:
                    element.form[formKey].options.upload.uploadSuccess,
                },
                download: {
                  pullHostName:
                    element.form[formKey].options.download.pullHostName,
                },
              },
              selected: {
                questionTitle: element.form[formKey].title,
                selectedFiles: [],
              },
            };
        } else if (element.form[formKey].type === "calendly") {
          formAcc[`${formKey}-${Math.random().toString(36).substring(2, 7)}`] =
            {
              order: Number(element.form[formKey].order),
              uid: formKey,
              type: element.form[formKey].type,
              required: element.form[formKey].required === "true",
              defaultVisible: element.form[formKey].defaultVisible === "true",
              title: element.form[formKey].title,
              description: element.form[formKey].description,
              localStorage: element.form[formKey].localStorage === "true",
              span: element.form[formKey].span,
              from: from || [],
              message: {
                text: element.form[formKey].message.text,
                type: element.form[formKey].message.type,
                requiredMessage: element.form[formKey].message.requiredMessage,
                successMessage: element.form[formKey].message.successMessage,
                checkPreviousFormsMessage:
                  element.form[formKey].message.checkPreviousFormsMessage,
              },
              options: {
                embed: {
                  url: element.form[formKey].options.embed.url,
                },
                prefill: {
                  email: {
                    formKey:
                      element.form[formKey].options.prefill.email.formKey,
                  },
                  name: {
                    formKey: element.form[formKey].options.prefill.name.formKey,
                  },
                  phone: {
                    formKey:
                      element.form[formKey].options.prefill.phone.formKey,
                  },
                },
              },
              selected: {
                questionTitle: element.form[formKey].title,
                scheduledEvent: { event: { uri: "" }, invitee: { uri: "" } },
              },
            };
        }
        return formAcc;
      },
      {}
    ),
  };
};

export const createFormElement = (
  questionKey: string,
  formKeyRef: string,
  form: any,
  from?: Array<string> | null,
  convertVisiblityToTrue?: boolean
) => {
  // console.log(
  //   "createFormElement",
  //   questionKey,
  //   formKey,
  //   from,
  //   messages.LandingPage.ContactUs.Funnel.questions[questionKey].form
  // );
  const element = form;

  // TODO: Impement formKey verification and error if formKeyRef deviates from (to be created) formKey
  const formKey: string =
    Object.keys(form).find((key) => key === formKeyRef) || formKeyRef;

  // Convert visibility to true by default
  convertVisiblityToTrue =
    convertVisiblityToTrue === undefined ? true : convertVisiblityToTrue;

  if (element.type === "checkbox" || element.type === "radio") {
    return {
      order: Number(element.order),
      uid: formKey,
      type: element.type,
      multiple: element.multiple,
      required: element.required === "true",
      defaultVisible:
        element.defaultVisible === "false" && convertVisiblityToTrue
          ? true
          : element.defaultVisible === "true",
      title: element.title,
      description: element.description,
      localStorage: element.localStorage === "true",
      span: element.span,
      from: from || [],
      message: {
        text: element.message.text,
        type: element.message.type,
        requiredMessage: element.message.requiredMessage,
        successMessage: element.message.successMessage,
        checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
      },
      options: Object.keys(element.options).reduce(
        (optionsAcc: any, optionKey: string) => {
          optionsAcc[
            `${optionKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            text: element.options[optionKey].title,
            type: element.options[optionKey].type,
            uid: optionKey,
            title: element.options[optionKey].title,
            disabled: element.options[optionKey].disabled === "true",
            span: element.options[optionKey].span,
            description: element.options[optionKey].description,
            addQuestion: element.options[optionKey].addQuestion,
            addForm: element.options[optionKey].addForm,
            icon: {
              src: element.options[optionKey].icon.src,
              alt: element.options[optionKey].icon.alt,
            },
          };
          return optionsAcc;
        },
        {}
      ),
      selected: {
        questionTitle: element.title,
        selectedOptions: [],
        selectedOptionsUid: [],
      },
    };
  } else if (element.type === "select") {
    return {
      order: Number(element.order),
      uid: formKey,
      type: element.type,
      multiple: element.multiple === "true",
      required: element.required === "true",
      defaultVisible:
        element.defaultVisible === "false" && convertVisiblityToTrue
          ? true
          : element.defaultVisible === "true",
      title: element.title,
      description: element.description,
      localStorage: element.localStorage === "true",
      span: element.span,
      defaultValue: element.defaultValue,
      label: element.label,
      from: from || [],
      message: {
        text: element.message.text,
        type: element.message.type,
        requiredMessage: element.message.requiredMessage,
        successMessage: element.message.successMessage,
        checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
      },
      options: Object.keys(element.options).reduce(
        (optionsAcc: any, optionKey: string) => {
          optionsAcc[
            `${optionKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            type: element.options[optionKey].type,
            title: element.options[optionKey].title,
            value: element.options[optionKey].value,
            uid: optionKey,
            addQuestion: element.options[optionKey].addQuestion,
            addForm: element.options[optionKey].addForm,
          };
          return optionsAcc;
        },
        {}
      ),
      selected: {
        questionTitle: element.label,
        selectedOptions:
          typeof window !== "undefined"
            ? localStorage.getItem(`${questionKey}-${formKey}`)?.split(",") ||
              []
            : [],
        selectedOptionsUid: [],
      },
    };
  } else if (element.type === "range") {
    return {
      order: Number(element.order),
      uid: formKey,
      type: element.type,
      required: element.required === "true",
      defaultVisible:
        element.defaultVisible === "false" && convertVisiblityToTrue
          ? true
          : element.defaultVisible === "true",
      title: element.title,
      description: element.description,
      localStorage: element.localStorage === "true",
      span: element.span,
      from: from || [],
      message: {
        text: element.message.text,
        type: element.message.type,
        requiredMessage: element.message.requiredMessage,
        successMessage: element.message.successMessage,
        checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
      },
      options: {
        buttons: {
          incrementBy: Number(element.options.buttons.incrementBy),
          decrementBy: Number(element.options.buttons.decrementBy),
        },
        range: {
          defaultValue: Number(element.options.range.defaultValue),
          min: Number(element.options.range.min),
          max: Number(element.options.range.max),
          step: Number(element.options.range.step),
          type: element.options.range.type,
        },
        unit: {
          value: element.options.unit.value,
          spaceBetween: element.options.unit.spaceBetween === "true",
          position: element.options.unit.position,
          numberFormat: element.options.unit.numberFormat,
        },
        labels: Object.keys(element.options.labels).reduce(
          (lablesAcc: any, labelKey: string) => {
            lablesAcc[
              `${labelKey}-${Math.random().toString(36).substring(2, 7)}`
            ] = {
              text: element.options.labels[labelKey].text,
              uid: labelKey,
              value: Number(element.options.labels[labelKey].value),
              align: element.options.labels[labelKey].align,
              offsetX: element.options.labels[labelKey].offsetX,
              correctX: element.options.labels[labelKey].correctX,
            };
            return lablesAcc;
          },
          {}
        ),
      },
      selected: {
        questionTitle: element.title,
        selectedValue: element.options.range.defaultValue,
        rangeValue: Number(element.options.range.defaultValue),
      },
    };
  } else if (
    element.type === "text" ||
    element.type === "email" ||
    element.type === "tel" ||
    element.type === "textarea"
  ) {
    return {
      order: Number(element.order),
      uid: formKey,
      type: element.type,
      required: element.required === "true",
      defaultVisible:
        element.defaultVisible === "false" && convertVisiblityToTrue
          ? true
          : element.defaultVisible === "true",
      title: element.title,
      description: element.description,
      localStorage: element.localStorage === "true",
      span: element.span,
      from: from || [],
      message: {
        text: element.message.text,
        type: element.message.type,
        requiredMessage: element.message.requiredMessage,
        successMessage: element.message.successMessage,
        checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
      },
      options: {
        label: element.options.label,
        placeholder: element.options.placeholder,
        rows: element.type === "textarea" ? Number(element.options.rows) : 1,
      },
      selected: {
        questionTitle:
          element.title === "" ? element.options.label : element.title,
        inputValue:
          typeof window !== "undefined"
            ? localStorage.getItem(`${questionKey}-${formKey}`) || ""
            : "",
      },
    };
  } else if (element.type === "submit-button") {
    return {
      order: Number(element.order),
      uid: formKey,
      type: element.type,
      required: element.required === "true",
      defaultVisible:
        element.defaultVisible === "false" && convertVisiblityToTrue
          ? true
          : element.defaultVisible === "true",
      title: element.title,
      description: element.description,
      localStorage: element.localStorage === "true",
      span: element.span,
      from: from || [],
      message: {
        text: element.message.text,
        type: element.message.type,
        errorMessage: element.message.errorMessage,
        successMessage: element.message.successMessage,
        loadingMessage: element.message.loadingMessage,
        checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
      },
      options: {
        button: {
          text: element.options.button.text,
        },
      },
      /** There is no need for selected as the button does not hold any
       * values from the user.
       */
    };
  } else if (element.type === "calculation") {
    return {
      order: Number(element.order),
      uid: formKey,
      type: element.type,
      required: element.required === "true",
      defaultVisible:
        element.defaultVisible === "false" && convertVisiblityToTrue
          ? true
          : element.defaultVisible === "true",
      title: element.title,
      description: element.description,
      localStorage: element.localStorage === "true",
      span: element.span,
      from: from || [],
      message: {
        text: element.message.text,
        type: element.message.type,
        errorMessage: element.message.errorMessage,
        successMessage: element.message.successMessage,
        loadingMessage: element.message.loadingMessage,
        checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
      },
      options: {
        inputForm: {
          questionKey: element.options.inputForm.questionKey,
          formKey: element.options.inputForm.formKey,
        },
        maths: {
          type: element.options.maths.type,
          formula: element.options.maths.formula,
          unit: element.options.maths.unit,
          spaceBetween: element.options.maths.spaceBetween === "true",
          position: element.options.maths.position,
        },
        afterMaths: {
          before: element.options.afterMaths.before,
          after: element.options.afterMaths.after,
        },
      },
      selected: {
        questionTitle: element.title,
        inputValue: "0",
      },
    };
  } else if (element.type === "file-upload") {
    return {
      order: Number(element.order),
      uid: formKey,
      type: element.type,
      required: element.required === "true",
      defaultVisible:
        element.defaultVisible === "false" && convertVisiblityToTrue
          ? true
          : element.defaultVisible === "true",
      title: element.title,
      description: element.description,
      localStorage: element.localStorage === "true",
      span: element.span,
      from: from || [],
      message: {
        text: element.message.text,
        type: element.message.type,
        errorMessage: element.message.errorMessage,
        successMessage: element.message.successMessage,
        loadingMessage: element.message.loadingMessage,
        checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
      },
      options: {
        upload: {
          hostname: element.options.upload.hostname,
          storageZoneName: element.options.upload.storageZoneName,
          region: element.options.upload.region,
          filesAccepted: element.options.upload.filesAccepted,
          multipleFiles: element.options.upload.multipleFiles,
          uploadingText: element.options.upload.uploadingText,
          uploadError: element.options.upload.uploadError,
          uploadSuccess: element.options.upload.uploadSuccess,
        },
        download: {
          pullHostName: element.options.download.pullHostName,
        },
      },
      selected: {
        questionTitle: element.title,
        selectedFiles: [],
      },
    };
  } else if (element.type === "calendly") {
    return {
      order: Number(element.order),
      uid: formKey,
      type: element.type,
      required: element.required === "true",
      defaultVisible:
        element.defaultVisible === "false" && convertVisiblityToTrue
          ? true
          : element.defaultVisible === "true",
      title: element.title,
      description: element.description,
      localStorage: element.localStorage === "true",
      span: element.span,
      from: from || [],
      message: {
        text: element.message.text,
        type: element.message.type,
        requiredMessage: element.message.requiredMessage,
        successMessage: element.message.successMessage,
        checkPreviousFormsMessage: element.message.checkPreviousFormsMessage,
      },
      options: {
        embed: {
          url: element.options.embed.url,
        },
        prefill: {
          email: {
            formKey: element.form[formKey].options.prefill.email.formKey,
          },
          name: {
            formKey: element.form[formKey].options.prefill.name.formKey,
          },
          phone: {
            formKey: element.form[formKey].options.prefill.phone.formKey,
          },
        },
      },
      selected: {
        questionTitle: element.title,
        scheduledEvent: { event: { uri: "" }, invitee: { uri: "" } },
      },
    };
  }
};
