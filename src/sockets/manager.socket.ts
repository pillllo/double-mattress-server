import { Socket, SocketId, SocketPool } from "../types/socket";
import { UserId } from "../types/id";

function SocketManager() {
  // simple object mapping userId to { socketId: SOCKET_ID }
  const _pool: SocketPool = {};

  const addSocket = (userId: UserId, socket: Socket): void => {
    console.log("SocketManager.addSocket() with userId: ", userId);
    _pool[userId] = {
      socketId: socket.id,
    };
    console.log("_pool after socket added: ", _pool);
  };

  const getUserIdForSocket = (socket: Socket): UserId | undefined => {
    const userIds = Object.keys(_pool);
    const matchedId = userIds.find((userId) => {
      return _pool[userId]?.socketId === socket.id;
    });
    return matchedId;
  };

  const getSocketIdForUser = (userId: UserId): SocketId | undefined => {
    return _pool[userId]?.socketId;
  };

  const removeSocket = (socket: Socket): void => {
    const userId = getUserIdForSocket(socket);
    if (userId) {
      delete _pool[userId];
    }
  };

  return {
    addSocket,
    getSocketIdForUser,
    getUserIdForSocket,
    removeSocket,
  };
}

export default SocketManager;
