import prisma from "./db";
import { v4 as uuid } from "uuid";

import UserModel from "../models/user.model";
import Transaction from "../types/transaction";
import User from "../types/user";
import Category from "../types/category";
import { TransactionSuccess } from "../types/successes";

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
): Promise<TransactionSuccess | null> {
  // here for reference
  type TRANSACTION_TYPE = {
    transactionId: string;
    transactionType: "income" | "expense";
    userId: string;
    firstName: string;
    amount: number;
    currency: string;
    category: Category;
    date: string; // using ISO strings vs integer as they are human readable
    description: string;
    includeAvg?: boolean;
  };

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
