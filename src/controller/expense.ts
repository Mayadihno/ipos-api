import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { Request, Response } from "express";

export async function createExpense(req: Request, res: Response) {
  const {
    title,
    expenseDate,
    amount,
    description,
    attachments,
    payeeId,
    shopId,
    categoryId,
  } = req.body;

  try {
    const expense = await db.expenses.create({
      data: {
        title,
        expenseDate,
        amount,
        description,
        attachments,
        payeeId,
        shopId,
        categoryId,
      },
    });

    res.status(201).json({ data: expense, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getExpenses(req: Request, res: Response) {
  try {
    const expenses = await db.expenses.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = expenses.length;

    res.status(200).json({ data: { expenses, total }, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getSingleExpense(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const expense = await db.expenses.findUnique({
      where: {
        id,
      },
    });

    if (!expense) {
      return ErrorMessage(res, 404, "Expense not found");
    }

    res.status(200).json({ data: expense, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function updateExpense(req: Request, res: Response) {
  const { id } = req.params;
  const {
    title,
    expenseDate,
    amount,
    description,
    attachments,
    payeeId,
    shopId,
    categoryId,
  } = req.body;

  try {
    const expense = await db.expenses.findUnique({
      where: {
        id,
      },
    });

    if (!expense) {
      return ErrorMessage(res, 404, "Expense not found");
    }

    const updatedExpense = await db.expenses.update({
      where: {
        id,
      },
      data: {
        title,
        expenseDate,
        amount,
        description,
        attachments,
        payeeId,
        shopId,
        categoryId,
      },
    });

    res.status(200).json({ data: updatedExpense, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function deleteExpense(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const expense = await db.expenses.findUnique({
      where: {
        id,
      },
    });

    if (!expense) {
      return ErrorMessage(res, 404, "Expense not found");
    }

    await db.expenses.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ data: "Expense deleted successfully", error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}
