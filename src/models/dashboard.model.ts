import AggregatesModel from "../models/aggregates.model";
import TransactionModel from "../models/transaction.model";
import {
  getIncomeCategoryKeys,
  getExpenseCategoryKeys,
} from "../helpers/category.helpers";
import { changeMonth, getMonthStart } from "../helpers/date.helpers";

import { UserId } from "../types/id";

//----------------------------------------------------------------
// HELPER FUNCTIONS FOR COMPILING AGGREGATE TRANSACTIONS INTO
// DESIRED REPONSE SHAPE
//
// see README.md for response shape
//----------------------------------------------------------------

function _mergeObjectNumericValues(sources: any, destination: any) {
  // combine any numeric values from sources array of all aggregate objects
  // works for any number of aggregates
  // one or either source may be null if no aggregate for that user for that month
  sources.forEach((source: any) => {
    if (source && typeof source === "object") {
      Object.keys(source).forEach((key) => {
        const value = source[key];
        if (typeof value === "number") {
          const valueExists = destination.hasOwnProperty(key);
          destination[key] = valueExists ? destination[key] + value : value;
        }
      });
    }
  });
  return Object.keys(destination).length > 0 ? destination : null;
}

function _getBreakdownByUser(
  sources: [],
  destination: any,
  keysOfInterest: string[]
) {
  // one or either source may be null if no aggregate for that user for that month
  keysOfInterest.forEach((key) => {
    sources.forEach((source: any) => {
      if (source && typeof source === "object") {
        const keyExists = destination.hasOwnProperty(key);
        // add desired key, and initialise nested value to empty object if not preset
        // then add nested userId and value for that user
        destination[key] = keyExists ? destination[key] : {};
        destination[key][source.userId] = source.categoriesForPeriod[key];
      }
    });
  });
  return Object.keys(destination).length > 0 ? destination : null;
}

function _compileDashboardData(aggregates: any, transactions: any) {
  // because we are processing 2 user's info at once, we can't return any earlier
  // until we know that there is no aggregate data for either
  console.log("_compileDashboardData()");
  const merged = _mergeObjectNumericValues(aggregates, {});
  // yuck
  const savings = merged
    ? {
        currentMonth: merged.savingsForPeriod,
        totalSinceJoining: merged.cumulativeSavingsSinceJoin,
      }
    : null;

  const dashboardData = {
    categoryTotals: _getBreakdownByUser(
      aggregates,
      {},
      getExpenseCategoryKeys()
    ),
    typeTotals: _getBreakdownByUser(aggregates, {}, getIncomeCategoryKeys()),
    savings,
    transactions: transactions.flat(),
  };
  return dashboardData;
}

//----------------------------------------------------------------
// MODEL
//----------------------------------------------------------------

async function getDashboardData(userIds: UserId[], fromMonthStart: Date) {
  try {
    console.log("DashboardModel.getDashboardData()");
    console.log("dashboard date: ", fromMonthStart.toISOString());
    // get aggregate data for previous month
    // const previousMonth = changeMonth(fromMonthStart, "subtract");
    const aggregates = await Promise.all(
      userIds.map(async (userId) => {
        const agg = await AggregatesModel.getAggregateForMonth(
          userId,
          fromMonthStart
        );
        return agg;
      })
    );
    // get transactions for requested month for all requested users
    const to = getMonthStart(changeMonth(fromMonthStart, "add"));
    const transactions = await Promise.all(
      userIds.map(async (userId) => {
        const tr = await TransactionModel.getTransactionsBetween(
          userId,
          fromMonthStart,
          to
        );
        return tr;
      })
    );
    const compiled = _compileDashboardData(aggregates, transactions);
    return compiled;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

const DashboardModel = {
  getDashboardData,
};

export default DashboardModel;
