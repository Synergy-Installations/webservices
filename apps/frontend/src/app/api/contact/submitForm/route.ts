import * as sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";

type EmailFormData = {
  to: string;
  message: string;
  formData: {
    [key: string]: string;
  };
};

export async function POST(req: NextRequest) {
  const { to, message, ...restBody }: EmailFormData = await req.json();

  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  // console.log("process.env.SENDGRID_API_KEY", process.env.SENDGRID_API_KEY);

  const msg = {
    // to: [to, "office@synergiemontagen.eco"], // Change to your recipient
    to: [to],
    from: "office@synergiemontagen.eco", // Change to your verified sender
    subject: "Ihre Anfrage von Synergiemontagen",
    text: message,
    html: `<h1>Vielen Dank für Ihre Anfrage mit Synergiemontagen</h1><br /><p><strong>Name:</strong> ${restBody.formData.name}</p><br /><p><strong>E-Mail:</strong> ${restBody.formData.email}</p><br /><p><strong>Tel.:</strong> ${restBody.formData.phone}</p><br /><p><strong>Aufmerksam durch:</strong> ${restBody.formData.funnel}</p><br /><p><strong>Projektdetails:</strong>${message}</p>`,
  };

  let errorBoolean = false;

  await sgMail
    .send(msg)
    .then((value) => {})
    .catch((error) => {
      errorBoolean = true;
      console.error("Mail sent unseccussfully", error, error.code);
      if (error.response) {
        console.error(error.response.body);
      }
    });
  return errorBoolean
    ? new Response(`Email did not send (final) ${errorBoolean}`, {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      })
    : new Response(`Email sent successfully (final) ${errorBoolean}`, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
}
