import prisma from "./db";
import { v4 as uuid } from "uuid";

import { UserId } from "../types/id";

async function getNotifications(userId: UserId) {
  try {
    console.log("NotificationModel.getNotifications()");
    const notifications = await prisma.notification.findMany({
      where: { forUserId: userId },
      orderBy: { date: "desc" },
    });
    return notifications;
  } catch (err) {
    console.error("ERROR: ", err);
    return [];
  }
}

const NotificationModel = {
  getNotifications,
};

export default NotificationModel;
