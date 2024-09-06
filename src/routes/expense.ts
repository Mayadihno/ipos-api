import {
  createExpense,
  deleteExpense,
  getExpenses,
  getSingleExpense,
  updateExpense,
} from "@/controller/expense";
import express from "express";

const expenseRouter = express.Router();

expenseRouter.post("/create-expense", createExpense);
expenseRouter.get("/expenses", getExpenses);
expenseRouter.get("/expense/:id", getSingleExpense);
expenseRouter.put("/update-expense/:id", updateExpense);
expenseRouter.delete("/expense/:id", deleteExpense);

export default expenseRouter;
