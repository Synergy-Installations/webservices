import { MessageInterface } from "@com.synergy/frontend-backend-dashboard/message";
import mongoose from "mongoose";
import Chat from "../../../db/models/chat";
import { MembersRightsPopulatedUserOrigin } from "../../../db/utils/types/members";
import Submit from "../../../db/models/submit";
import Step from "../../../db/models/step";
import Message from "../../../db/models/message";
import nodemailer from "nodemailer";

interface SendMessageNotificationParams {
  params: {
    submitId?: mongoose.Types.ObjectId;
    stepId?: mongoose.Types.ObjectId;
    chatId?: mongoose.Types.ObjectId;
  };
  newMessage: MessageInterface;
}

export const sendMessageNotification = async (
  props: SendMessageNotificationParams
) => {
  const {
    params: { submitId, stepId, chatId },
    newMessage,
  } = props;

  let sendToUsers: MembersRightsPopulatedUserOrigin[] = [];
  let emailTitle: string = "";
  let emailDescription: string = "";

  if (chatId !== undefined) {
    const chat = await Chat.findById(chatId)
      .populate({
        path: "members",
        populate: {
          path: "userUid",
          model: "User",
          select: "firstName lastName emailAddress",
        },
      })
      .sort({ createdAt: 1 })
      .exec();

    emailTitle = chat?.title;
    emailDescription = `Sie haben eine neue Nachricht in der Chatgruppe "${chat?.title}" erhalten, weil Sie Mitglied dieser Gruppe oder Projekt sind.`;

    if (chat?.members) {
      chat.members.forEach((member: any) => {
        const user = member.userUid;
        if (
          !sendToUsers.some(
            (existingUser) =>
              existingUser._id.toString() === user._id.toString()
          )
        ) {
          sendToUsers.push({
            _id: user._id,
            firstName: user.firstName as string,
            lastName: user.lastName as string,
            emailAddress: user.emailAddress as string,
            from: "Chat",
          } as MembersRightsPopulatedUserOrigin);
        }
      });
    }

    console.log("chat visibility", chat?.visibility);
    if (chat?.visibility === "public") {
      const submit = await Submit.findById(submitId)
        .select(["_id", "members", "status", "visibility"])
        .populate({
          path: "members",
          populate: {
            path: "userUid",
            model: "User",
            select: "firstName lastName emailAddress",
          },
        })
        .sort({ createdAt: 1 })
        .exec();

      if (submit?.members) {
        submit.members.forEach((member: any) => {
          const user = member.userUid;
          if (
            !sendToUsers.some(
              (existingUser) =>
                existingUser._id.toString() === user._id.toString()
            )
          ) {
            sendToUsers.push({
              _id: user._id,
              firstName: user.firstName as string,
              lastName: user.lastName as string,
              emailAddress: user.emailAddress as string,
              from: "Submit",
            } as MembersRightsPopulatedUserOrigin);
          }
        });
      }
    }
  } else if (stepId !== undefined) {
    const step = await Step.findById(chatId)
      .populate({
        path: "members",
        populate: {
          path: "userUid",
          model: "User",
          select: "firstName lastName emailAddress",
        },
      })
      .sort({ createdAt: 1 })
      .exec();

    emailTitle = step?.title;
    emailDescription = `Sie haben eine neue Nachricht in dem Schritt ${step?.title} erhalten, weil Sie ein Mitglied des Schrittes oder dem Projekt sind.`;

    if (step?.members) {
      step.members.forEach((member: any) => {
        const user = member.userUid;
        if (
          !sendToUsers.some(
            (existingUser) =>
              existingUser._id.toString() === user._id.toString()
          )
        ) {
          sendToUsers.push({
            _id: user._id,
            firstName: user.firstName as string,
            lastName: user.lastName as string,
            emailAddress: user.emailAddress as string,
            from: "Step",
          } as MembersRightsPopulatedUserOrigin);
        }
      });
    }

    if (step?.visibility === "public") {
      const submit = await Submit.findById(submitId)
        .select(["_id", "members", "status", "visibility"])
        .populate({
          path: "members",
          populate: {
            path: "userUid",
            model: "User",
            select: "firstName lastName emailAddress",
          },
        })
        .sort({ createdAt: 1 })
        .exec();

      if (submit?.members) {
        submit.members.forEach((member: any) => {
          const user = member.userUid;
          if (
            !sendToUsers.some(
              (existingUser) =>
                existingUser._id.toString() === user._id.toString()
            )
          ) {
            sendToUsers.push({
              _id: user._id,
              firstName: user.firstName as string,
              lastName: user.lastName as string,
              emailAddress: user.emailAddress as string,
              from: "Submit",
            } as MembersRightsPopulatedUserOrigin);
          }
        });
      }
    }
  }

  if (sendToUsers.length !== 0) {
    const messages = await Message.find({
      [chatId ? "chatId" : "stepId"]: chatId ? chatId : stepId,
    })
      .populate("sentByUserId", "firstName lastName emailAddress")
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    // console.log("messages", messages, "newMessage", newMessage);

    // console.log(
    //   "process.env.SMTP_HOST",
    //   process.env.SMTP_HOST,
    //   process.env.SMTP_PORT,
    //   parseInt(process.env.SMTP_PORT || "587", 10),
    //   process.env.SMTP_REQUIRE_TLS === "true",
    //   process.env.SMTP_USER
    // );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      // secureConnection: false,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      requireTLS: process.env.SMTP_REQUIRE_TLS === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "true",
      },
    });

    // Wrap in an async IIFE so we can use await.
    await (async () => {
      const info = await transporter.sendMail({
        from: '"Michael Riegler" <office@synergiemontagen.eco>',
        to: sendToUsers.map((user) => user.emailAddress).join(", "),
        subject: "Neue Nachricht auf Synergiemontagen erhalten",
        text: `"${messages[0].message}" von ${
          messages[0].sentByUserId?.firstName ||
          messages[0].sentByUserId?.lastName
            ? `${messages[0].sentByUserId?.firstName || ""} ${messages[0].sentByUserId?.lastName || ""}`.trim()
            : "Unbekannter Benutzer"
        } gesendet.`, // plain‑text body
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/icons/Flyer%20Synergie%20B2C%20v1.svg" alt="Projekt-Logo" style="max-width: 300px; margin-bottom: 10px;" />
      <h1 style="font-size: 24px; font-weight: bold; margin: 0;">${emailTitle}</h1>
      <p style="font-size: 14px; color: #555;">${emailDescription}</p>
      </div>
      <div style="margin-bottom: 20px;">
      <h2 style="font-size: 20px; font-weight: bold; color: #333;">Hallo, Sie haben eine neue Nachricht erhalten.</h2>
      <div style="background-color: #e6f7ff; padding: 15px; border-radius: 8px; border: 1px solid #91d5ff; margin-top: 10px;">
      <span style="font-size: 14px; font-weight: bold; color: #1890ff;">${
        messages[0].sentByUserId?.firstName ||
        messages[0].sentByUserId?.lastName
          ? `${messages[0].sentByUserId?.firstName || ""} ${messages[0].sentByUserId?.lastName || ""}`.trim()
          : "Unbekannter Benutzer"
      }<span style="background-color: #1890ff; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 5px;">NEU</span></span>
      <p style="font-size: 14px; color: #333; margin: 10px 0;">${messages[0].message}</p>
      </div>
      </div>
      <div style="text-align: center; margin-bottom: 20px;">
      <a href="${chatId !== undefined ? `https://synergiemontagen.eco/dashboard/submit/${submitId}/chats/${chatId}/messages` : `https://synergiemontagen.eco/dashboard/submit/${submitId}/steps/${stepId}/chat`}" style="display: inline-block; background-color: #1890ff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Jetzt antworten</a>
      </div>
      <div style="margin-bottom: 20px;">
      <h3 style="font-size: 18px; font-weight: bold; color: #333;">Ältere Nachrichten</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
      ${messages
        .slice(1) // Exclude the first message
        .map(
          (msg) => `
      <li style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ddd;">
      <span style="font-weight: bold; color: #333;">${
        msg.sentByUserId?.firstName || msg.sentByUserId?.lastName
          ? `${msg.sentByUserId?.firstName || ""} ${msg.sentByUserId?.lastName || ""}`.trim()
          : "Unbekannter Benutzer"
      }</span>
      <span style="font-size: 12px; color: #999; margin-left: 10px;">${new Date(msg.createdAt).toLocaleString("de-DE")}</span>
      <p style="font-size: 14px; color: #555; margin: 5px 0;">${msg.message}</p>
      </li>
      `
        )
        .join("")}
      </ul>
      </div>
      <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
      <p>Bitte antworten Sie nicht auf diese E-Mail, nutzen Sie den Button oben.</p>
      <p>&copy; ${new Date().getFullYear()} Synergiemontagen.eco - Alle Rechte vorbehalten.</p>
      </div>
      </div>
      `,
      });

      console.log("Message sent:", info.messageId);
    })();
  }

  // console.log("sendToUsers", sendToUsers);
};

export default sendMessageNotification;
