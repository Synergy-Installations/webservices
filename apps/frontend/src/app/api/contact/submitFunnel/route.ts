import * as sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";

type EmailFormData = {
  to: string;
  message: string;
  formData: [
    {
      questionTitle: string;
      forms: [
        {
          formTitle: string;
          selected: string | string[];
        },
      ];
    },
  ];
};

export async function POST(req: NextRequest) {
  const { to, message, ...restBody }: EmailFormData = await req.json();

  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  // console.log("process.env.SENDGRID_API_KEY", process.env.SENDGRID_API_KEY);

  const msg = {
    to: ["eliascerne@icloud.com"], // Change to your recipient
    from: "office@synergiemontagen.eco", // Change to your verified sender
    subject: "Ihre Anfrage von Synergiemontagen",
    text: message,
    html: `<html>
<style>
table, th, td {
  border:1px solid black;
}
</style>
<body>

<h2>Vielen Dank für Ihre Anfrage mit Synergiemontagen</h2>

<table style="width:100%">
  <tr>
    <th>Form Title</th>
    <th>Selected</th>
  </tr>
  ${restBody.formData
    .map((form) =>
      form.forms
        .map(
          (f) => `
    <tr>
      <td>${f.formTitle}</td>
      <td>${Array.isArray(f.selected) ? f.selected.join(", ") : f.selected}</td>
    </tr>
  `
        )
        .join("")
    )
    .join("")}
</table>

<p>Falls Sie noch weitere Anfragen oder Fragen haben sollten, können Sie auf diese E-Mail antworten.</p>

</body>
</html>`,
  };

  let errorBoolean = false;

  try {
    sgMail.send(msg).then((value) => {
      console.log(value);
    });
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
