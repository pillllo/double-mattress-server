import { Request, Response } from "express";

import TransactionModel from "../models/transaction.model";

async function getTransactions(req: Request, res: Response) {
  try {
    const { userId, transactionsPerUser } = req.body;
    const transactions = await TransactionModel.getTransactions(userId, transactionsPerUser);
    console.log("transaction controller transaction:", transactions)
    res.status(200).send(transactions);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get transactions");
  }
}

async function createTransaction (req: Request, res: Response) {
  try {
    console.log('transaction.controller.createTransaction()');
    const tData = req.body;
    console.log(tData);
    const result = await TransactionModel.createTransaction(tData);
    if (!result) throw new Error();
    res.status(200).send(`Transaction created with transactionId: ${result.transactionId}`);
  } catch (err) {
    res.status(500).send("Could not create transaction");
  }
}

const transactionController = {
  getTransactions,
  createTransaction,
};

export default transactionController;
