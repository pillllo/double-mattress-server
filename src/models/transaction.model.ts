import prisma from "./db";
import { v4 as uuid } from "uuid";

import UserModel from "../models/user.model";
import Transaction from "../types/transaction";

async function getTransactions(userId: string, transactionsPerUser: number) {
  try {
    console.log("transaction.model.getTransactions()");
    const allUsers = await UserModel.getUsers(userId);
    const allUserIds = allUsers?.map((user) => user.userId);
    const results = await prisma.transaction.findMany({
      where: {
        userId: {
          in: allUserIds,
        },
      },
    });
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
