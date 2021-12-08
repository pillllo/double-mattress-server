export type SocketServer = any;

export type SocketMiddleware = (error?: SocketError) => void;

export type Socket = any;

export type SocketPacket = any;

export type SocketAuth = {
  token: string;
};

export type SocketError = {
  message: string;
};

export type SocketPool = {
  [key: string]: {
    socketId: string;
  };
};
