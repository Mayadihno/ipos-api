import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { generateOrderNumber } from "@/utils/generateOrderNumbers";
import { NotificationStatus } from "@prisma/client";
import { Request, Response } from "express";

interface Adjustment {
  adjustmentId: string;
  productId: string;
  quantity: number;
  type: string;
  currentStock: string;
  productName: string;
}

interface AdjustmentProps {
  reason: string;
  items: Adjustment[];
}

export async function createAdjustment(req: Request, res: Response) {
  const { reason, items }: AdjustmentProps = req.body;
  try {
    const adjustmentId = await db.$transaction(async (transaction) => {
      const adjustment = await transaction.adjustment.create({
        data: {
          reason,
          refNo: generateOrderNumber(),
        },
      });
      for (const item of items) {
        let query;
        if (item.type === "Addition") {
          query = {
            increment: item.quantity,
          };
        } else if (item.type === "Subtraction") {
          query = {
            decrement: item.quantity,
          };
        }

        const updateProduct = await db.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stockQty: query,
          },
        });

        if (!updateProduct) {
          ErrorMessage(res, 404, "Failed to update stock for the product");
          return null;
        }

        if (updateProduct.stockQty < updateProduct.alertQty) {
          const message =
            updateProduct.stockQty === 0
              ? `The product ${updateProduct.name} is out of stock. The current stock is ${updateProduct.stockQty}`
              : `The product ${updateProduct.name} is low in stock. The current stock is ${updateProduct.stockQty}`;
          const statusText =
            updateProduct.stockQty === 0 ? "Stock Out" : "Warning";
          const status: NotificationStatus =
            updateProduct.stockQty === 0 ? "DANGER" : "WARNING";

          await db.notification.create({
            data: {
              message,
              statusText,
              status,
            },
          });
        }

        const adjustmentItems = await db.adjustmentItems.create({
          data: {
            adjustmentId: adjustment.id,
            productId: item.productId,
            quantity: item.quantity,
            type: item.type,
            currentStock: item.currentStock,
            productName: item.productName,
          },
        });
        if (!adjustmentItems) {
          ErrorMessage(res, 404, "Failed to create adjustment items");
          return null;
        }
      }
      return adjustment.id;
    });

    if (!adjustmentId) {
      return ErrorMessage(res, 404, "Failed to create adjustment");
    }

    const savedAdjustment = await db.adjustment.findUnique({
      where: {
        id: adjustmentId,
      },
      include: {
        items: true,
      },
    });

    return res.status(200).json({ data: savedAdjustment, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getAdjustments(req: Request, res: Response) {
  try {
    const adjustments = await db.adjustment.findMany({
      include: {
        items: true,
      },
    });

    const total = adjustments.length;

    return res.status(200).json({ data: { adjustments, total }, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getAdjustment(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const adjustment = await db.adjustment.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });
    if (!adjustment) {
      return ErrorMessage(res, 404, "Adjustment not found");
    }
    return res.status(200).json({ data: adjustment, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function updateAdjustment(req: Request, res: Response) {
  const { id } = req.params;
  const { reason, items }: AdjustmentProps = req.body;
  try {
    const adjustment = await db.adjustment.update({
      where: {
        id,
      },
      data: {
        reason,
      },
    });
    if (!adjustment) {
      return ErrorMessage(res, 404, "Adjustment not found");
    }
    for (const item of items) {
      const updateProduct = await db.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stockQty: item.type === "Addition" ? item.quantity : -item.quantity,
        },
      });

      if (!updateProduct) {
        ErrorMessage(res, 404, "Failed to update stock for the product");
        return null;
      }
    }

    return res.status(200).json({ data: adjustment, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function deleteAdjustment(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const adjustment = await db.adjustment.delete({
      where: {
        id,
      },
    });
    if (!adjustment) {
      return ErrorMessage(res, 404, "Adjustment not found");
    }
    return res.status(200).json({ data: adjustment, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}
