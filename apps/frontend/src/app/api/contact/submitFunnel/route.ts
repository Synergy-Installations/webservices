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
  // console.log(
  //   "process.env.SENDGRID_API_KEY",
  //   process.env.SENDGRID_API_KEY,
  //   to,
  //   message,
  //   restBody
  // );

  const msg = {
    to: [to, "office@synergiemontagen.eco"], // Change to your recipient
    from: "office@synergiemontagen.eco", // Change to your verified sender
    subject: "Ihre Anfrage von Synergiemontagen",
    text: "Ihre Anfrage wurde erfolgreich versendet",
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
  // console.log("msg", msg);
  // try {
  await sgMail
    .send(msg)
    .then((value) => {
      // console.log("Mail sent successfully");
      // console.log("then", value[0].body);
      // Does not get invoked
      // return new Response("Email sent successfully (then)", {
      //   status: 200,
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });
    })
    .catch((error) => {
      errorBoolean = true;
      console.error("Mail sent unseccussfully", error, error.code);
      if (error.response) {
        console.error(error.response.body);
      }
      // Does not get invoked
      // if (error.code != 200)
      //   return new Response("Email did not send (catch)", {
      //     status: 500,
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   });
      // else
      //   // return NextResponse.json({
      //   //   status: error.code,
      //   //   message: "Email did not send",
      //   // });
      //   return new Response("Email sent successfully (catch)", {
      //     status: 200,
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   });
    });
  // return NextResponse.json({
  //   message: "Email sent successfully (catch)",
  // });
  // } catch (error) {
  //   errorBoolean = true;
  //   console.error("error", error);
  //   return NextResponse.json({
  //     status: 500,
  //     message: "Email did not send catch",
  //   });
  // }

  // console.log("errorBoolean", errorBoolean);
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
