import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { error } from "console";
import { Request, Response } from "express";

export async function createExpenseCategories(req: Request, res: Response) {
  const { name, slug } = req.body;
  try {
    const categoriesExist = await db.expenseCategories.findUnique({
      where: {
        slug,
      },
    });

    if (categoriesExist) {
      return ErrorMessage(res, 409, `Expense Category ${slug} Already Exists`);
    }

    const newCategory = await db.expenseCategories.create({
      data: {
        name,
        slug,
      },
    });

    res.status(201).json({ data: newCategory, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getExpenseCategories(req: Request, res: Response) {
  try {
    const categories = await db.expenseCategories.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    const total = categories.length;
    res.status(200).json({ data: { categories, total }, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getSingleExpenseCategory(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const category = await db.expenseCategories.findUnique({
      where: {
        id,
      },
    });
    if (!category) {
      return ErrorMessage(res, 404, "Expense Category not found");
    }
    res.status(200).json({ data: category, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function updateExpenseCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { name, slug } = req.body;

  try {
    const category = await db.expenseCategories.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return ErrorMessage(res, 404, "Expense Category not found");
    }

    if (slug && slug !== category.slug) {
      const slugExist = await db.expenseCategories.findUnique({
        where: {
          slug,
        },
      });
      if (slugExist) {
        return ErrorMessage(
          res,
          409,
          `Expense Category ${slug} Already Exists`
        );
      }
    }

    const updatedCategory = await db.expenseCategories.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
      },
    });

    res.status(200).json({ data: updatedCategory, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function deleteExpenseCategory(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const category = await db.expenseCategories.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return ErrorMessage(res, 404, "Expense Category not found");
    }

    await db.expenseCategories.delete({
      where: {
        id,
      },
    });

    res
      .status(200)
      .json({ data: "Expense Category deleted successfully", error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}
