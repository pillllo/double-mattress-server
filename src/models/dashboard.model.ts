import AggregatesModel from "../models/aggregates.model";
import TransactionModel from "../models/transaction.model";
import {
  getIncomeCategoryKeys,
  getExpenseCategoryKeys,
} from "../helpers/category.helpers";
import { addMonth, getMonthStart } from "../helpers/date.helpers";

import { UserId } from "../types/id";

/*
RESPONSE FORMAT

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

function mergeObjectNumericValues(sources: any, destination: any) {
  sources.forEach((source: any) => {
    Object.keys(source).forEach((key) => {
      const value = source[key];
      if (typeof value === "number") {
        const valueExists = destination.hasOwnProperty(key);
        destination[key] = valueExists ? destination[key] + value : value;
      }
    });
  });
  return destination;
}

function getBreakdownByUser(
  sources: [],
  destination: any,
  keysOfInterest: string[]
) {
  // create an object with multiple keys of interest and nested totals by userId
  // {
  //   home: {
  //     USER_ID_1: someValue,
  //     USER_ID_2: someValue,
  //   }
  // }
  keysOfInterest.forEach((key) => {
    sources.forEach((source: any) => {
      const keyExists = destination.hasOwnProperty(key);
      // initialise nested value to an object if not preset
      destination[key] = keyExists ? destination[key] : {};
      destination[key][source.userId] = source.categoriesForPeriod[key];
    });
  });
  return destination;
}

// TODO: try to make TS happy over nested arrays
function compileDashboardData(aggregates: any, transactions: any) {
  console.log("compileDashboardData()");
  // combine any numeric values from all aggregate objects
  // works for any number of aggregates
  const merged = mergeObjectNumericValues(aggregates, {});
  // return values
  const dashboardData = {
    categoryTotals: getBreakdownByUser(
      aggregates,
      {},
      getExpenseCategoryKeys()
    ),
    typeTotals: getBreakdownByUser(aggregates, {}, getIncomeCategoryKeys()),
    savings: {
      currentMonth: merged.savingsForPeriod,
      totalSinceJoining: merged.cumulativeSavingsSinceJoin,
    },
    transactions: transactions.flat(),
  };
  return dashboardData;
}

async function getDashboardData(userIds: UserId[], desiredDate: Date) {
  try {
    console.time("getDashboardData");
    console.log("DashboardModel.getDashboardData()");
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
    // compile and sendresponse
    const compiled = compileDashboardData(aggregates, transactions);
    console.timeEnd("getDashboardData");
    return compiled;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

const DashboardModel = {
  getDashboardData,
};

export default DashboardModel;
