import prisma from "./db";
import { v4 as uuid } from "uuid";

import UserModel from "../models/user.model";
import Transaction from "../types/transaction";
import User from "../types/user";


async function getTransactions (userId: string, transactionsPerUser: number) {
  try {
    console.log("transaction.model.getTransactions()");
    const allUsers = await UserModel.getUsers(userId);
    const allUserIds = allUsers?.map(user => user.userId);
    const results = await prisma.transaction.findMany({
      where: {
        userId: {
          in: allUserIds
        }
      }
    })
    return results;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

async function createTransaction () {

}


export default {
  getTransactions,
  createTransaction,
}