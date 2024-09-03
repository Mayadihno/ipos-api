import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { Request, Response } from "express";

export async function createSupplier(req: Request, res: Response) {
  const {
    email,
    name,
    supplierType,
    contactPerson,
    website,
    taxPin,
    country,
    location,
    notes,
    rating,
    paymentTerms,
    bankName,
    regNumber,
    phone,
    logo,
    bankAccountNumber,
  } = req.body;
  try {
    if (regNumber) {
      const regNumberExist = await db.supplier.findUnique({
        where: {
          regNumber,
        },
      });

      if (regNumberExist) {
        return ErrorMessage(
          res,
          409,
          `Registration Number ${regNumber} already exist`
        );
      }
    }

    const phoneExist = await db.supplier.findUnique({
      where: {
        phone,
      },
    });

    if (phoneExist) {
      return ErrorMessage(res, 409, `Phone Number ${phone} already exist`);
    }

    if (email) {
      const emailExist = await db.supplier.findUnique({
        where: {
          email,
        },
      });

      if (emailExist) {
        return ErrorMessage(res, 409, `Email ${email} already exist`);
      }
    }

    const newSupplier = await db.supplier.create({
      data: {
        email,
        name,
        supplierType,
        contactPerson,
        website,
        taxPin,
        country,
        location,
        notes,
        rating,
        paymentTerms,
        bankName,
        regNumber,
        phone,
        logo,
        bankAccountNumber,
      },
    });

    return res.status(201).json(newSupplier);
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function getSupplier(Req: Request, res: Response) {
  try {
    const supplier = await db.supplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    const total = supplier.length;
    return res.status(200).json({ data: { supplier, total } });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function getSupplierById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const supplier = await db.supplier.findUnique({
      where: {
        id,
      },
    });

    if (!supplier) {
      return ErrorMessage(res, 404, "Supplier not found");
    }

    return res.status(200).json({ supplier });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}
