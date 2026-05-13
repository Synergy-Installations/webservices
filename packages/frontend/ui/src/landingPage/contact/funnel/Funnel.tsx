"use client";

import { useMessages, useTranslations } from "next-intl";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import Link from "next/link";
import { aside, label, p, q } from "framer-motion/client";
import { useRouter } from "next/navigation";
import { debounce } from "@com.synergy/frontend-ui/Debounce";
import { useDropzone } from "react-dropzone";
import FileUpload from "./upload/FileUpload";
import Confetti from "react-dom-confetti";
import Calendly from "./calendly/Calendly";
import Range from "./range/Range";
import { formatLocaleNumberToUniNumber } from "../../../shared/utils/numbers/LocaleNumber";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useSignUp, useUser, useSignIn, useClerk } from "@clerk/nextjs";
import {
  PhoneCodeFactor,
  EmailCodeFactor,
  SignInFirstFactor,
} from "@clerk/types";
import { DefaultFunnel } from "@com.synergy/frontend-ui/DefaultFunnel";
import {
  createQuestionElement,
  createFormElement,
} from "@com.synergy/frontend-ui/CreateElements";

/* eslint-disable-next-line */
export interface FunnelProps {
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

export const Funnel = (props: FunnelProps) => {
  const { STORAGE_ZONE_ACCESS_KEY } = props;

  const messages: any = useMessages();
  const {
    isLoaded: isSignUpLoaded,
    signUp,
    setActive: setActiveSignUp,
  } = useSignUp();
  const { session } = useClerk();
  const { isSignedIn, user, isLoaded: isUserLoaded } = useUser();
  const [verifying, setVerifying] = useState(false);
  const {
    isLoaded: isSignInLoaded,
    signIn,
    setActive: setActiveSignIn,
  } = useSignIn();
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(false);
  const [signUpUserId, setSignUpUserId] = useState<string | null>(null);

  async function userAuthHandler(
    emailAddress: string,
    firstName: string,
    phoneNumber: string
  ) {
    console.log(
      "checkparameters",
      isSignedIn,
      user,
      user?.emailAddresses?.some((email) => email.emailAddress === emailAddress)
    );
    /* User is signed-in and the email address matches the entered one, no need to sign in or up again
     * and redirect to dashboard, if the email address does not match, sign out the user out
     * because multiple sessions is not enabled.
     */
    if (isSignedIn) {
      // E-Mail address matches with the current session
      if (
        user.emailAddresses?.some(
          (email) => email.emailAddress === emailAddress
        )
      ) {
        return router.push("/dashboard");
      }
      // E-Mail address does not match with the current session
      else {
        session?.end();
      }
    }

    let userEmailAddressVerified = false;
    const res = await fetch(
      `/api/dashboard/users/${emailAddress}/userEmailAddressVerified?query=emailAddress`,
      {
        method: "GET",
      }
    ).then(async (res) => {
      const responseBody: {
        success: boolean;
        userId: string | null;
        userEmailAddressVerified: boolean;
      } = await res.json();

      userEmailAddressVerified = responseBody.userEmailAddressVerified;

      // If the userId exists, a user has been created previously, based on
      // the verified status, we will sign up or in
      if (responseBody.userId !== null) setSignUpUserId(responseBody.userId);

      if (responseBody.userEmailAddressVerified) {
        setIsSignIn(true);
        signUserIn(emailAddress, firstName, phoneNumber);
      } else
        signUserUp(emailAddress, firstName, phoneNumber, responseBody.userId);
    });
  }

  async function signUserUp(
    emailAddress: string,
    firstName: string,
    phoneNumber: string,
    // userId is needed because useState might not update quickly enough
    userId: string | null
  ) {
    if (!isSignUpLoaded && !signUp) return null;

    console.log("signUserUp", emailAddress);

    try {
      // Start the sign-up process using the phone number method
      const signedUpUser = await signUp.create({
        emailAddress: emailAddress,
      });
      console.log("signedUpUser", signedUpUser);

      // Start the verification - a SMS message will be sent to the
      // number with a one-time code
      await signUp.prepareEmailAddressVerification();

      // Set verifying to true to display second form and capture the OTP code
      setVerifying(true);

      if (userId == null) {
        const res = await fetch("/api/dashboard/users", {
          method: "POST",
          body: JSON.stringify({
            status: signedUpUser.status,
            emailAddress: emailAddress,
            firstName: firstName,
            phoneNumber: phoneNumber,
          }),
        }).then(async (res) => {
          const responseBody = await res.json();
          setSignUpUserId(responseBody.data._id);
          console.log("Successfully sent user to db", res);
        });
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
    }
  }

  async function signUserIn(
    emailAddress: string,
    firstName: string,
    phoneNumber: string
  ) {
    if (!isSignInLoaded && !signIn) return null;

    try {
      // Start the sign-in process using the email address method
      const { supportedFirstFactors } = await signIn.create({
        identifier: emailAddress,
      });

      // Filter the returned array to find the 'email_code' entry
      const isEmailCodeFactor = (
        factor: SignInFirstFactor
      ): factor is EmailCodeFactor => {
        return factor.strategy === "email_code";
      };
      const emailCodeFactor = supportedFirstFactors?.find(isEmailCodeFactor);

      if (emailCodeFactor) {
        // Grab the emailAddressId
        const { emailAddressId } = emailCodeFactor;

        // Send the OTP code to the user
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId,
        });

        // Set verifying to true to display second form
        // and capture the OTP code
        setVerifying(true);
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
    }
  }

  function handleVerification(code: string) {
    if (isSignIn) handleSignInVerification(code);
    else handleSignUpVerification(code);
  }

  async function handleSignUpVerification(code: string) {
    if (!isSignUpLoaded && !signUp) return null;

    try {
      // Use the code provided by the user and attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // Use signUpAttempt.createdUserId to push the user id into db

      console.log("signUpAttempt", signUpAttempt);

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActiveSignUp({ session: signUpAttempt.createdSessionId });

        const res = await fetch(`/api/dashboard/users/${signUpUserId}`, {
          method: "PUT",
          body: JSON.stringify({
            status: "complete",
            verifications: {
              emailAddress: true,
            },
            createdUserAuthId: signUpAttempt.createdUserId,
          }),
        }).then((res) => {
          console.log("Successfully sent user to db", res);
        });

        router.push("/dashboard");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(signUpAttempt);
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
    }
  }

  async function handleSignInVerification(code: string) {
    if (!isSignInLoaded && !signIn) return null;

    try {
      // Use the code provided by the user and attempt verification
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActiveSignIn({ session: signInAttempt.createdSessionId });

        router.push("/dashboard");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(signInAttempt);
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
    }
  }

  const submitFunnel = async (
    questionKey: string,
    formKey: string,
    questionElements: any,
    setQuestionElements: Dispatch<SetStateAction<Record<string, any>>>,
    getNextQuestionKey: (
      questionKey: string,
      formKey: string
    ) => { status: string }
  ) => {
    console.log("submitFunnel", questionKey, questionElements);

    const { status: formStatus } = getNextQuestionKey(questionKey, formKey);

    if (formStatus === "success") {
      /** Sets button to loading */
      setQuestionElements((prev) => {
        const updatedElements = { ...prev };
        updatedElements[questionKey].form[formKey].message.text =
          questionElements[questionKey].form[formKey].message.loadingMessage;
        updatedElements[questionKey].form[formKey].message.type = "loading";
        return updatedElements;
      });

      const body = {
        to: (
          Object.values(questionElements[questionKey].form).find(
            (form: any) => form.uid === "submit-form-email"
          ) as any
        ).selected.inputValue,
        message:
          (
            Object.values(questionElements[questionKey].form).find(
              (form: any) => form.uid === "submit-form-textarea"
            ) as any
          )?.selected.inputValue || "",
        formData: Object.keys(questionElements)
          .filter((key) => questionElements[key].defaultVisible == true)
          .map((questionKey) => {
            const question = questionElements[questionKey];
            return {
              questionTitle: question.title,
              forms: Object.keys(question.form)
                .filter(
                  (key) =>
                    questionElements[questionKey].form[key].defaultVisible ==
                    true
                )
                .map((formKey) => {
                  const form = question.form[formKey];
                  return {
                    formTitle: form.selected?.questionTitle || form.title,
                    formType: form.type,
                    selected:
                      form.type === "checkbox" ||
                      form.type === "radio" ||
                      form.type === "select"
                        ? form.selected.selectedOptions
                        : form.type === "range"
                          ? `${form.selected.selectedValue} ${form.options.unit.value}`
                          : form.type === "text" ||
                              form.type === "email" ||
                              form.type === "tel" ||
                              form.type === "textarea"
                            ? form.selected.inputValue
                            : form.type === "file-upload" ||
                                form.type === "llm-file-extraction"
                              ? form.selected.selectedFiles.map(
                                  (file: { downloadUrl: string }) =>
                                    file.downloadUrl
                                )
                              : form.type === "calendly"
                                ? `event: ${form.selected.scheduledEvent.event.uri}, invitee: ${form.selected.scheduledEvent.invitee.uri}`
                                : "N/A",
                  };
                }),
            };
          }),
      };
      console.log(body);

      // const updatedQuestionElements = Object.keys(questionElements).reduce(
      //   (acc, questionKey) => {
      //     const question = questionElements[questionKey];

      //     const updatedForms = Object.keys(question.form).reduce(
      //       (formAcc, formKey) => {
      //         const form = question.form[formKey];

      //         // Handle swapping keys and uids for specific types
      //         if (form.type === "checkbox" || form.type === "radio") {
      //           const updatedOptions = Object.keys(form.options).reduce(
      //             (optionsAcc: Record<string, any>, optionKey) => {
      //               const option = form.options[optionKey];
      //               optionsAcc[option.uid] = { ...option, uid: optionKey };
      //               return optionsAcc;
      //             },
      //             {} as Record<string, any>
      //           );
      //           (formAcc as Record<string, any>)[form.uid] = {
      //             ...form,
      //             uid: formKey,
      //             options: updatedOptions,
      //           };
      //         } else if (form.type === "select") {
      //           const updatedOptions = Object.keys(form.options).reduce(
      //             (optionsAcc, optionKey) => {
      //               const option = form.options[optionKey];
      //               optionsAcc[option.uid] = { ...option, uid: optionKey };
      //               return optionsAcc;
      //             },
      //             {} as Record<string, any>
      //           );
      //           (formAcc as Record<string, any>)[form.uid] = {
      //             ...form,
      //             uid: formKey,
      //             options: updatedOptions,
      //           };
      //         } else if (form.type === "range") {
      //           const updatedLabels = Object.keys(form.options.labels).reduce(
      //             (labelsAcc, labelKey) => {
      //               const label = form.options.labels[labelKey];
      //               labelsAcc[label.uid] = { ...label, uid: labelKey };
      //               return labelsAcc;
      //             },
      //             {} as Record<string, any>
      //           );
      //           (formAcc as Record<string, any>)[form.uid] = {
      //             ...form,
      //             uid: formKey,
      //             options: { ...form.options, labels: updatedLabels },
      //           };
      //         } else {
      //           (formAcc as Record<string, any>)[form.uid] = {
      //             ...form,
      //             uid: formKey,
      //           };
      //         }

      //         return formAcc;
      //       },
      //       {}
      //     );

      //     (acc as Record<string, any>)[question.uid] = {
      //       ...question,
      //       uid: questionKey,
      //       form: updatedForms,
      //     };
      //     return acc;
      //   },
      //   {}
      // );

      // console.log("Updated Question Elements:", updatedQuestionElements);

      let submitId;
      const res = await fetch("/api/dashboard/submits", {
        method: "POST",
        body: JSON.stringify({
          data: questionElements,
          emailAddress: body.to,
          status: {
            code: "waiting-for-approval",
            message: "Anfrage eingegangen, warten auf Genehmigung",
            color: "LimeGreen",
          },
        }),
      });

      const responseBody = await res.json();
      console.log("Successfully sent submit to db", res);
      submitId = responseBody.data._id;

      const resTwo = await fetch("/api/contact/submitFunnel", {
        method: "POST",
        body: JSON.stringify({ ...body, submitId }),
      })
        .then((res) => {
          console.log("Successfully sent EMail", res);

          if (res.status == 200) {
            setQuestionElements((prev) => {
              const updatedElements = { ...prev };
              updatedElements[questionKey].form[formKey].message.text =
                questionElements[questionKey].form[
                  formKey
                ].message.successMessage;
              updatedElements[questionKey].form[formKey].message.type =
                "success";
              return updatedElements;
            });
          } else {
            setQuestionElements((prev) => {
              const updatedElements = { ...prev };
              updatedElements[questionKey].form[formKey].message.text =
                questionElements[questionKey].form[
                  formKey
                ].message.errorMessage;
              updatedElements[questionKey].form[formKey].message.type = "error";
              return updatedElements;
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
          console.error("Error sending the E-Mail", error);
          // setButtonStatusText({
          //   fatal: true,
          //   disabled: true,
          //   text: "Es konnte nicht abgeschickt werden, bitte benutzen Sie die E-Mail unten.",
          // });
        });

      setTimeout(() => {
        const firstName = (
          Object.values(questionElements[questionKey].form).find(
            (form: any) => form.uid === "submit-form-name"
          ) as any
        ).selected.inputValue;
        const phoneNumber = (
          Object.values(questionElements[questionKey].form).find(
            (form: any) => form.uid === "submit-form-telephone"
          ) as any
        ).selected.inputValue;
        userAuthHandler(body.to, firstName, phoneNumber);
      }, 1500);
    }
  };

  return (
    <DefaultFunnel
      questionElementsRaw={messages.LandingPage.ContactUs.Funnel.questions}
      STORAGE_ZONE_ACCESS_KEY={STORAGE_ZONE_ACCESS_KEY}
      config={{
        submitFunnel: submitFunnel,
        auth: {
          verifying: verifying,
          setVerifying: setVerifying,
          handleVerification: handleVerification,
        },
        format: {
          useKey: false,
          useStrings: true,
          useSelected: false,
          useUidAsKey: false,
        },
      }}
      ui={{
        progressContainerClassNames:
          "sticky bg-slate-50 pt-[100px] top-0 z-4q0",
        sectionContainerClassNames: "mt-10",
      }}
    />
  );
};

export default Funnel;
