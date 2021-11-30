import prisma from "./db";
import { v4 as uuid } from "uuid";

import Transaction from "../types/transaction";

// TODO: needs checking and properly implementing
// copied direct Natalie's code from 29/11, here for safe keeping
async function createTransaction (
  transaction: Transaction
) {
  try {
    const result = await prisma.transaction.create({
      data: {
        transactionId: uuid(),
        transactionType: "expenses",
        userId: "1",
        amount: 10000,
        currency: "EUR",
        category: "rent",
        date: "2021-11-29T17:54:33.422Z",
        description: "Apartment",
        includeAvg: true,
      },
    });
    return result;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

export default {
  createTransaction,
}