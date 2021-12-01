import { Router } from "express";
import userController from "./controllers/user.controller";
import transactionController from "./controllers/transaction.controller";
import projectionController from "./controllers/projection.controller";
import dashboardController from "./controllers/dashboard.controller";

const router = Router();

//----------------------------------------------------------------
// USER
//----------------------------------------------------------------

// getUserIds() is convenience for the front end devs to query
// for userIds in case they can't remember / retrieve their test userId
// returns all userIds in the database
// TODO: remove route once login implemented
router.get("/userIds", userController.getAllUserIds);

router.post("/users", userController.getUsers);
router.post("/users/create", userController.createUser);
router.post("/users/delete", userController.deleteUser);

//----------------------------------------------------------------
// TRANSACTIONS
//----------------------------------------------------------------

router.post("/transactions", transactionController.getTransactions);
router.post("/transactions/create", transactionController.createTransaction);

//----------------------------------------------------------------
// DASHBOARD
//----------------------------------------------------------------

router.post("/dashboard", dashboardController.getDashboard);

//----------------------------------------------------------------
// PROJECTIONS
//----------------------------------------------------------------

router.get("/projections", projectionController.getProjections);

export default router;
