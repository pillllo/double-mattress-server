import NotificationModel from "../models/notification.model";

import { Socket } from "../types/socket";

import { SOCKET_EVENTS as EVENTS } from "../config/constants";

//----------------------------------------------------------------
// binds handlers for incoming events regarding notifications
//----------------------------------------------------------------

export function addNotificationEventHandlers(
  socket: Socket,
  socketManager: any
): void {
  // bind event listeners
  socket.on(EVENTS.NOTIFICATIONS.GET, async () => {
<<<<<<< HEAD
    console.log("socket -> getNotifications");
    const userId = socketManager.getUserIdForSocket(socket);
    console.log(userId);
=======
    const userId = socketManager.getUserIdForSocket(socket);
>>>>>>> dev
    if (userId) {
      const notifications = await NotificationModel.getNotifications(userId);
      socket.emit(EVENTS.NOTIFICATIONS.UPDATED, notifications);
    }
  });

  // TODO: finish / test
  socket.on(EVENTS.NOTIFICATIONS.MARK_AS_READ, async (payload: any) => {
    const { notificationId } = payload;
    if (notificationId) {
      const userId = socketManager.getUserIdForSocket(socket.id);
      const result = await NotificationModel.markNotificationAsRead(
        notificationId
      );
      socket.emit();
    }
  });
}
