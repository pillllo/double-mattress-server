import { Request, Response } from "express";

import TransactionModel from "../models/transaction.model";

async function getTransactions(req: Request, res: Response) {
  try {
    const { userId, transactionsPerUser } = req.body;
    const transactions = await TransactionModel.getAllTransactions(userId);
    res.status(200).send(transactions);
  } catch (error) {
    console.error(error);
    res.status(400).send("Could not get transactions");
  }
}

async function createTransaction(req: Request, res: Response) {
  try {
    console.log("transaction.controller.createTransaction()");
    const transactionData = req.body;
    // Result = transaction including transactionId created in the model
    const result = await TransactionModel.createTransaction(transactionData);
    console.log(result);
    if (!result) throw new Error();
    // Send back whole transaction incl. transactionId so that client knows the transaction's id
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Could not create transaction");
  }
}

const transactionController = {
  getTransactions,
  createTransaction,
};

export default transactionController;
