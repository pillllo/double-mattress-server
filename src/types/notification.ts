import { UserId } from "./id";

export type NotificationCreate = {
  forUserId: UserId;
  fromUserId?: UserId;
  fromUserName?: string;
  message: string;
};
