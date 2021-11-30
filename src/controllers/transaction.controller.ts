import { Request, Response } from "express";

import TransactionModel from "../models/transaction.model";

async function getTransactions(req: Request, res: Response) {
  try {
    const { userId, transactionsPerUser } = req.body;
    const transactions = await TransactionModel.getTransactions(userId, transactionsPerUser);
    console.log('transaction controller transaction:', transactions)
    res.status(200).send(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not get transactions.");
  }
}

async function createTransaction (req: Request, res: Response) {
  const tData = req.body;
  const result = TransactionModel.createTransaction(tData);

}

const transactionController = {
  getTransactions,
  createTransaction,
};

export default transactionController;
