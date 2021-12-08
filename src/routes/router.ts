// import { Router } from "express";
import express from "express";
import userController from "../controllers/user.controller";
import transactionController from "../controllers/transaction.controller";
import dashboardController from "../controllers/dashboard.controller";
import projectionController from "../controllers/projection.controller";
import connectionController from "../controllers/connection.controller";
import subscriptionController from "../controllers/subscription.controller";
import notificationController from "../controllers/notification.controller";

const router = express.Router();

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

router.post("/projections/:sessionId", projectionController.getProjections);
router.post("/projections/create", projectionController.createProjectedChange);
router.delete("/projections", projectionController.deleteProjectedChange);

//----------------------------------------------------------------
// CONNECT
//----------------------------------------------------------------

router.post("/connect/initiate", connectionController.initiateConnect);
router.post("/connect/confirm", connectionController.requestConnect);
router.post("/connect/complete", connectionController.completeConnect);

//----------------------------------------------------------------
// SUBSCRIPTIONS
//----------------------------------------------------------------
router.post(
  "/create-checkout-session",
  subscriptionController.createCheckoutSession
);
router.post(
  "/webhook",
  express.json({ type: "application/json" }),
  subscriptionController.webhook
);
router.get("/success?", subscriptionController.getSuccessPage);
export default router;
