import { Request, Response } from "express";

import DashboardModel from "../models/dashboard.model";
import UserModel from "../models/user.model";
import { getMonthStart, getSanitisedDate } from "../helpers/date.helpers";

async function getDashboard(req: Request, res: Response) {
  try {
    console.time("DashboardController.getDashboard");
    const { userId, date } = req.body;
    const allUserIds = await UserModel.getUserIds(userId);
    const sanitisedDate = getSanitisedDate(date);
    if (!allUserIds || !allUserIds.length || !sanitisedDate) {
      // TypeScript nonsense - can't access error.message or .cause
      throw "Invalid request";
    }
    const requestedMonthStart = getMonthStart(sanitisedDate);
    if (requestedMonthStart.getTime() > Date.now()) {
      throw "Future month requested";
    }
    const dashboardData = await DashboardModel.getDashboardData(
      allUserIds,
      requestedMonthStart
    );
    console.timeEnd("DashboardController.getDashboard");
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
