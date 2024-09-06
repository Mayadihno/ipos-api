import {
  createExpenseCategories,
  deleteExpenseCategory,
  getExpenseCategories,
  getSingleExpenseCategory,
  updateExpenseCategory,
} from "@/controller/expenseCategories";
import express from "express";

const expenseCategoriesRouter = express.Router();

expenseCategoriesRouter.post(
  "/create-expense-categories",
  createExpenseCategories
);

expenseCategoriesRouter.get("/expense-categories", getExpenseCategories);
expenseCategoriesRouter.get("/expense-category/:id", getSingleExpenseCategory);
expenseCategoriesRouter.patch(
  "/update-expense-category/:id",
  updateExpenseCategory
);
expenseCategoriesRouter.delete("/expense-category/:id", deleteExpenseCategory);

export default expenseCategoriesRouter;
