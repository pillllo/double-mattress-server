import { Request, Response } from "express";

import DashboardModel from "../models/dashboard.model";
import UserModel from "../models/user.model";
import { getSanitisedDate } from "../helpers/date.helpers";

/*
RESPONSE

{
  transactions: [], // unfiltered / unsorted transactions for all users
  categoryTotals: {
    home: {
      USER_A_ID: 456,
      USER_B_ID: 457,
    },
    shopping: 4567,
    ...
  },
  typeTotals: {
    income: {
      USER_A_ID: 98456798,
      USER_B_ID: 93485798,
    },
    expenses: {
     USER_A_ID: 456,
     USER_B_ID: 457,
    },
  savings: {
    // combined for all linked users
    currentMonth: 45774,
    monthlyAverageSinceJoining: 947698,
    totalSinceJoining: 456987798,
  }
}
*/

async function getDashboard(req: Request, res: Response) {
  try {
    const { userId, date } = req.body;
    const allUserIds = await UserModel.getUserIds(userId);
    const desiredDate = getSanitisedDate(date);
    if (!allUserIds || !allUserIds.length || !desiredDate) {
      throw new Error("invalid request");
    }
    const dashboardData = await DashboardModel.getDashboardData(
      allUserIds,
      desiredDate
    );
    console.log(dashboardData);

    res.status(418).send();
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get dashboard data");
  }
}

const DashboardController = {
  getDashboard,
};

export default DashboardController;
