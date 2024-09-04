import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { error } from "console";
import { Request, Response } from "express";

export async function createCategoris(req: Request, res: Response) {
  const { name, slug } = req.body;
  try {
    const existcategories = await db.category.findUnique({
      where: {
        slug,
      },
    });
    if (existcategories) {
      return ErrorMessage(res, 409, `Category ${name} already exist`);
    }
    const categories = await db.category.create({
      data: {
        name,
        slug,
      },
    });

    res.status(201).json({ data: categories, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function getCategoriess(req: Request, res: Response) {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    const total = categories.length;
    res.status(200).json({ data: { categories, total } });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function getCategoriesById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const categories = await db.category.findUnique({
      where: {
        id,
      },
    });

    if (!categories) {
      return ErrorMessage(res, 404, "Category not Found");
    }

    res.status(200).json({ data: categories, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function updateCategories(req: Request, res: Response) {
  const { slug, name } = req.body;
  const { id } = req.params;
  try {
    const categories = await db.category.findUnique({
      where: {
        id,
      },
    });
    if (!categories) {
      return ErrorMessage(res, 404, "Category not found");
    }
    if (slug && slug !== categories.slug) {
      const slugExist = await db.category.findUnique({
        where: {
          slug,
        },
      });
      if (slugExist) {
        return ErrorMessage(res, 409, `Category ${slug} Already Exists`);
      }
    }

    const newUnit = await db.category.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
      },
    });
    res.status(200).json({ data: newUnit, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function deletecategories(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const categories = await db.category.findUnique({
      where: {
        id,
      },
    });

    if (!categories) {
      return ErrorMessage(res, 404, "Category Not Found");
    }
    await db.category.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ data: "Category deleted  successfully!!" });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}
