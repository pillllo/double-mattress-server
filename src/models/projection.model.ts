import prisma from "./db";
import { UserId } from "../types/id";

type DateRange = {
  startDate: string;
  endDate: string;
};

async function getAverageByType(
  userIds: UserId[] | undefined,
  transactionType: string,
  dateRange: DateRange
) {
  try {
    // RETRIEVE AVERAGE _______ THROUGH PRISMA AGGREGATE
    const aggregations = await prisma.transaction.aggregate({
      _avg: {
        amount: true,
      },
      _count: {
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

async function getAverageByCategory(
  userIds: UserId[] | undefined,
  category: string,
  dateRange: DateRange
) {
  try {
    // RETRIEVE AVERAGE _______ THROUGH PRISMA AGGREGATE
    const aggregations = await prisma.transaction.aggregate({
      _avg: {
        amount: true,
      },
      _count: {
        amount: true,
      },
      where: {
        userId: {
          in: userIds,
        },
        category: {
          equals: category,
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
// Get average of all relevant transactions (by date & type)

// savings

// types
//   income
//   expenses
// categories
//   rent
//   ...
//   others

export default { getAverageByType, getAverageByCategory };
