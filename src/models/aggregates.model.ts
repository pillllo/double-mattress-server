import prisma from "./db";

import TransactionModel from "../models/transaction.model";
import {
  changeMonth,
  getMonthStart,
  getMonthName,
} from "../helpers/date.helpers";
import { getKeyFromCategoryName } from "../helpers/category.helpers";

import CategoryTotals from "../types/category-totals";
import TransactionAggregate from "../types/transaction-aggregate";
import { UserId } from "../types/id";
// import { TransactionAggregate } from "@prisma/client";

//----------------------------------------------------------------
// PRIVATE
//----------------------------------------------------------------

function _createTransactionAggregate(
  userId: UserId,
  month: Date,
  categs: CategoryTotals,
  previousTransAgg: any
) {
  console.log("_createTransactionAggregate()");
  const incomeForPeriod = categs.salary + categs.otherIncome;
  const totalForPeriod = Object.values(categs).reduce((prev, current) => {
    return prev + current;
  }, 0);
  const expensesForPeriod = totalForPeriod - incomeForPeriod;
  const savingsForPeriod = incomeForPeriod - expensesForPeriod;
  const cumulSavings = previousTransAgg
    ? previousTransAgg.cumulativeSavingsSinceJoin + savingsForPeriod
    : savingsForPeriod;
  const transAgg = {
    userId,
    year: month.getFullYear(),
    month: month.getMonth() + 1, // JS is zero-based, will store one-based on DB
    monthName: getMonthName(month),
    categoriesForPeriod: categs,
    incomeForPeriod,
    expensesForPeriod,
    savingsForPeriod,
    cumulativeSavingsSinceJoin: cumulSavings,
  };
  return transAgg;
}

async function _generateMissingAggregates(
  userId: UserId
): Promise<TransactionAggregate[] | null> {
  try {
    console.log("AggregatesModel.generateAggregates()");
    // need to regenerate all aggregates any time a user is missing data
    // e.g. gap in app usage, or new transactions imported
    // easiest way without complex diffing logic - delete all existing aggregates
    const allAggs = await _deleteAllAggregates(userId);
    const transactions = await TransactionModel.getAllTransactions(userId);
    // we'll stop at first day of the current month
    const stopDate = getMonthStart(new Date());
    const stopTime = stopDate.getTime();
    // create an object for month being processed
    // lastTransAgg means we can calculate cumulative values
    let categoryTotals: CategoryTotals = {};
    const aggregates = [];
    let lastTransAgg;
    let curMonth = new Date(transactions[0].date);
    let nextMonth = changeMonth(curMonth, "add");
    curMonth = getMonthStart(curMonth);
    nextMonth = getMonthStart(nextMonth);
    let nextMonthStartTime = nextMonth.getTime();
    // start iterating transactions
    for (let i = 0; i < transactions.length; i += 1) {
      // console.log(`processing transaction ${i} of ${transactions.length}`);
      const tr = transactions[i];
      const trDate = new Date(tr.date);
      const trTime = trDate.getTime();
      if (trTime > nextMonthStartTime) {
        // submit category totals and reset before doing following month
        const transAgg = _createTransactionAggregate(
          userId,
          curMonth,
          categoryTotals,
          lastTransAgg
        );
        aggregates.push(transAgg);
        await prisma.transactionAggregate.create({ data: transAgg });
        // reset and prepare for next cycle - advance months
        lastTransAgg = transAgg;
        curMonth = nextMonth;
        nextMonth = changeMonth(nextMonth, "add");
        nextMonth = getMonthStart(nextMonth);
        nextMonthStartTime = nextMonth.getTime();
        categoryTotals = {};
        if (trTime > stopTime) break; // we are done
      }
      // add to running total for category
      const catKey = getKeyFromCategoryName(tr.category);
      categoryTotals[catKey] = categoryTotals[catKey] || 0;
      categoryTotals[catKey] += tr.amount;
    }
    return aggregates;
  } catch (err) {
    console.error("ERROR: ", err);
    return null;
  }
}

async function _deleteAllAggregates(userId: UserId): Promise<void> {
  try {
    console.log("AggregatesModel._deleteAllAggregates()");
    const { count } = await prisma.transactionAggregate.deleteMany({
      where: { userId: userId },
    });
    console.log("aggregates deleted: ", count);
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

//----------------------------------------------------------------
// PUBLIC
//----------------------------------------------------------------

async function getAggregateForMonth(userId: UserId, targetMonthStart: Date) {
  // dateOfInterest marks the last month in returned data set
  try {
    console.log("AggregatesModel.getAggregateForMonth() for userId: ", userId);
    console.log("desired aggregate date: ", targetMonthStart.toISOString());
    const targetMonth = targetMonthStart.getMonth() + 1; // compensate for JS zero-indexing
    const targetYear = targetMonthStart.getFullYear();
    let monthAgg = await prisma.transactionAggregate.findFirst({
      where: {
        userId: userId,
        month: targetMonth,
        year: targetYear,
      },
    });
    if (!monthAgg) {
      // there's no aggregate data for month requested by the user
      let firstTransaction = await prisma.transaction.findFirst({
        where: { userId: userId },
        orderBy: { date: "asc" },
      });
      if (!firstTransaction) {
        // user has no transactions at all, therefore no aggregates
        return null;
      }

      const firstTransactionMonthStart = new Date(firstTransaction.date);
      if (targetMonthStart.getTime() < firstTransactionMonthStart.getTime()) {
        // user is requesting aggregate for a month occurring before their first transaction
        return null;
      }

      const aggregates = await _generateMissingAggregates(userId);
      // TODO: 2x same DB call, refactor
      monthAgg = await prisma.transactionAggregate.findFirst({
        where: {
          userId: userId,
          month: targetMonth,
          year: targetYear,
        },
      });
    }
    return monthAgg;
  } catch (err) {
    console.error("ERROR: ", err);
    return null;
  }
}

const AggregatesModel = {
  getAggregateForMonth,
};

export default AggregatesModel;
