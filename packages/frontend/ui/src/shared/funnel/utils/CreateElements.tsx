export const createQuestionElement = (
  questionKeyRef: string,
  question: any,
  // useKey decides whether a new unique key should be generated or the existing one should be used
  // use case is recreating question elements from db
  useKey: boolean,
  // useStrings is used to determine whether input will be a string or the standard type
  useStrings: boolean,
  // useSelected is used to determine whether the selected value should be used or the default (fallback) value
  // this is used when we have selected value present and we want to use it
  useSelected: boolean,
  from?: Array<string> | null,
  convertVisiblityToTrue?: boolean,
  // useUidAsKey decides whether the element uid should be used for the uid and the randomly generated key should
  // use the uid to create a unique key; the use case is creating a new question element with the same uid and original key
  useUidAsKey?: boolean
) => {
  const element = question;
  const questionKey: string = questionKeyRef;

  // Convert visibility to true by default
  convertVisiblityToTrue =
    convertVisiblityToTrue === undefined ? true : convertVisiblityToTrue;

  // useUidAsKey to false by default
  useUidAsKey = useUidAsKey === undefined ? false : useUidAsKey;

  return {
    title: element.title,
    description: element.description,
    from: useKey ? element.from : from || [],
    uid: useKey || useUidAsKey ? element.uid : questionKey,
    version: element.version,
    defaultVisible:
      (useStrings
        ? element.defaultVisible === "false"
        : element.defaultVisible == false) && convertVisiblityToTrue
        ? true
        : useStrings
          ? element.defaultVisible === "true"
          : element.defaultVisible,
    form: Object.keys(element.form).reduce(
      (formAcc: Record<string, any>, formKey: string) => {
        if (
          element.form[formKey].type === "checkbox" ||
          element.form[formKey].type === "radio"
        ) {
          console.log(formKey);
          formAcc[
            useKey
              ? formKey
              : `${useUidAsKey ? element.form[formKey].uid : formKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            order: useStrings
              ? Number(element.form[formKey].order)
              : element.form[formKey].order,
            uid: useKey || useUidAsKey ? element.form[formKey].uid : formKey,
            type: element.form[formKey].type,
            multiple: useStrings
              ? element.form[formKey].multiple === "true"
              : element.form[formKey].multiple,
            required: useStrings
              ? element.form[formKey].required === "true"
              : element.form[formKey].required,
            defaultVisible: useStrings
              ? element.form[formKey].defaultVisible === "true"
              : element.form[formKey].defaultVisible,
            title: element.form[formKey].title,
            description: element.form[formKey].description,
            from: useKey ? element.form[formKey].from : from || [],
            localStorage: useStrings
              ? element.form[formKey].localStorage === "true"
              : element.form[formKey].localStorage,
            span: element.form[formKey].span,
            message: {
              text: element.form[formKey].message.text,
              type: element.form[formKey].message.type,
              requiredMessage: element.form[formKey].message.requiredMessage,
              successMessage: element.form[formKey].message.successMessage,
              checkPreviousFormsMessage:
                element.form[formKey].message.checkPreviousFormsMessage,
            },
            options: Object.keys(element.form[formKey]?.options).reduce(
              (optionsAcc: any, optionKey: string) => {
                optionsAcc[
                  useKey
                    ? optionKey
                    : `${useUidAsKey ? element.form[formKey].options[optionKey].uid : optionKey}-${Math.random().toString(36).substring(2, 7)}`
                ] = {
                  text: element.form[formKey].options[optionKey].title,
                  type: element.form[formKey].options[optionKey].type,
                  uid:
                    useKey || useUidAsKey
                      ? element.form[formKey].options[optionKey].uid
                      : optionKey,
                  title: element.form[formKey].options[optionKey].title,
                  disabled: useStrings
                    ? element.form[formKey].options[optionKey].disabled ===
                    "true"
                    : element.form[formKey].options[optionKey].disabled,
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
              questionTitle: useSelected
                ? element.form[formKey].selected.questionTitle
                : element.form[formKey].title,
              selectedOptions: useSelected
                ? element.form[formKey].selected.selectedOptions
                : [],
              selectedOptionsUid: useSelected
                ? element.form[formKey].selected.selectedOptionsUid
                : [],
            },
          };
        } else if (element.form[formKey].type === "select") {
          formAcc[
            useKey
              ? formKey
              : `${useUidAsKey ? element.form[formKey].uid : formKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            order: useStrings
              ? Number(element.form[formKey].order)
              : element.form[formKey].order,
            uid: useKey || useUidAsKey ? element.form[formKey].uid : formKey,
            type: element.form[formKey].type,
            multiple: useStrings
              ? element.form[formKey].multiple === "true"
              : element.form[formKey].multiple,
            required: useStrings
              ? element.form[formKey].required === "true"
              : element.form[formKey].required,
            defaultVisible: useStrings
              ? element.form[formKey].defaultVisible === "true"
              : element.form[formKey].defaultVisible,
            title: element.form[formKey].title,
            description: element.form[formKey].description,
            localStorage: useStrings
              ? element.form[formKey].localStorage === "true"
              : element.form[formKey].localStorage,
            span: element.form[formKey].span,
            defaultValue: element.form[formKey].defaultValue,
            label: element.form[formKey].label,
            from: useKey ? element.form[formKey].from : from || [],
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
                  useKey
                    ? optionKey
                    : `${useUidAsKey ? element.form[formKey].options[optionKey].uid : optionKey}-${Math.random().toString(36).substring(2, 7)}`
                ] = {
                  type: element.form[formKey].options[optionKey].type,
                  title: element.form[formKey].options[optionKey].title,
                  value: element.form[formKey].options[optionKey].value,
                  uid:
                    useKey || useUidAsKey
                      ? element.form[formKey].options[optionKey].uid
                      : optionKey,
                  addQuestion:
                    element.form[formKey].options[optionKey].addQuestion,
                  addForm: element.form[formKey].options[optionKey].addForm,
                };
                return optionsAcc;
              },
              {}
            ),
            selected: {
              questionTitle: useSelected
                ? element.form[formKey].selected.questionTitle
                : element.form[formKey].label,
              selectedOptions: useSelected
                ? element.form[formKey].selected.selectedOptions
                : typeof window !== "undefined"
                  ? localStorage
                    .getItem(`${questionKey}-${formKey}`)
                    ?.split(",") || []
                  : element.form[formKey].defaultValue,
              selectedOptionsUid: useSelected
                ? element.form[formKey].selected.selectedOptionsUid
                : [],
            },
          };
        } else if (element.form[formKey].type === "range") {
          formAcc[
            useKey
              ? formKey
              : `${useUidAsKey ? element.form[formKey].uid : formKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            order: useStrings
              ? Number(element.form[formKey].order)
              : element.form[formKey].order,
            uid: useKey || useUidAsKey ? element.form[formKey].uid : formKey,
            type: element.form[formKey].type,
            required: useStrings
              ? element.form[formKey].required === "true"
              : element.form[formKey].required,
            defaultVisible: useStrings
              ? element.form[formKey].defaultVisible === "true"
              : element.form[formKey].defaultVisible,
            title: element.form[formKey].title,
            description: element.form[formKey].description,
            localStorage: useStrings
              ? element.form[formKey].localStorage === "true"
              : element.form[formKey].localStorage,
            span: element.form[formKey].span,
            from: useKey ? element.form[formKey].from : from || [],
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
                incrementBy: useStrings
                  ? Number(element.form[formKey].options.buttons.incrementBy)
                  : element.form[formKey].options.buttons.incrementBy,
                decrementBy: useStrings
                  ? Number(element.form[formKey].options.buttons.decrementBy)
                  : element.form[formKey].options.buttons.decrementBy,
              },
              range: {
                defaultValue: useStrings
                  ? Number(element.form[formKey].options.range.defaultValue)
                  : element.form[formKey].options.range.defaultValue,
                min: useStrings
                  ? Number(element.form[formKey].options.range.min)
                  : element.form[formKey].options.range.min,
                max: useStrings
                  ? Number(element.form[formKey].options.range.max)
                  : element.form[formKey].options.range.max,
                step: useStrings
                  ? Number(element.form[formKey].options.range.step)
                  : element.form[formKey].options.range.step,
                type: element.form[formKey].options.range.type,
              },
              unit: {
                value: element.form[formKey].options.unit.value,
                spaceBetween: useStrings
                  ? element.form[formKey].options.unit.spaceBetween === "true"
                  : element.form[formKey].options.unit.spaceBetween,
                position: element.form[formKey].options.unit.position,
                numberFormat: element.form[formKey].options.unit.numberFormat,
              },
              labels: Object.keys(element.form[formKey].options.labels).reduce(
                (lablesAcc: any, labelKey: string) => {
                  lablesAcc[
                    useKey
                      ? labelKey
                      : `${useUidAsKey ? element.form[formKey].options.labels[labelKey].uid : labelKey}-${Math.random().toString(36).substring(2, 7)}`
                  ] = {
                    text: element.form[formKey].options.labels[labelKey].text,
                    uid:
                      useKey || useUidAsKey
                        ? element.form[formKey].options.labels[labelKey].uid
                        : labelKey,
                    value: useStrings
                      ? Number(
                        element.form[formKey].options.labels[labelKey].value
                      )
                      : element.form[formKey].options.labels[labelKey].value,
                    align: element.form[formKey].options.labels[labelKey].align,
                    offsetX:
                      element.form[formKey].options.labels[labelKey].offsetX,
                    correctX:
                      element.form[formKey].options.labels[labelKey].correctX,
                  };
                  return lablesAcc;
                },
                {}
              ),
            },
            selected: {
              questionTitle: useSelected
                ? element.form[formKey].selected.questionTitle
                : element.form[formKey].title,
              selectedValue: useSelected
                ? element.form[formKey].selected.selectedValue
                : element.form[formKey].options.range.defaultValue,
              rangeValue: useSelected
                ? element.form[formKey].selected.rangeValue
                : useStrings
                  ? Number(element.form[formKey].options.range.defaultValue)
                  : element.form[formKey].options.range.defaultValue,
            },
          };
        } else if (
          element.form[formKey].type === "text" ||
          element.form[formKey].type === "email" ||
          element.form[formKey].type === "tel" ||
          element.form[formKey].type === "textarea"
        ) {
          formAcc[
            useKey
              ? formKey
              : `${useUidAsKey ? element.form[formKey].uid : formKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            order: Number(element.form[formKey].order),
            uid: useKey || useUidAsKey ? element.form[formKey].uid : formKey,
            type: element.form[formKey].type,
            required: useStrings
              ? element.form[formKey].required === "true"
              : element.form[formKey].required,
            defaultVisible: useStrings
              ? element.form[formKey].defaultVisible === "true"
              : element.form[formKey].defaultVisible,
            title: element.form[formKey].title,
            description: element.form[formKey].description,
            localStorage: useStrings
              ? element.form[formKey].localStorage === "true"
              : element.form[formKey].localStorage,
            span: element.form[formKey].span,
            from: useKey ? element.form[formKey].from : from || [],
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
                  ? useStrings
                    ? Number(element.form[formKey].options.rows)
                    : element.form[formKey].options.rows
                  : 1,
            },
            selected: {
              questionTitle: useSelected
                ? element.form[formKey].selected.questionTitle
                : element.form[formKey].title === ""
                  ? element.form[formKey].options.label
                  : element.form[formKey].title,
              inputValue: useSelected
                ? element.form[formKey].selected.inputValue
                : typeof window !== "undefined"
                  ? localStorage.getItem(`${questionKey}-${formKey}`) || ""
                  : "",
            },
          };
        } else if (element.form[formKey].type === "submit-button") {
          formAcc[
            useKey
              ? formKey
              : `${useUidAsKey ? element.form[formKey].uid : formKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            order: useStrings
              ? Number(element.form[formKey].order)
              : element.form[formKey].order,
            uid: useKey || useUidAsKey ? element.form[formKey].uid : formKey,
            type: element.form[formKey].type,
            required: useStrings
              ? element.form[formKey].required === "true"
              : element.form[formKey].required,
            defaultVisible: useStrings
              ? element.form[formKey].defaultVisible === "true"
              : element.form[formKey].defaultVisible,
            title: element.form[formKey].title,
            description: element.form[formKey].description,
            localStorage: useStrings
              ? element.form[formKey].localStorage === "true"
              : element.form[formKey].localStorage,
            span: element.form[formKey].span,
            from: useKey ? element.form[formKey].from : from || [],
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
          formAcc[
            useKey
              ? formKey
              : `${useUidAsKey ? element.form[formKey].uid : formKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            order: useStrings
              ? Number(element.form[formKey].order)
              : element.form[formKey].order,
            uid: useKey || useUidAsKey ? element.form[formKey].uid : formKey,
            type: element.form[formKey].type,
            required: useStrings
              ? element.form[formKey].required === "true"
              : element.form[formKey].required,
            defaultVisible: useStrings
              ? element.form[formKey].defaultVisible === "true"
              : element.form[formKey].defaultVisible,
            title: element.form[formKey].title,
            description: element.form[formKey].description,
            localStorage: useStrings
              ? element.form[formKey].localStorage === "true"
              : element.form[formKey].localStorage,
            span: element.form[formKey].span,
            from: useKey ? element.form[formKey].from : from || [],
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
                spaceBetween: useStrings
                  ? element.form[formKey].options.maths.spaceBetween === "true"
                  : element.form[formKey].options.maths.spaceBetween,
                position: element.form[formKey].options.maths.position,
              },
              afterMaths: {
                before: element.form[formKey].options.afterMaths.before,
                after: element.form[formKey].options.afterMaths.after,
              },
            },
            selected: {
              questionTitle: useSelected
                ? element.form[formKey].selected.questionTitle
                : element.form[formKey].title,
              inputValue: useSelected
                ? element.form[formKey].selected.inputValue
                : "0",
            },
          };
        } else if (element.form[formKey].type === "file-upload") {
          formAcc[
            useKey
              ? formKey
              : `${useUidAsKey ? element.form[formKey].uid : formKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            order: useStrings
              ? Number(element.form[formKey].order)
              : element.form[formKey].order,
            uid: useKey || useUidAsKey ? element.form[formKey].uid : formKey,
            type: element.form[formKey].type,
            required: useStrings
              ? element.form[formKey].required === "true"
              : element.form[formKey].required,
            defaultVisible: useStrings
              ? element.form[formKey].defaultVisible === "true"
              : element.form[formKey].defaultVisible,
            title: element.form[formKey].title,
            description: element.form[formKey].description,
            localStorage: useStrings
              ? element.form[formKey].localStorage === "true"
              : element.form[formKey].localStorage,
            span: element.form[formKey].span,
            from: useKey ? element.form[formKey].from : from || [],
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
              questionTitle: useSelected
                ? element.form[formKey].selected.questionTitle
                : element.form[formKey].title,
              selectedFiles: useSelected
                ? element.form[formKey].selected.selectedFiles
                : [],
            },
          };
        } else if (element.form[formKey].type === "llm-file-extraction") {
          formAcc[
            useKey
              ? formKey
              : `${useUidAsKey ? element.form[formKey].uid : formKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            order: useStrings
              ? Number(element.form[formKey].order)
              : element.form[formKey].order,
            uid: useKey || useUidAsKey ? element.form[formKey].uid : formKey,
            type: element.form[formKey].type,
            required: useStrings
              ? element.form[formKey].required === "true"
              : element.form[formKey].required,
            defaultVisible: useStrings
              ? element.form[formKey].defaultVisible === "true"
              : element.form[formKey].defaultVisible,
            title: element.form[formKey].title,
            description: element.form[formKey].description,
            localStorage: useStrings
              ? element.form[formKey].localStorage === "true"
              : element.form[formKey].localStorage,
            span: element.form[formKey].span,
            from: useKey ? element.form[formKey].from : from || [],
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
              questionTitle: useSelected
                ? element.form[formKey].selected.questionTitle
                : element.form[formKey].title,
              selectedFiles: useSelected
                ? element.form[formKey].selected.selectedFiles
                : [],
            },
          };
        } else if (element.form[formKey].type === "calendly") {
          formAcc[
            useKey
              ? formKey
              : `${useUidAsKey ? element.form[formKey].uid : formKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            order: useStrings
              ? Number(element.form[formKey].order)
              : element.form[formKey].order,
            uid: useKey || useUidAsKey ? element.form[formKey].uid : formKey,
            type: element.form[formKey].type,
            required: useStrings
              ? element.form[formKey].required === "true"
              : element.form[formKey].required,
            defaultVisible: useStrings
              ? element.form[formKey].defaultVisible === "true"
              : element.form[formKey].defaultVisible,
            title: element.form[formKey].title,
            description: element.form[formKey].description,
            localStorage: useStrings
              ? element.form[formKey].localStorage === "true"
              : element.form[formKey].localStorage,
            span: element.form[formKey].span,
            from: useKey ? element.form[formKey].from : from || [],
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
              questionTitle: useSelected
                ? element.form[formKey].selected.questionTitle
                : element.form[formKey].title,
              scheduledEvent: useSelected
                ? element.form[formKey].selected.scheduledEvent
                : { event: { uri: "" }, invitee: { uri: "" } },
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
  // useKey decides whether a new unique key should be generated or the existing one should be used
  useKey: boolean,
  // useStrings is used to determine whether input will be a string or the standard type
  useStrings: boolean,
  // useSelected is used to determine whether the selected value should be used or the default (fallback) value
  // this is used when we have selected value present and we want to use it
  useSelected: boolean,
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
  const formKey: string = formKeyRef;

  // Convert visibility to true by default
  convertVisiblityToTrue =
    convertVisiblityToTrue === undefined ? true : convertVisiblityToTrue;

  if (element.type === "checkbox" || element.type === "radio") {
    return {
      order: useStrings ? Number(element.order) : element.order,
      uid: useKey ? element.uid : formKey,
      type: element.type,
      multiple: element.multiple,
      required: useStrings ? element.required === "true" : element.required,
      defaultVisible:
        (useStrings
          ? element.defaultVisible === "false"
          : element.defaultVisible == false) && convertVisiblityToTrue
          ? true
          : useStrings
            ? element.defaultVisible === "true"
            : element.defaultVisible,
      title: element.title,
      description: element.description,
      localStorage: useStrings
        ? element.localStorage === "true"
        : element.localeStorage,
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
            useKey
              ? optionKey
              : `${optionKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            text: element.options[optionKey].title,
            type: element.options[optionKey].type,
            uid: useKey ? element.options[optionKey].uid : optionKey,
            title: element.options[optionKey].title,
            disabled: useStrings
              ? element.options[optionKey].disabled === "true"
              : element.options[optionKey].disabled,
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
        questionTitle: useSelected
          ? element.selected.questionTitle
          : element.title,
        selectedOptions: useSelected ? element.selected.selectedOptions : [],
        selectedOptionsUid: useSelected
          ? element.selected.selectedOptionsUid
          : [],
      },
    };
  } else if (element.type === "select") {
    return {
      order: useStrings ? Number(element.order) : element.order,
      uid: useKey ? element.uid : formKey,
      type: element.type,
      multiple: useStrings ? element.multiple === "true" : element.multiple,
      required: useStrings ? element.required === "true" : element.required,
      defaultVisible:
        (useStrings
          ? element.defaultVisible === "false"
          : element.defaultVisible == false) && convertVisiblityToTrue
          ? true
          : useStrings
            ? element.defaultVisible === "true"
            : element.defaultVisible,
      title: element.title,
      description: element.description,
      localStorage: useStrings
        ? element.localStorage === "true"
        : element.localStorage,
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
            useKey
              ? optionKey
              : `${optionKey}-${Math.random().toString(36).substring(2, 7)}`
          ] = {
            type: element.options[optionKey].type,
            title: element.options[optionKey].title,
            value: element.options[optionKey].value,
            uid: useKey ? element.options[optionKey].uid : optionKey,
            addQuestion: element.options[optionKey].addQuestion,
            addForm: element.options[optionKey].addForm,
          };
          return optionsAcc;
        },
        {}
      ),
      selected: {
        questionTitle: useSelected
          ? element.selected.questionTitle
          : element.label,
        selectedOptions: useSelected
          ? element.selected.selectedOptions
          : typeof window !== "undefined"
            ? localStorage.getItem(`${questionKey}-${formKey}`)?.split(",") ||
            []
            : [],
        selectedOptionsUid: useSelected
          ? element.selected.selectedOptionsUid
          : [],
      },
    };
  } else if (element.type === "range") {
    return {
      order: useStrings ? Number(element.order) : element.order,
      uid: useKey ? element.uid : formKey,
      type: element.type,
      required: useStrings ? element.required === "true" : element.required,
      defaultVisible:
        (useStrings
          ? element.defaultVisible === "false"
          : element.defaultVisible == false) && convertVisiblityToTrue
          ? true
          : useStrings
            ? element.defaultVisible === "true"
            : element.defaultVisible,
      title: element.title,
      description: element.description,
      localStorage: useStrings
        ? element.localStorage === "true"
        : element.localStorage,
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
          incrementBy: useStrings
            ? Number(element.options.buttons.incrementBy)
            : element.options.buttons.incrementBy,
          decrementBy: useStrings
            ? Number(element.options.buttons.decrementBy)
            : element.options.buttons.decrementBy,
        },
        range: {
          defaultValue: useStrings
            ? Number(element.options.range.defaultValue)
            : element.options.range.defaultValue,
          min: useStrings
            ? Number(element.options.range.min)
            : element.options.range.min,
          max: useStrings
            ? Number(element.options.range.max)
            : element.options.range.max,
          step: useStrings
            ? Number(element.options.range.step)
            : element.options.range.step,
          type: element.options.range.type,
        },
        unit: {
          value: element.options.unit.value,
          spaceBetween: useStrings
            ? element.options.unit.spaceBetween === "true"
            : element.options.unit.spaceBetween,
          position: element.options.unit.position,
          numberFormat: element.options.unit.numberFormat,
        },
        labels: Object.keys(element.options.labels).reduce(
          (lablesAcc: any, labelKey: string) => {
            lablesAcc[
              useKey
                ? labelKey
                : `${labelKey}-${Math.random().toString(36).substring(2, 7)}`
            ] = {
              text: element.options.labels[labelKey].text,
              uid: useKey ? element.options.labels[labelKey].uid : labelKey,
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
        questionTitle: useSelected
          ? element.selected.questionTitle
          : element.title,
        selectedValue: useSelected
          ? element.selected.selectedValue
          : element.options.range.defaultValue,
        rangeValue: useSelected
          ? element.selected.rangeValue
          : useStrings
            ? Number(element.options.range.defaultValue)
            : element.options.range.defaultValue,
      },
    };
  } else if (
    element.type === "text" ||
    element.type === "email" ||
    element.type === "tel" ||
    element.type === "textarea"
  ) {
    return {
      order: useStrings ? Number(element.order) : element.order,
      uid: useKey ? element.uid : formKey,
      type: element.type,
      required: element.required === "true",
      defaultVisible:
        (useStrings
          ? element.defaultVisible === "false"
          : element.defaultVisible == false) && convertVisiblityToTrue
          ? true
          : useStrings
            ? element.defaultVisible === "true"
            : element.defaultVisible,
      title: element.title,
      description: element.description,
      localStorage: useStrings
        ? element.localStorage === "true"
        : element.localStorage,
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
        rows:
          element.type === "textarea"
            ? useStrings
              ? Number(element.options.rows)
              : element.options.row
            : 1,
      },
      selected: {
        questionTitle: useSelected
          ? element.selected.questionTitle
          : element.title === ""
            ? element.options.label
            : element.title,
        inputValue: useSelected
          ? element.selected.inputValue
          : typeof window !== "undefined"
            ? localStorage.getItem(`${questionKey}-${formKey}`) || ""
            : "",
      },
    };
  } else if (element.type === "submit-button") {
    return {
      order: useStrings ? Number(element.order) : element.order,
      uid: useKey ? element.uid : formKey,
      type: element.type,
      required: useStrings ? element.required === "true" : element.required,
      defaultVisible:
        (useStrings
          ? element.defaultVisible === "false"
          : element.defaultVisible == false) && convertVisiblityToTrue
          ? true
          : useStrings
            ? element.defaultVisible === "true"
            : element.defaultVisible,
      title: element.title,
      description: element.description,
      localStorage: useStrings
        ? element.localStorage === "true"
        : element.localStorage,
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
      uid: useKey ? element.uid : formKey,
      type: element.type,
      required: useStrings ? element.required === "true" : element.required,
      defaultVisible:
        (useStrings
          ? element.defaultVisible === "false"
          : element.defaultVisible == false) && convertVisiblityToTrue
          ? true
          : useStrings
            ? element.defaultVisible === "true"
            : element.defaultVisible,
      title: element.title,
      description: element.description,
      localStorage: useStrings
        ? element.localStorage === "true"
        : element.localStorage,
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
          spaceBetween: useStrings
            ? element.options.maths.spaceBetween === "true"
            : element.options.maths.spaceBetween,
          position: element.options.maths.position,
        },
        afterMaths: {
          before: element.options.afterMaths.before,
          after: element.options.afterMaths.after,
        },
      },
      selected: {
        questionTitle: useSelected
          ? element.selected.questionTitle
          : element.title,
        inputValue: useSelected ? element.selected.inputValue : "0",
      },
    };
  } else if (element.type === "file-upload") {
    return {
      order: useStrings ? Number(element.order) : element.order,
      uid: useKey ? element.uid : formKey,
      type: element.type,
      required: element.required === "true",
      defaultVisible:
        (useStrings
          ? element.defaultVisible === "false"
          : element.defaultVisible == false) && convertVisiblityToTrue
          ? true
          : useStrings
            ? element.defaultVisible === "true"
            : element.defaultVisible,
      title: element.title,
      description: element.description,
      localStorage: useStrings
        ? element.localStorage === "true"
        : element.localStorage,
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
        questionTitle: useSelected
          ? element.selected.questionTitle
          : element.title,
        selectedFiles: useSelected ? element.selected.selectedFiles : [],
      },
    };
  } else if (element.type === "llm-file-extraction") {
    return {
      order: useStrings ? Number(element.order) : element.order,
      uid: useKey ? element.uid : formKey,
      type: element.type,
      required: element.required === "true",
      defaultVisible:
        (useStrings
          ? element.defaultVisible === "false"
          : element.defaultVisible == false) && convertVisiblityToTrue
          ? true
          : useStrings
            ? element.defaultVisible === "true"
            : element.defaultVisible,
      title: element.title,
      description: element.description,
      localStorage: useStrings
        ? element.localStorage === "true"
        : element.localStorage,
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
        questionTitle: useSelected
          ? element.selected.questionTitle
          : element.title,
        selectedFiles: useSelected ? element.selected.selectedFiles : [],
      },
    };
  } else if (element.type === "calendly") {
    return {
      order: Number(element.order),
      uid: useKey ? element.uid : formKey,
      type: element.type,
      required: useStrings ? element.required === "true" : element.required,
      defaultVisible:
        (useStrings
          ? element.defaultVisible === "false"
          : element.defaultVisible == false) && convertVisiblityToTrue
          ? true
          : useStrings
            ? element.defaultVisible === "true"
            : element.defaultVisible,
      title: element.title,
      description: element.description,
      localStorage: useStrings
        ? element.localStorage === "true"
        : element.localStorage,
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
        questionTitle: useSelected
          ? element.selected.questionTitle
          : element.title,
        scheduledEvent: useSelected
          ? element.selected.scheduledEvent
          : { event: { uri: "" }, invitee: { uri: "" } },
      },
    };
  }
};
