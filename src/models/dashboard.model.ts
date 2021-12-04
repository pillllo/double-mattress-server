import AggregatesModel from "../models/aggregates.model";
import TransactionModel from "../models/transaction.model";
import {
  getIncomeCategoryKeys,
  getExpenseCategoryKeys,
} from "../helpers/category.helpers";
import { addMonth, getMonthStart } from "../helpers/date.helpers";

import { UserId } from "../types/id";

//----------------------------------------------------------------
// HELPER FUNCTIONS FOR COMPILING AGGREGATE TRANSACTIONS INTO
// DESIRED REPONSE SHAPE
//
// see README.md for response shape
//----------------------------------------------------------------

function _mergeObjectNumericValues(sources: any, destination: any) {
  // combine any numeric values from all aggregate objects
  // works for any number of aggregates
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

function _getBreakdownByUser(
  sources: [],
  destination: any,
  keysOfInterest: string[]
) {
  keysOfInterest.forEach((key) => {
    sources.forEach((source: any) => {
      const keyExists = destination.hasOwnProperty(key);
      // add desired key, and initialise nested value to empty object if not preset
      // then add nested userId and value for that user
      destination[key] = keyExists ? destination[key] : {};
      destination[key][source.userId] = source.categoriesForPeriod[key];
    });
  });
  return destination;
}

function _compileDashboardData(aggregates: any, transactions: any) {
  console.log("compileDashboardData()");
  const merged = _mergeObjectNumericValues(aggregates, {});
  const dashboardData = {
    categoryTotals: _getBreakdownByUser(
      aggregates,
      {},
      getExpenseCategoryKeys()
    ),
    typeTotals: _getBreakdownByUser(aggregates, {}, getIncomeCategoryKeys()),
    savings: {
      currentMonth: merged.savingsForPeriod,
      totalSinceJoining: merged.cumulativeSavingsSinceJoin,
    },
    transactions: transactions.flat(),
  };
  return dashboardData;
}

//----------------------------------------------------------------
// MODEL
//----------------------------------------------------------------

async function getDashboardData(userIds: UserId[], desiredDate: Date) {
  try {
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
