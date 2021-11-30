import { Router } from "express";
import transactionController from "./controllers/transaction.controller";
import userController from "./controllers/user.controller";

const router = Router();

//----------------------------------------------------------------
// USER
//----------------------------------------------------------------

// getUserIds() is convenience for the front end devs to query
// for userIds in case they can't remember / retrieve their test userId
// returns all userIds in the database
// TODO: remove route once login implemented
router.get("/userIds", userController.getUserIds);

router.get("/user", userController.getUsers);
router.post("/user", userController.createUser);
router.delete("/user", userController.deleteUser);

//----------------------------------------------------------------
// TRANSACTIONS
//----------------------------------------------------------------

router.get("/transactions", transactionController.getTransactions);
router.post("/transactions", transactionController.createTransaction);

export default router;
