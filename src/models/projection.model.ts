import prisma from "./db";
import UserModel from "../models/user.model";

type DateRange = {
  startDate: string;
  endDate: string;
};

async function getAverageByType(
  userId: string,
  transactionType: string,
  dateRange: DateRange
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!user) throw new Error(`No user profile found for userId: ${userId}`);
    const allUsers = await UserModel.getUsers(userId);
    const allUserIds = allUsers?.map((user) => user.userId);

    // RETRIEVE AVERAGE _______ THROUGH PRISMA AGGREGATE
    const aggregations = await prisma.transaction.aggregate({
      _avg: {
        amount: true,
      },
      where: {
        userId: {
          in: allUserIds,
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
