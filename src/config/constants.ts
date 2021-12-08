export const PREVIOUS_MONTHS_TO_INCLUDE_IN_AVERAGE = 6;

export const CONNECTION_REQUEST_STATUS = {
  PENDING: "pending",
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
