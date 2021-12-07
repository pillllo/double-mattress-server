import { UserId } from "./id";

export type NewUserRequest = {
  firstName: string;
  email: string;
  currency?: string;
  linkedUserIds: UserId[];
};
