import prisma from "./db";

import HistoryModel from "../models/history.model";
import TransactionModel from "../models/transaction.model";
import { UserId } from "../types/id";

async function getDashboardData(userIds: UserId[], desiredDate: Date) {
  try {
    console.log("dashboard.model.getDashboardData()");
    console.log(userIds);
    console.log(`desiredDate: ${desiredDate.toISOString()}`);
    const now = new Date();
    const nowMonth = now.getMonth();
    const desiredMonth = desiredDate.getMonth();
    // ask history model if we have any previous months
    // will need them regardless
    const aggregates = {};
    userIds.forEach((userId) => {
      const previousMonths = HistoryModel.getMonthAggregates(userId, desiredDate);
    })
    // get transactions for current month

  } catch (err) {
    console.error("ERROR: ", err);
  }
}

export default {
  getDashboardData,
};
