import { Server as io } from "socket.io";

import SocketManager from "./manager.socket";
import { addNotificationEventHandlers } from "./notification.socket";

import { Notification } from "../types/notification";
import {
  SocketServer,
  SocketMiddleware,
  Socket,
  SocketPacket,
  SocketError,
} from "../types/socket";

import { CORS_CONFIG, SOCKET_EVENTS as EVENTS } from "../config/constants";

//----------------------------------------------------------------
// PRIVATE VARS
//----------------------------------------------------------------

let _socketServer: SocketServer;
const socketManager = SocketManager();

function _isAuthorised(socket: Socket) {
  const { auth: SocketAuth } = socket.handshake;
  // TODO: enable
  // return auth && auth.token && auth.token === process.env.CLIENT_JWT;
  return true;
}

//----------------------------------------------------------------
// EXPORTS
//----------------------------------------------------------------

export function init(httpServer: any) {
<<<<<<< HEAD
  _socketServer = new io(httpServer, { cors: CORS_CONFIG });
=======
  _socketServer = new io(httpServer);
>>>>>>> dev
  // bind connection listeners
  _socketServer.on(EVENTS.CONNECTION, (socket: Socket): void => {
    console.log("socket connected with id: ", socket.id);
    // auth middleware
    socket.use((packet: SocketPacket, next: SocketMiddleware) => {
      if (_isAuthorised(socket)) {
        next();
      } else {
        return next(new Error("unauthorised"));
      }
    });
    // error handling middleware
    socket.on("error", (err: SocketError) => {
      if (err && err.message === "unauthorised") {
        socket.disconnect();
      }
    });
    // request userId so we can correlate userId from data models
    // -> socket.id for sending future messages
    socket.on(EVENTS.ID.CONFIRM, (payload: any) => {
<<<<<<< HEAD
      if (payload && payload.userId) {
        socketManager.addSocket(payload.userId, socket);
=======
      const { userId } = payload;
      if (userId) {
        socketManager.addSocket(userId, socket);
>>>>>>> dev
        addNotificationEventHandlers(socket, socketManager);
      } else {
        socket.disconnect();
      }
    });
    socket.emit(EVENTS.ID.REQUEST);

    socket.on(EVENTS.DISCONNECTING, (reason: string) => {
      console.log(`${EVENTS.DISCONNECTING} with reason: ${reason}`);
      // remove socket from managed pool
      socketManager.removeSocket(socket);
    });
  });
}

export function sendNotificationOnSocket(notifications: Notification[]) {
  console.log("sendNotificationsOnSocket()");
  const { forUserId } = notifications[0];
  const socketId = socketManager.getSocketIdForUser(forUserId);
  if (socketId) {
    // target user is currently connected
    _socketServer
      .to(socketId)
      .emit(EVENTS.NOTIFICATIONS.UPDATED, notifications);
  }
}
