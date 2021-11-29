import { Router } from "express";
import transactionController from "./controllers/transaction.controller";
import userController from "./controllers/user.controller";

const router = Router();

// USER

// Get user profile
router.get("/me", userController.getUserProfile);

// Get couple profile (user profile and partner's profile)
router.get("/couple", userController.getCoupleProfile);

// TRANSACTIONS

// Get all transactions of the user
router.get("/transactions/me", transactionController.getAllUser);

// Get all transactions of the couple (user and the partner)
router.get("/transactions/couple", transactionController.getAllCouple);

// Add a transaction
router.post("/transactions", transactionController.addTransaction);

// Remove a transaction
router.delete("/transactions/:id", transactionController.deleteTransaction);

export default router;
