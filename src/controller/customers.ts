import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { Request, Response } from "express";

export async function createCustomer(req: Request, res: Response) {
  const {
    email,
    customerType,
    firstName,
    lastName,
    gender,
    maxCreditLimit,
    maxCreditDays,
    taxPin,
    dob,
    nin,
    country,
    location,
    phone,
  } = req.body;
  try {
    const phoneExist = await db.customer.findUnique({
      where: {
        phone,
      },
    });

    if (phoneExist) {
      return ErrorMessage(res, 409, `Phone Number ${phone} already exist`);
    }

    if (email) {
      const emailExist = await db.customer.findUnique({
        where: {
          email,
        },
      });

      if (emailExist) {
        return ErrorMessage(res, 409, `Email ${email} already exist`);
      }
    }

    if (nin) {
      const ninExist = await db.customer.findUnique({
        where: {
          nin,
        },
      });

      if (ninExist) {
        return ErrorMessage(res, 409, `NIN ${nin} already exist`);
      }
    }

    const newCustomer = await db.customer.create({
      data: {
        email,
        customerType,
        firstName,
        lastName,
        gender,
        maxCreditLimit,
        maxCreditDays,
        taxPin,
        dob,
        nin,
        country,
        location,
        phone,
      },
    });

    return res.status(201).json(newCustomer);
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getCustomers(req: Request, res: Response) {
  try {
    const customers = await db.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await db.customer.count();

    return res.status(200).json({ customers, total });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getCustomerById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const customer = await db.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return ErrorMessage(res, 404, "Customer not found");
    }
    return res.status(200).json(customer);
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}
