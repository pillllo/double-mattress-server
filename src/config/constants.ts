export const CORS_CONFIG = {
  origin: [
    "http://localhost:3000",
    "https://checkout.stripe.com",
    "https://double-mattress.herokuapp.com",
  ],
  credentials: true,
  methods: "*",
};

export const CONNECTION_REQUEST_STATUS = {
  OPEN: "open",
  REJECTED: "rejected",
  COMPLETE: "complete",
};

export const SOCKET_EVENTS = {
  CONNECT: "connect", // client
  CONNECTION: "connection", // server
  DISCONNECT: "disconnect",
  DISCONNECTING: "disconnecting",
  ID: {
    REQUEST: "id.request",
    CONFIRM: "id.confirm",
  },
  NOTIFICATIONS: {
    GET: "notifications.get",
    UPDATED: "notifications.updated",
    MARK_AS_READ: "notifications.mark_as_read",
  },
};
