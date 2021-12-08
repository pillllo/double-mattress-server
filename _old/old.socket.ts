import {
  SocketServer,
  SocketMiddleware,
  Socket,
  SocketPacket,
  SocketError,
} from "../types/socket";

import { SOCKET_EVENTS as EVENTS } from "../config/constants";

function isAuthorised(socket: Socket) {
  const { auth: SocketAuth } = socket.handshake;
  // TODO: enable
  // return auth && auth.token && auth.token === process.env.CLIENT_JWT;
  return true;
}

function registerSocketHandlers(socketServer: SocketServer) {
  socketServer.on(EVENTS.CONNECTION, (socket: Socket): void => {
    socket.use((packet: SocketPacket, next: SocketMiddleware) => {
      if (isAuthorised(socket)) {
        next();
      } else {
        return next(new Error("unauthorised"));
      }
    });
    socket.on("error", (err: SocketError) => {
      if (err && err.message === "unauthorised") {
        socket.disconnect();
      }
    });
    // add socket to managed pool
    // socketServer.to("lobby").emit(LOBBY.ROOMS_CHANGED, lobbyManager.getRooms());

    socket.on(EVENTS.DISCONNECTING, (reason: string) => {
      console.log(`${EVENTS.DISCONNECTING} with reason: ${reason}`);
      // remove socket from managed pool
    });
  });
}

export default registerSocketHandlers;
