import prisma from "./db";

import TransactionModel from "../models/transaction.model";
import { addMonth, getMonthStart, getMonthName } from "../helpers/date.helpers";
import { getKeyFromCategoryName } from "../helpers/category.helpers";

import CategoryTotals from "../types/category-totals";
import { UserId } from "../types/id";

function createTransactionAggregate(
  userId: UserId,
  month: Date,
  categs: CategoryTotals,
  previousTransAgg: any
) {
  console.log("createTransactionAggregate()");
  console.log(categs);
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

async function generateMissingAggregates(userId: UserId) {
  try {
    console.log("AggregatesModel.generateAggregates()");
    // get all aggregates for user
    const allAggs = await getAllAggregates(userId);
    // TODO: HERE HERE !!!
    // if none, get all transactions (first in array is oldest)
    const transactions = await TransactionModel.getAllTransactions(userId);
    // we'll stop at first day of the current month
    const stopDate = getMonthStart(new Date());
    const stopTime = stopDate.getTime();
    // create an object for month being processed
    // lastTransAgg means we can calculate cumulative values
    let categoryTotals: CategoryTotals = {};
    let lastTransAgg;
    let curMonth = new Date(transactions[0].date);
    let nextMonth = addMonth(curMonth);
    curMonth = getMonthStart(curMonth);
    nextMonth = getMonthStart(nextMonth);
    let nextMonthStartTime = nextMonth.getTime();
    // start iterating transactions
    for (let i = 0; i < transactions.length; i += 1) {
      // console.log(`processing transaction ${i} of ${transactions.length}`);
      const tr = transactions[i];
      const trDate = new Date(tr.date);
      const trTime = trDate.getTime();
      if (trTime > stopTime) break; // we are done
      if (trTime < nextMonthStartTime) {
        // add to running total for category
        const catKey = getKeyFromCategoryName(tr.category);
        categoryTotals[catKey] = categoryTotals[catKey] || 0;
        categoryTotals[catKey] += tr.amount;
      } else {
        // submit category totals and reset before doing following month
        const transAgg = createTransactionAggregate(
          userId,
          curMonth,
          categoryTotals,
          lastTransAgg
        );
        console.log(transAgg);
        await prisma.transactionAggregate.create({ data: transAgg });
        // reset and prepare for next cycle - advance months
        lastTransAgg = transAgg;
        curMonth = nextMonth;
        nextMonth = addMonth(nextMonth);
        nextMonth = getMonthStart(nextMonth);
        nextMonthStartTime = nextMonth.getTime();
        categoryTotals = {};
      }
    }
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

async function getAllAggregates(userId: UserId) {
  try {
    console.log("AggregatesModel.getAllAggregates()");
    const allAggs = await prisma.transactionAggregate.findMany({
      where: { userId: userId },
    });
    return allAggs;
  } catch (err) {
    console.error("ERROR: ", err);
    return [];
  }
}

async function getAggregateForMonth(userId: UserId, dateOfInterest: Date) {
  // dateOfInterest marks the last month in returned data set
  // count all records we have to calculate new average
  try {
    console.log("AggregatesModel.getAggregateForMonth() for userId: ", userId);
    let monthAgg = await prisma.transactionAggregate.findFirst({
      where: {
        userId: userId,
        month: dateOfInterest.getMonth() + 1,
        year: dateOfInterest.getFullYear(),
      },
    });
    if (!monthAgg) {
      await generateMissingAggregates(userId);
      // TODO: 2x same DB call, refactor
      monthAgg = await prisma.transactionAggregate.findFirst({
        where: {
          userId: userId,
          month: dateOfInterest.getMonth() + 1,
          year: dateOfInterest.getFullYear(),
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
  generateMissingAggregates,
  getAllAggregates,
  getAggregateForMonth,
};

export default AggregatesModel;
