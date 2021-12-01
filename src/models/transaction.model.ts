import prisma from "./db";
import { v4 as uuid } from "uuid";

import UserModel from "../models/user.model";
import Transaction from "../types/transaction";

// TODO: limit number of transactions
async function getTransactions(
  userId: string,
  transactionsPerUser: number = 100
) {
  try {
    console.log("transaction.model.getTransactions()");
    const userIds = await UserModel.getUserIds(userId);
    const results = await prisma.transaction.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
    });
    console.log(`Found ${results.length} records`);
    return results;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

async function createTransaction(
  transactionData: any
): Promise<Transaction | null> {
  console.log("transaction.model.createTransaction()");
  try {
    const transaction = { ...transactionData, transactionId: uuid() };
    const result = await prisma.transaction.create({
      data: transaction,
      select: {
        transactionId: true,
      },
    });
    // Send back whole transaction incl. transactionId so that client knows the transaction's id
    return transaction;
  } catch (err) {
    console.error("ERROR: ", err);
    return null;
  }
}

export default {
  getTransactions,
  createTransaction,
};
