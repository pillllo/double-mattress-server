import { Request, Response } from "express";

import DashboardModel from "../models/dashboard.model";
import UserModel from "../models/user.model";
0;
async function getDashboard(req: Request, res: Response) {
  try {
    const { userId, from, to } = req.body;
    const allUsers = await UserModel.getUsers(userId);
    const allUserIds = allUsers?.map((user) => user.userId);
    // const transactions = await DashboardModel.getDashboardData();
    res.status(418).send();
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get transactions");
  }
}

export default {
  getDashboard,
};
