import prisma from "./db";
import { v4 as uuid } from "uuid";

import { TransactionId } from "../types/id";

// TODO: limit number of transactions

async function getTransactionsBetween(userId: string, from: Date, to: Date) {
  try {
    console.log("TransactionModel.getTransactionsBetween()");
    console.log(`from: ${from.toISOString()} to: ${to.toISOString()}`);
    const results = await prisma.transaction.findMany({
      where: {
        userId: userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { date: "asc" },
    });
    if (!results) {
      return [];
    }
    return results;
  } catch (err) {
    console.error("ERROR: ", err);
    return [];
  }
}

async function getAllTransactions(userId: string) {
  try {
    console.log("TransactionModel.getAllTransactions()");
    const results = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { date: "asc" },
    });
    return results;
  } catch (err) {
    console.error("ERROR: ", err);
    return [];
  }
}

async function createTransaction(
  transactionData: any
): Promise<TransactionId | null> {
  console.log("TransactionModel.createTransaction()");
  try {
    const transaction = { ...transactionData, transactionId: uuid() };
    const result = await prisma.transaction.create({
      data: transaction,
      select: {
        transactionId: true,
      },
    });
    return result.transactionId;
  } catch (err) {
    console.error("ERROR: ", err);
    return null;
  }
}

const TransactionModel = {
  getTransactionsBetween,
  getAllTransactions,
  createTransaction,
};

export default TransactionModel;
