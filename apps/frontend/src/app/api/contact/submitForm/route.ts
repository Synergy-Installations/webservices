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
  console.log("process.env.SENDGRID_API_KEY", process.env.SENDGRID_API_KEY);

  const msg = {
    // to: [to, "office@synergiemontagen.eco"], // Change to your recipient
    to: to,
    from: "office@synergiemontagen.eco", // Change to your verified sender
    subject: "Ihre Anfrage von Synergiemontagen",
    text: message,
    html: `<h1>Vielen Dank für Ihre Anfrage mit Synergiemontagen</h1><br /><p><strong>Name:</strong> ${restBody.formData.name}</p><br /><p><strong>E-Mail:</strong> ${restBody.formData.email}</p><br /><p><strong>Tel.:</strong> ${restBody.formData.phone}</p><br /><p><strong>Aufmerksam durch:</strong> ${restBody.formData.funnel}</p><br /><p><strong>Projektdetails:</strong>${message}</p>`,
  };

  let errorBoolean = false;

  try {
    sgMail.send(msg);
  } catch (error) {
    errorBoolean = true;
    console.error("error", error);
    return NextResponse.json({
      status: 500,
      message: "Email did not send catch",
    });
  }

  return errorBoolean
    ? NextResponse.json({ status: 500, message: "Email did not send final" })
    : NextResponse.json({ message: "Email sent successfully final" });
}
