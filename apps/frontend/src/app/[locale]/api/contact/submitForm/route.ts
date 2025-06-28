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
    to: [to, "office@synergiemontagen.eco"], // Change to your recipient
    from: "office@synergiemontagen.eco", // Change to your verified sender
    subject: "Ihre Anfrage von Synergiemontagen",
    text: message,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/icons/Flyer%20Synergie%20B2C%20v1.svg" alt="Synergiemontagen Logo" style="max-width: 200px;" />
        </div>
        <h2 style="color: #0CC0DF;">Vielen Dank für Ihre Anfrage mit Synergiemontagen</h2>
        <p><strong>Name:</strong> ${restBody.formData.name}</p>
        <p><strong>E-Mail:</strong> ${restBody.formData.email}</p>
        <p><strong>Tel.:</strong> ${restBody.formData.phone}</p>
        <p><strong>Produktauswahl:</strong> ${restBody.formData.productSelection}</p>
        <p><strong>Projektdetails:</strong> ${message}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="font-size: 0.9em; color: #555;">
          Wenn Sie weitere Informationen, Details oder Dokumente haben, senden Sie diese bitte an uns. Wir freuen uns darauf, Ihnen zu helfen!
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 0.8em; color: #888;">© ${new Date().getFullYear()} Synergiemontagen.eco - Alle Rechte vorbehalten.</p>
        </div>
      </div>
    `,
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
