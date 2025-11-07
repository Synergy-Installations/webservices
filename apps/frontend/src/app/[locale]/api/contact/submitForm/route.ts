import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type EmailFormData = {
  to: string;
  message: string;
  formData: {
    [key: string]:
      | string
      | string[]
      | Array<{
          uid: string;
          name: string;
          size: number;
          type: string;
          localUrl: string;
          status: string;
          downloadUrl: string;
        }>;
  };
};

// Helper function to format form field values for email display
function formatFormField(key: string, value: any): string {
  // Handle arrays (multipleSelection or fileUpload)
  if (Array.isArray(value)) {
    // Check if it's file upload data (objects with downloadUrl)
    if (
      value.length > 0 &&
      typeof value[0] === "object" &&
      value[0].downloadUrl
    ) {
      // File upload field
      return (
        value
          .filter((file) => file.status === "uploaded")
          .map(
            (file) =>
              `<div style="margin: 5px 0; padding: 8px; background-color: #f8f9fa; border-radius: 4px;">
            <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)<br>
            <a href="${file.downloadUrl}" style="color: #0CC0DF; text-decoration: none;" target="_blank">
              📎 Datei herunterladen
            </a>
          </div>`
          )
          .join("") || "<em>Keine Dateien hochgeladen</em>"
      );
    } else {
      // Multiple selection field
      return value.length > 0
        ? value.join(", ")
        : "<em>Keine Auswahl getroffen</em>";
    }
  }

  // Handle regular string values
  return value || "<em>Nicht angegeben</em>";
}

// Helper function to get a readable field label
function getFieldLabel(key: string): string {
  const labelMap: { [key: string]: string } = {
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    productSelection: "Produktauswahl",
    message: "Nachricht",
    multipleServices: "Ausgewählte Services",
    documents: "Hochgeladene Dokumente",
    funnel: "Aufmerksam durch",
  };

  return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

export async function POST(req: NextRequest) {
  const { to, message, ...restBody }: EmailFormData = await req.json();

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "office@synergie.cc",
      to: [to],
      subject: "Ihre Anfrage von Synergiemontagen",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/icons/Flyer%20Synergie%20B2C%20v1.svg" alt="Synergiemontagen Logo" style="max-width: 200px;" />
          </div>
          <h2 style="color: #0CC0DF;">Vielen Dank für Ihre Anfrage mit Synergiemontagen</h2>
          
          <div style="margin: 20px 0;">
            ${Object.entries(restBody.formData)
              .filter(
                ([key, value]) =>
                  key !== "message" &&
                  value !== undefined &&
                  value !== null &&
                  value !== ""
              )
              .map(([key, value]) => {
                const formattedValue = formatFormField(key, value);
                const label = getFieldLabel(key);

                // Check if it's a file upload field to apply special styling
                const isFileField =
                  Array.isArray(value) &&
                  value.length > 0 &&
                  typeof value[0] === "object" &&
                  value[0].downloadUrl;

                return `
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #0CC0DF;">${label}:</strong>
                    ${
                      isFileField
                        ? `<div style="margin-top: 8px;">${formattedValue}</div>`
                        : `<span style="margin-left: 8px;">${formattedValue}</span>`
                    }
                  </div>
                `;
              })
              .join("")}
          </div>

          ${
            message
              ? `
            <div style="margin: 20px 0;">
              <strong style="color: #0CC0DF;">Projektdetails:</strong>
              <div style="margin-top: 8px; padding: 12px; background-color: #f8f9fa; border-left: 4px solid #0CC0DF; border-radius: 4px;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>
          `
              : ""
          }
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 0.9em; color: #555;">
            Wenn Sie weitere Informationen, Details oder Dokumente haben, senden Sie diese bitte an uns. Wir freuen uns darauf, Ihnen zu helfen!
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 0.8em; color: #888;">© ${new Date().getFullYear()} Synergie.cc - Alle Rechte vorbehalten.</p>
          </div>
        </div>
      `,
    });
    if (error) {
      return new Response(`Email did not send: ${JSON.stringify(error)}`, {
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
    return new Response(
      `Email did not send (catch): ${JSON.stringify(error)}`,
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // return new Response(`Email sent successfully (final)`, {
  //   status: 200,
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });

  // const msg = {
  //   to: [to, "office@synergie.cc"], // Change to your recipient
  //   from: "office@synergie.cc", // Change to your verified sender
  //   subject: "Ihre Anfrage von Synergiemontagen",
  //   text: message,
  //   html: `
  //     <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  //       <div style="text-align: center; margin-bottom: 20px;">
  //         <img src="https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/icons/Flyer%20Synergie%20B2C%20v1.svg" alt="Synergiemontagen Logo" style="max-width: 200px;" />
  //       </div>
  //       <h2 style="color: #0CC0DF;">Vielen Dank für Ihre Anfrage mit Synergiemontagen</h2>
  //       <p><strong>Name:</strong> ${restBody.formData.name}</p>
  //       <p><strong>E-Mail:</strong> ${restBody.formData.email}</p>
  //       <p><strong>Tel.:</strong> ${restBody.formData.phone}</p>
  //       <p><strong>Produktauswahl:</strong> ${restBody.formData.productSelection}</p>
  //       <p><strong>Aufmerksam durch:</strong> ${restBody.formData.funnel}</p>
  //       <p><strong>Projektdetails:</strong> ${message}</p>
  //       <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
  //       <p style="font-size: 0.9em; color: #555;">
  //         Wenn Sie weitere Informationen, Details oder Dokumente haben, senden Sie diese bitte an uns. Wir freuen uns darauf, Ihnen zu helfen!
  //       </p>
  //       <div style="text-align: center; margin-top: 20px;">
  //         <p style="font-size: 0.8em; color: #888;">© ${new Date().getFullYear()} Synergie.cc - Alle Rechte vorbehalten.</p>
  //       </div>
  //     </div>
  //   `,
  // };

  // let errorBoolean = false;

  // await sgMail
  //   .send(msg)
  //   .then((value) => {})
  //   .catch((error) => {
  //     errorBoolean = true;
  //     console.error("Mail sent unseccussfully", error, error.code);
  //     if (error.response) {
  //       console.error(error.response.body);
  //     }
  //   });
  // return errorBoolean
  //   ? new Response(`Email did not send (final) ${errorBoolean}`, {
  //       status: 500,
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     })
  //   : new Response(`Email sent successfully (final) ${errorBoolean}`, {
  //       status: 200,
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
}
