import { UserId } from "./id";

export type Notification = {
  id?: number;
  forUserId: UserId;
  fromUserId?: UserId | null;
  fromUserName?: string | null;
  date?: string | Date | null;
  message: string;
  read?: boolean | null;
};
