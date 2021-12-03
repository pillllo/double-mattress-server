import { Request, Response } from "express";

import DashboardModel from "../models/dashboard.model";
import UserModel from "../models/user.model";
import { getSanitisedDate } from "../helpers/date.helpers";

async function getDashboard(req: Request, res: Response) {
  try {
    const { userId, date } = req.body;
    const allUserIds = await UserModel.getUserIds(userId);
    const desiredDate = getSanitisedDate(date);
    if (!allUserIds || !allUserIds.length || !desiredDate) {
      throw new Error("Invalid request");
    }
    const dashboardData = await DashboardModel.getDashboardData(
      allUserIds,
      desiredDate
    );
    res.status(200).send(dashboardData);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
}

const DashboardController = {
  getDashboard,
};

export default DashboardController;
