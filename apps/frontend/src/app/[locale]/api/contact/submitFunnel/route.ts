import * as sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

  const resend = new Resend(process.env.RESEND_API_KEY);
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  // console.log(
  //   "process.env.SENDGRID_API_KEY",
  //   process.env.SENDGRID_API_KEY,
  //   to,
  //   message,
  //   restBody
  // );
  // console.log("restBody", restBody);

  try {
    const { data, error } = await resend.emails.send({
      from: "office@synergiemontagen.eco",
      to: [to, "office@synergiemontagen.eco"],
      subject: "Ihre Anfrage von Synergiemontagen",
      html: `
  <html>
  <head>
    <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #000;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      color: #000;
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
      color: #000;
    }
    .email-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
      color: #000;
    }
    .email-description {
      font-size: 16px;
      margin-bottom: 20px;
      text-align: center;
      color: #000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      color: #000;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      color: #000;
    }
    table th {
      background-color: #0cc0df;
      color: #fff;
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
    });
    if (error) {
      return new Response(`Email did not send: ${error}`, {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(`Email sent successfully (final)`, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(`Email did not send (catch): ${error}`, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
