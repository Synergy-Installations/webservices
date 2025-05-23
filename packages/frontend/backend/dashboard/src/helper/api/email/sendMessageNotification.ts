import { MessageInterface } from "@com.synergy/frontend-backend-dashboard/message";
import mongoose from "mongoose";
import Chat from "../../../db/models/chat";
import { MembersRightsPopulatedUserOrigin } from "../../../db/utils/types/members";
import Submit from "../../../db/models/submit";
import Step from "../../../db/models/step";
import Message from "../../../db/models/message";

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

  const messages = await Message.find({
    [chatId ? "chatId" : "stepId"]: chatId ? chatId : stepId,
  })
    .populate("sentByUserId", "firstName lastName emailAddress")
    .sort({ createdAt: -1 })
    .limit(10)
    .exec();

  console.log("messages", messages, "newMessage", newMessage);

  console.log("sendToUsers", sendToUsers);
};

export default sendMessageNotification;
