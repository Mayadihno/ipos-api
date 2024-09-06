import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { Request, Response } from "express";

export async function createPayee(req: Request, res: Response) {
  const { name, phone } = req.body;
  try {
    const phoneExist = await db.payee.findUnique({
      where: {
        phone,
      },
    });

    if (phoneExist) {
      return ErrorMessage(res, 409, `Phone ${phone} number already exist`);
    }

    const payee = await db.payee.create({
      data: {
        name,
        phone,
      },
    });

    res.status(201).json({ data: payee, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getPayees(req: Request, res: Response) {
  try {
    const payees = await db.payee.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = payees.length;

    res.status(200).json({ data: { payees, total }, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getSinglePayee(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const payee = await db.payee.findUnique({
      where: {
        id,
      },
    });

    if (!payee) {
      return ErrorMessage(res, 404, "Payee not found");
    }

    res.status(200).json({ data: payee, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function updatePayee(req: Request, res: Response) {
  const { id } = req.params;
  const { name, phone } = req.body;

  try {
    const payee = await db.payee.findUnique({
      where: {
        id,
      },
    });

    if (!payee) {
      return ErrorMessage(res, 404, "Payee not found");
    }

    if (phone && phone !== payee.phone) {
      const phoneExist = await db.payee.findUnique({
        where: {
          phone,
        },
      });

      if (phoneExist) {
        return ErrorMessage(res, 409, `Phone ${phone} number already exist`);
      }
    }

    const updatedPayee = await db.payee.update({
      where: {
        id,
      },
      data: {
        name,
        phone,
      },
    });

    res.status(200).json({ data: updatedPayee, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function deletePayee(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const payee = await db.payee.findUnique({
      where: {
        id,
      },
    });

    if (!payee) {
      return ErrorMessage(res, 404, "Payee not found");
    }

    await db.payee.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ data: "Payee deleted successfully", error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}
