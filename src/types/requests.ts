import { UserId } from "./id";

export type NewUserRequest = {
  firstName: string;
  currency?: string;
  linkedUserIds: UserId[];
};
