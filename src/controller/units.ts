import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { error } from "console";
import { Request, Response } from "express";

export async function createUnits(req: Request, res: Response) {
  const { name, abbreviation, slug } = req.body;
  try {
    const existSlug = await db.unit.findUnique({
      where: {
        slug,
      },
    });
    if (existSlug) {
      return ErrorMessage(res, 409, `Unit ${name} already exist`);
    }
    const units = await db.unit.create({
      data: {
        name,
        slug,
        abbreviation,
      },
    });

    res.status(201).json(units);
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function getUnits(req: Request, res: Response) {
  try {
    const units = await db.unit.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    const total = units.length;
    res.status(200).json({ data: { units, total } });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function getUnitById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const unit = await db.unit.findUnique({
      where: {
        id,
      },
    });

    if (!unit) {
      return ErrorMessage(res, 404, "Unit not Found");
    }

    res.status(200).json(unit);
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function updateUnit(req: Request, res: Response) {
  const { slug, name, abbreviation } = req.body;
  const { id } = req.params;
  try {
    const unit = await db.unit.findUnique({
      where: {
        id,
      },
    });
    if (!unit) {
      return ErrorMessage(res, 404, "Unit not found");
    }
    if (slug && slug !== unit.slug) {
      const slugExist = await db.unit.findUnique({
        where: {
          slug,
        },
      });
      if (slugExist) {
        return ErrorMessage(res, 409, `Unit ${slug} Already Exists`);
      }
    }

    const newUnit = await db.unit.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        abbreviation,
      },
    });
    res.status(200).json({ data: newUnit });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function deleteUnit(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const unit = await db.unit.findUnique({
      where: {
        id,
      },
    });

    if (!unit) {
      return ErrorMessage(res, 404, "Unit Not Found");
    }
    await db.unit.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ data: "Unit deleted  successfully!!" });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}
