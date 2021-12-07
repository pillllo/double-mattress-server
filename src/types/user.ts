import { UserId } from "./id";

type User = {
  userId: UserId;
  firstName: string;
  email: string;
  currency: string;
  linkedUserIds: string[];
  activeSubscription: boolean;
};

export default User;
