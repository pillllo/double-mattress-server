import prisma from "./db";

import { Notification } from "../types/notification";
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

async function createNotification(
  notification: Notification
): Promise<Notification[]> {
  try {
    console.log("NotificationModel.createNotification()");
    const result = await prisma.notification.create({
      data: notification,
    });
    console.log(result);
    const notifications = await prisma.notification.findMany({
      where: { forUserId: notification.forUserId, read: false },
      orderBy: { date: "desc" },
    });
    if (!notifications) throw "no unread notifications after create";
    return notifications;
  } catch (err) {
    console.error("ERROR: ", err);
    return [];
  }
}

async function markNotificationAsRead(notificationId: string) {
  // TODO: implement
  // try {
  //   console.log("NotificationModel.markNotificationAsRead()");
  //   const result = await prisma.notification.findMany({
  //     where: { forUserId: userId, notificationId },
  //     orderBy: { date: "desc" },
  //   });
  //   return result;
  // } catch (err) {
  //   console.error("ERROR: ", err);
  //   return [];
  // }
}

const NotificationModel = {
  getNotifications,
  createNotification,
  markNotificationAsRead,
};

export default NotificationModel;
