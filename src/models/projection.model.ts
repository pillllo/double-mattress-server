import prisma from "./db";
import { UserId } from "../types/id";
import UserModel from "./user.model";

type DateRange = {
  startDate: string;
  endDate: string;
};

async function getAverageByType(
  userId: UserId,
  transactionType: string,
  dateRange: DateRange
) {
  try {
    const userIds = await UserModel.getUserIds(userId);
    // RETRIEVE AVERAGE _______ THROUGH PRISMA AGGREGATE
    const aggregations = await prisma.transaction.aggregate({
      _avg: {
        amount: true,
      },
      where: {
        userId: {
          in: userIds,
        },
        transactionType: {
          equals: transactionType,
        },
        date: {
          gte: dateRange.startDate,
          lt: dateRange.endDate,
        },
      },
    });
    return aggregations._avg.amount;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

// savingsCumulative

// TRANSACTIONS ONLY - NO PROJECTIONS

// AVERAGES
// Get sum of all relevant transactions (by date & type)
// Divide sum by X months

// savings
// income
// expenses
// categories
//    rent
//    ...
//    others

export default { getAverageByType };
