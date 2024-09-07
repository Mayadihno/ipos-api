import {
  createExpense,
  deleteExpense,
  getExpenses,
  getSingleExpense,
  updateExpense,
} from "@/controller/expense";
import { verifyUser } from "@/utils/verify-user";
import express from "express";

const expenseRouter = express.Router();

expenseRouter.post("/create-expense", verifyUser, createExpense);
expenseRouter.get("/expenses", verifyUser, getExpenses);
expenseRouter.get("/expense/:id", verifyUser, getSingleExpense);
expenseRouter.put("/update-expense/:id", verifyUser, updateExpense);
expenseRouter.delete("/expense/:id", verifyUser, deleteExpense);

export default expenseRouter;
