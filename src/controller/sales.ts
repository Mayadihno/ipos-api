import { db } from "@/db/db";
import { SalesItem, SalesRequestBody } from "@/types/types";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { generateOrderNumber } from "@/utils/generateOrderNumbers";
import { error } from "console";
import { Request, Response } from "express";

export async function createSale(req: Request, res: Response) {
  const {
    customerId,
    customerName,
    customerEmail,
    saleAmount,
    balanceAmount,
    paidAmount,
    status,
    saleType,
    paymentMethod,
    transactionCode,
    salesItem,
  }: SalesRequestBody = req.body;
  try {
    const saleId = await db.$transaction(async (transaction) => {
      //create the sale
      const sale = await transaction.sale.create({
        data: {
          customerId,
          customerName,
          saleNumber: generateOrderNumber(),
          customerEmail,
          saleAmount,
          balanceAmount,
          paidAmount,
          status,
          saleType,
          paymentMethod,
          transactionCode,
        },
      });

      //create the sales item
      if (salesItem && salesItem.length > 0) {
        for (const item of salesItem) {
          const updateProduct = await transaction.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stockQty: {
                decrement: item.qty,
              },
            },
          });
          if (!updateProduct) {
            return ErrorMessage(res, 400, "Failed to update stock product");
          }
          //create sale items
          const saleItem = await transaction.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              qty: item.qty,
              productPrice: item.productPrice,
              productName: item.productName,
              productImage: item.productImage,
              updatedAt: new Date(),
            },
          });

          if (!saleItem) {
            return ErrorMessage(res, 400, "Failed to create sale item ");
          }
        }
      }
      return sale.id;
    });

    const sale = await db.sale.findUnique({
      where: {
        id: saleId as string,
      },
      include: {
        salesItem: true,
      },
    });

    return res.status(201).json({ data: sale, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getSales(req: Request, res: Response) {
  try {
    const sales = await db.sale.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        salesItem: true,
      },
    });
    const total = sales.length;
    res.status(200).json({ data: { sales, total }, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function createSaleItem(req: Request, res: Response) {
  const { productId, saleId, qty, productPrice, productName, productImage } =
    req.body;

  try {
    const updateProduct = await db.product.update({
      where: {
        id: productId,
      },
      data: {
        stockQty: {
          decrement: qty,
        },
      },
    });
    if (!updateProduct) {
      return ErrorMessage(res, 400, "Failed to update stock product");
    }
    const saleItem = await db.saleItem.create({
      data: {
        productId,
        saleId,
        qty,
        productPrice,
        productName,
        productImage,
        updatedAt: new Date(),
      },
    });

    if (!saleItem) {
      return ErrorMessage(res, 400, "Failed to create sale item ");
    }

    return res.status(201).json({ data: saleItem, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function deleteSale(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const item = await db.sale.findUnique({
      where: {
        id,
      },
    });

    if (!item) {
      return ErrorMessage(res, 404, "Sale not found");
    }
    await db.sale.delete({
      where: {
        id,
      },
    });

    return res
      .status(200)
      .json({ data: "Sale deleted successfully", error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}
