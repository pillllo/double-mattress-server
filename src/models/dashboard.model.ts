import prisma from "./db";

import AggregatesModel from "../models/aggregates.model";
import TransactionModel from "../models/transaction.model";
import { UserId } from "../types/id";

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

async function getDashboardData(userIds: UserId[], desiredDate: Date) {
  try {
    console.time("getDashboardData");
    console.log("dashboard.model.getDashboardData()");
    console.log(userIds);
    console.log(`desiredDate: ${desiredDate.toISOString()}`);
    const now = new Date();
    const nowMonth = now.getMonth();
    const desiredMonth = desiredDate.getMonth();
    // ask history model if we have any previous months
    // will need them regardless
    const aggregates = [];
    userIds.forEach(async (userId) => {
      const previousMonth = await AggregatesModel.getAggregateForMonth(
        userId,
        desiredDate
      );
      aggregates.push(previousMonth);
    });
    // get transactions for current month

    // compile response
    console.timeEnd("getDashboardData");
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

const DashboardModel = {
  getDashboardData,
};

export default DashboardModel;
