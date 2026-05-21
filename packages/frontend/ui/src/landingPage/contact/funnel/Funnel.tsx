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

type SubmitProgressStage =
  | "idle"
  | "saving"
  | "sendingEmail"
  | "preparingAccess"
  | "redirecting"
  | "success"
  | "error";

type SubmitProgressStep = Exclude<
  SubmitProgressStage,
  "idle" | "success" | "error"
>;

type AuthFlowResult = "redirecting" | "verifying";

const submitProgressSteps: SubmitProgressStep[] = [
  "saving",
  "sendingEmail",
  "preparingAccess",
  "redirecting",
];

export const Funnel = (props: FunnelProps) => {
  const { STORAGE_ZONE_ACCESS_KEY } = props;

  const messages: any = useMessages();
  const submitProgressT = useTranslations(
    "LandingPage.ContactUs.Funnel.ui.submitProgress",
  );
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
  const [submitProgressStage, setSubmitProgressStage] =
    useState<SubmitProgressStage>("idle");

  useEffect(() => {
    if (verifying) setSubmitProgressStage("idle");
  }, [verifying]);

  async function userAuthHandler(
    emailAddress: string,
    firstName: string,
    phoneNumber: string,
  ): Promise<AuthFlowResult> {
    console.log(
      "checkparameters",
      isSignedIn,
      user,
      user?.emailAddresses?.some(
        (email) => email.emailAddress === emailAddress,
      ),
    );
    /* User is signed-in and the email address matches the entered one, no need to sign in or up again
     * and redirect to dashboard, if the email address does not match, sign out the user out
     * because multiple sessions is not enabled.
     */
    if (isSignedIn) {
      // E-Mail address matches with the current session
      if (
        user.emailAddresses?.some(
          (email) => email.emailAddress === emailAddress,
        )
      ) {
        setSubmitProgressStage("redirecting");
        router.push("/dashboard");
        return "redirecting";
      }
      // E-Mail address does not match with the current session
      else {
        await session?.end();
      }
    }

    const res = await fetch(
      `/api/dashboard/users/${encodeURIComponent(
        emailAddress,
      )}/userEmailAddressVerified?query=emailAddress`,
      {
        method: "GET",
      },
    );

    if (!res.ok) {
      throw new Error(`Could not check user verification (${res.status})`);
    }

    const responseBody: {
      success: boolean;
      userId: string | null;
      userEmailAddressVerified: boolean;
    } = await res.json();

    if (!responseBody.success) {
      throw new Error("Could not check user verification");
    }

    // If the userId exists, a user has been created previously, based on
    // the verified status, we will sign up or in
    if (responseBody.userId !== null) setSignUpUserId(responseBody.userId);

    if (responseBody.userEmailAddressVerified) {
      setIsSignIn(true);
      return signUserIn(emailAddress, firstName, phoneNumber);
    }

    return signUserUp(
      emailAddress,
      firstName,
      phoneNumber,
      responseBody.userId,
    );
  }

  async function signUserUp(
    emailAddress: string,
    firstName: string,
    phoneNumber: string,
    // userId is needed because useState might not update quickly enough
    userId: string | null,
  ): Promise<AuthFlowResult> {
    if (!isSignUpLoaded || !signUp) {
      throw new Error("Sign up is not ready yet");
    }

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
        await fetch("/api/dashboard/users", {
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

      return "verifying";
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
      throw err;
    }
  }

  async function signUserIn(
    emailAddress: string,
    firstName: string,
    phoneNumber: string,
  ): Promise<AuthFlowResult> {
    if (!isSignInLoaded || !signIn) {
      throw new Error("Sign in is not ready yet");
    }

    try {
      // Start the sign-in process using the email address method
      const { supportedFirstFactors } = await signIn.create({
        identifier: emailAddress,
      });

      // Filter the returned array to find the 'email_code' entry
      const isEmailCodeFactor = (
        factor: SignInFirstFactor,
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
        return "verifying";
      }

      throw new Error("Email verification is not available");
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
      throw err;
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
      formKey: string,
    ) => { status: string },
  ) => {
    console.log("submitFunnel", questionKey, questionElements);

    const { status: formStatus } = getNextQuestionKey(questionKey, formKey);

    if (formStatus === "success") {
      const updateSubmitButtonMessage = (
        text: string,
        type: "loading" | "success" | "error",
      ) => {
        setQuestionElements((prev) => {
          const updatedElements = { ...prev };
          updatedElements[questionKey].form[formKey].message.text = text;
          updatedElements[questionKey].form[formKey].message.type = type;
          return updatedElements;
        });
      };

      const getFormByUid = (uid: string) =>
        Object.values(questionElements[questionKey].form).find(
          (form: any) => form.uid === uid,
        ) as any;

      /** Sets button to loading */
      updateSubmitButtonMessage(
        questionElements[questionKey].form[formKey].message.loadingMessage,
        "loading",
      );
      setSubmitProgressStage("saving");

      const body = {
        to: getFormByUid("submit-form-email").selected.inputValue,
        message:
          getFormByUid("submit-form-textarea")?.selected.inputValue || "",
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
                    true,
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
                                    file.downloadUrl,
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

      try {
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

        if (!res.ok) {
          throw new Error(`Submit could not be saved (${res.status})`);
        }

        const responseBody = await res.json();
        const submitId = responseBody?.data?._id;

        if (!submitId) {
          throw new Error("Submit response did not include an id");
        }

        console.log("Successfully sent submit to db", res);
        setSubmitProgressStage("sendingEmail");

        const sendConfirmationEmail = async () => {
          const emailResponse = await fetch("/api/contact/submitFunnel", {
            method: "POST",
            body: JSON.stringify({ ...body, submitId }),
          });

          console.log("Successfully sent EMail", emailResponse);

          if (!emailResponse.ok) {
            throw new Error(
              `Confirmation email could not be sent (${emailResponse.status})`,
            );
          }
        };

        const firstName =
          getFormByUid("submit-form-name")?.selected.inputValue || "";
        const phoneNumber =
          getFormByUid("submit-form-telephone")?.selected.inputValue || "";

        const emailPromise = sendConfirmationEmail()
          .then(() => {
            updateSubmitButtonMessage(
              questionElements[questionKey].form[formKey].message
                .successMessage,
              "success",
            );
          })
          .catch((error) => {
            console.error("Error sending the E-Mail", error);
            updateSubmitButtonMessage(
              questionElements[questionKey].form[formKey].message.errorMessage,
              "error",
            );
            throw error;
          })
          .finally(() => {
            setSubmitProgressStage((currentStage) =>
              currentStage === "sendingEmail"
                ? "preparingAccess"
                : currentStage,
            );
          });

        const authPromise = userAuthHandler(body.to, firstName, phoneNumber);
        const [emailResult, authResult] = await Promise.allSettled([
          emailPromise,
          authPromise,
        ]);

        if (authResult.status === "rejected") {
          throw authResult.reason;
        }

        if (authResult.value === "redirecting") {
          setSubmitProgressStage("redirecting");
          return;
        }

        if (authResult.value === "verifying") {
          setSubmitProgressStage("idle");
          return;
        }

        if (emailResult.status === "rejected") {
          setSubmitProgressStage("error");
          return;
        }

        setSubmitProgressStage("success");
      } catch (error) {
        console.error("Error submitting funnel", error);
        updateSubmitButtonMessage(
          questionElements[questionKey].form[formKey].message.errorMessage,
          "error",
        );
        setSubmitProgressStage("error");
      }
    }
  };

  return (
    <>
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
      <SubmitProgressOverlay
        stage={submitProgressStage}
        t={submitProgressT}
        onClose={() => setSubmitProgressStage("idle")}
      />
    </>
  );
};

function SubmitProgressOverlay({
  stage,
  t,
  onClose,
}: {
  stage: SubmitProgressStage;
  t: any;
  onClose: () => void;
}) {
  const open = stage !== "idle";
  if (!open) return null;

  const activeStepIndex =
    stage === "success" || stage === "error"
      ? submitProgressSteps.length - 1
      : Math.max(0, submitProgressSteps.indexOf(stage as SubmitProgressStep));
  const progress =
    stage === "error"
      ? 100
      : stage === "success"
        ? 100
        : ((activeStepIndex + 1) / submitProgressSteps.length) * 100;
  const ringOffset = 283 - (283 * progress) / 100;
  const isError = stage === "error";

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (isError) onClose();
      }}
      className="relative z-[60]"
    >
      <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <div className="fixed inset-0 flex min-h-screen w-screen items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/30 bg-white p-6 shadow-2xl sm:p-8">
          <div className="absolute -right-20 -top-24 h-52 w-52 animate-pulse rounded-full bg-synergy-light-blue/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-emerald-300/30 blur-3xl" />

          <div className="relative">
            <div className="mb-6 flex items-center gap-5">
              <div className="relative grid h-24 w-24 shrink-0 place-items-center">
                <div className="absolute inset-0 rounded-full bg-synergy-light-blue/10" />
                <div className="absolute inset-3 animate-ping rounded-full bg-synergy-light-blue/20" />
                <svg
                  className="relative h-24 w-24 -rotate-90"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-200"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={ringOffset}
                    className={
                      isError ? "text-red-500" : "text-synergy-light-blue"
                    }
                    fill="none"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-slate-900">
                  {Math.round(progress)}%
                </span>
              </div>

              <div aria-live="polite" role="status">
                <DialogTitle className="text-2xl font-semibold text-slate-950">
                  {t("title")}
                </DialogTitle>
                <Description className="mt-2 text-sm text-slate-600">
                  {t("description")}
                </Description>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
              <p
                className={`text-sm font-semibold ${
                  isError ? "text-red-700" : "text-slate-950"
                }`}
              >
                {t(`${stage}.label`)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {t(`${stage}.description`)}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {submitProgressSteps.map((step, index) => {
                const isComplete =
                  stage === "success" ||
                  (!isError && activeStepIndex > index) ||
                  (isError && activeStepIndex > index);
                const isActive =
                  !isError && stage !== "success" && activeStepIndex === index;

                return (
                  <div
                    key={step}
                    className={`rounded-2xl border p-3 transition-all ${
                      isActive
                        ? "border-synergy-light-blue bg-white shadow-lg shadow-synergy-light-blue/10"
                        : isComplete
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-white/70"
                    }`}
                  >
                    <div
                      className={`mb-2 grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-synergy-light-blue text-white"
                          : isComplete
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isComplete ? "OK" : index + 1}
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      {t(`steps.${step}`)}
                    </p>
                  </div>
                );
              })}
            </div>

            {isError && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  {t("closeButton")}
                </button>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default Funnel;
