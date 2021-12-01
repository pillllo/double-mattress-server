import prisma from "./db";

// import UserModel from "../models/user.model";
// import Transaction from "../types/transaction";

// TODO: limit number of transactions
async function getDashboardData(
  userId: string,
  transactionsPerUser: number = 100
) {
  try {
    console.log("transaction.model.getTransactions()");
    // const allUsers = await UserModel.getUsers(userId);
    // const allUserIds = allUsers?.map((user) => user.userId);
    // const results = await prisma.transaction.findMany({
    //   where: {
    //     userId: {
    //       in: allUserIds,
    //     },
    //   },
    // });
    // console.log(`Found ${results.length} records`);
    // return results;
  } catch (err) {
    console.error("ERROR: ", err);
  }
}

export default {
  getDashboardData,
};
