import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { error } from "console";
import { Request, Response } from "express";

export async function createBrands(req: Request, res: Response) {
  const { name, slug } = req.body;
  try {
    const existBrand = await db.brand.findUnique({
      where: {
        slug,
      },
    });
    if (existBrand) {
      return ErrorMessage(res, 409, `Brand ${name} already exist`);
    }
    const brand = await db.brand.create({
      data: {
        name,
        slug,
      },
    });

    res.status(201).json({ data: brand, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function getBrands(req: Request, res: Response) {
  try {
    const brand = await db.brand.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    const total = brand.length;
    res.status(200).json({ data: { brand, total } });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function getBrandById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const brand = await db.brand.findUnique({
      where: {
        id,
      },
    });

    if (!brand) {
      return ErrorMessage(res, 404, "Brand not Found");
    }

    res.status(200).json({ data: brand, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function updateBrand(req: Request, res: Response) {
  const { slug, name } = req.body;
  const { id } = req.params;
  try {
    const brand = await db.brand.findUnique({
      where: {
        id,
      },
    });
    if (!brand) {
      return ErrorMessage(res, 404, "Brand not found");
    }
    if (slug && slug !== brand.slug) {
      const slugExist = await db.brand.findUnique({
        where: {
          slug,
        },
      });
      if (slugExist) {
        return ErrorMessage(res, 409, `Brand ${slug} Already Exists`);
      }
    }

    const newUnit = await db.brand.update({
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

export async function deleteBrand(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const brand = await db.brand.findUnique({
      where: {
        id,
      },
    });

    if (!brand) {
      return ErrorMessage(res, 404, "Brand Not Found");
    }
    await db.brand.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ data: "Brand deleted  successfully!!" });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}
