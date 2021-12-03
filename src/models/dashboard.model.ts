import prisma from "./db";

import AggregatesModel from "../models/aggregates.model";
import TransactionModel from "../models/transaction.model";
import { addMonth, getMonthStart } from "../helpers/date.helpers";

import DynamicMap from "../types/dynamic-map";
import { UserId } from "../types/id";
import Transaction from "../types/transaction";

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

function mergeObjectValues(objects: []) {}

// TODO: try to make TS happy over nested arrays
function compileDashboardData(aggregates: any, transactions: any) {
  console.log("compileDashboardData(), aggregates for merge follow");
  // type TransactionAggregate = {
  //   id: number;
  //   userId: UserId;
  //   year: number;
  //   month: number;
  //   monthName: string;
  //   periodType: string;
  //   categoriesForPeriod: any;
  //   incomeForPeriod: number;
  //   expensesForPeriod: number;
  //   savingsForPeriod: number;
  //   cumulativeSavingsSinceJoin: number;
  // };

  const merged: DynamicMap = {};
  aggregates.forEach((agg: DynamicMap) => {
    Object.keys(agg).forEach((key: string) => {
      const value = agg[key];
      if (typeof value === "number") {
        const valueExists = merged.hasOwnProperty(key);
        merged[key] = valueExists ? merged[key] + value : value;
      }
    });
  });
  const dashboardData = {
    transactions: transactions.flat(),
  };
  return dashboardData;
}

async function getDashboardData(userIds: UserId[], desiredDate: Date) {
  try {
    console.time("getDashboardData");
    console.log("DashboardModel.getDashboardData()");
    console.log(userIds);
    console.log(`desiredDate: ${desiredDate.toISOString()}`);
    // ask history model if we have any previous months
    // will need them regardless
    const aggregates = await Promise.all(
      userIds.map(async (userId) => {
        const previousMonth = await AggregatesModel.getAggregateForMonth(
          userId,
          desiredDate
        );
        return previousMonth;
      })
    );
    console.log(aggregates);
    // get transactions for current month
    const from = getMonthStart(desiredDate);
    const to = getMonthStart(addMonth(desiredDate));
    const transactions = await Promise.all(
      userIds.map(async (userId) => {
        const tr = await TransactionModel.getTransactionsBetween(
          userId,
          from,
          to
        );
        return tr;
      })
    );
    // compile response
    const compiled = compileDashboardData(aggregates, transactions);
    console.timeEnd("getDashboardData");
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

const DashboardModel = {
  getDashboardData,
};

export default DashboardModel;
