import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { Request, Response } from "express";

export async function createShop(req: Request, res: Response) {
  const { name, slug, location, adminId, attendantsIds } = req.body;

  try {
    const shop = await db.shop.findUnique({
      where: {
        slug,
      },
    });
    if (shop) {
      return ErrorMessage(res, 409, `Shop ${name} already existing`);
    }

    const newShop = await db.shop.create({
      data: {
        name,
        slug,
        location,
        adminId,
        attendantsIds,
      },
    });

    return res.status(201).json({ data: newShop, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getShops(req: Request, res: Response) {
  try {
    const shops = await db.shop.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = shops.length;

    return res.status(200).json({ data: { shops, total }, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getShopByid(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const shop = await db.shop.findUnique({
      where: {
        id,
      },
    });

    if (!shop) {
      return ErrorMessage(res, 404, "Shop not found");
    }

    return res.status(200).json({ data: shop, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getShopAttendants(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const shop = await db.shop.findUnique({
      where: {
        id,
      },
    });
    if (!shop) {
      return ErrorMessage(res, 404, "Shop not found");
    }

    const attendants = await db.user.findMany({
      where: {
        id: {
          in: shop.attendantsIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        image: true,
      },
    });

    return res.status(200).json({ data: attendants, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}
