const { v1: uuidv1 } = require("uuid");

import { Socket, SocketPool } from "../types/socket";
import { UserId } from "../types/id";

function SocketManager() {
  //----------------------------------------------------------------
  // PRIVATE
  //----------------------------------------------------------------

  // object mapping userId to { socketId: SOCKET_ID }
  const _pool: SocketPool = {};

  const _getUserIdForSocket = (socket: Socket): UserId | undefined => {
    const userIds = Object.keys(_pool);
    const matchedId = userIds.find((userId) => {
      return _pool[userId]?.socketId === socket.id;
    });
    return matchedId;
  };

  //----------------------------------------------------------------
  // EXPORT
  //----------------------------------------------------------------

  const addSocket = (userId: UserId, socket: Socket): void => {
    console.log("SocketManager.addSocket() with userId: ", userId);
    console.log("_pool before add: ", _pool);
    _pool[userId] = {
      socketId: socket.id,
    };
    console.dir("_pool after add: ", _pool);
  };

  const getSocketIdForUser = (userId: UserId) => {
    return _pool[userId]?.socketId;
  };

  const removeSocket = (socket: Socket) => {
    console.log(`SocketManager.removeSocket() for socket.id: ${socket.id}`);
    console.log("_pool before delete: ", _pool);
    const userId = _getUserIdForSocket(socket);
    if (userId) {
      delete _pool[userId];
      console.log("_pool after delete: ", _pool);
    }
  };

  return {
    addSocket,
    getSocketIdForUser,
    removeSocket,
  };
}

export default SocketManager;
