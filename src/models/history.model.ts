import prisma from "./db";

import TransactionModel from "../models/transaction.model";

/*
model TransactionAggregate {
  id                         Int    @id @default(autoincrement())
  userId                     String
  year                       Int
  month                      Int
  periodType                 String @default("month")
  categoriesForPeriod        Json
  incomeForPeriod            Int
  expensesForPeriod          Int
  savingsForPeriod           Int
  cumulativeSavingsSinceJoin Int
  avgMonthlySavingsSinceJoin Int
  monthsSinceJoin            Int
}
*/

async function generateAggregates() {
  // TODO: HERE!!!
  // see if ANY records -maybe do in previous func?
  // find last month
  // get transactions for all intervening months
  // generate
}

async function getAggregateForMonth(userId: string, dateOfInterest: Date) {
  // monthOfInterest marks the last month in returned data set
  // count all records we have to calculate new average
  try {
    console.log("history.model.getMonthAggregates()");
    const monthAgg = await prisma.transactionAggregate.findFirst({
      where: {
        userId: userId,
        month: dateOfInterest.getMonth() + 1,
        year: dateOfInterest.getFullYear(),
      },
    });
    // if (!)
    return [];
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

export default {
  getAggregateForMonth,
};
