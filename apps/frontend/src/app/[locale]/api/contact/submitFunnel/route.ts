import * as sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";

type EmailFormData = {
  to: string;
  message: string;
  submitId: string;
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
  const { to, message, submitId, ...restBody }: EmailFormData =
    await req.json();

  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  // console.log(
  //   "process.env.SENDGRID_API_KEY",
  //   process.env.SENDGRID_API_KEY,
  //   to,
  //   message,
  //   restBody
  // );
  console.log("restBody", restBody);

  const msg = {
    to: [to, "office@synergiemontagen.eco", "admin@synergiemontagen.eco"], // Change to your recipient
    from: "office@synergiemontagen.eco", // Change to your verified sender
    subject: "Ihre Anfrage von Synergiemontagen",
    text: "Ihre Anfrage wurde erfolgreich versendet",
    html: `
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #ffffff;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #333;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #efefef;
      padding: 20px;
      text-align: center;
    }
    .email-header img {
      max-width: 150px;
    }
    .email-body {
      padding: 20px;
    }
    .email-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
    }
    .email-description {
      font-size: 16px;
      margin-bottom: 20px;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    table th {
      background-color: #0cc0df;
      color: white;
    }
    .email-button-top {
      margin-bottom: 20px;
      text-align: center;
    }
    .email-button-bottom {
      margin-top: 20px;
      text-align: center;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      font-size: 16px;
      color: #ffffff;
      background-color: #0cc0df;
      text-decoration: none;
      border-radius: 5px;
    }
    .button:hover {
      background-color: #0cc0df;
    }
    .email-footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      padding: 10px;
      background-color: #f4f4f4;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/icons/Flyer%20Synergie%20B2C%20v1.svg" alt="Synergiemontagen Logo" />
    </div>
    <div class="email-body">
      <h2 class="email-title">Vielen Dank für Ihre Anfrage mit Synergiemontagen</h2>
      <p class="email-description">
        Wir haben Ihre Anfrage erfolgreich erhalten. Sie können jetzt Ihr Dashboard besuchen, um den Status Ihrer Anfrage zu überprüfen, oder mit unserem Team kommunizieren, falls Sie weitere Fragen haben.
      </p>
      <div class="email-button-top">
        <a href="${submitId ? `https://synergiemontagen.eco/dashboard/submits/${submitId}/steps` : "https://synergiemontagen.eco/dashboard"}" class="button">Zum Dashboard</a>
      </div>
      <table>
        <thead>
          <tr>
            <th>Frage</th>
            <th>Ausgewählt</th>
          </tr>
        </thead>
        <tbody>
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
        </tbody>
      </table>
      <div class="email-button-bottom">
        <a href="${submitId ? `https://synergiemontagen.eco/dashboard/submits/${submitId}/steps` : "https://synergiemontagen.eco/dashboard"}" class="button">Zum Projekt</a>
      </div>
    </div>
    <div class="email-footer">
      © ${new Date().getFullYear()} Synergiemontagen.eco - Alle Rechte vorbehalten.
    </div>
  </div>
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
