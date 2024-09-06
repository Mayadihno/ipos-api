import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { generateOrderNumber } from "@/utils/generateOrderNumbers";
import { NotificationStatus, PurchaseOrderStatus } from "@prisma/client";
import { Request, Response } from "express";

interface PurchaseOrderItems {
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  productName: string;
  unitCost: number;
  subTotal: number;
  currentStock: number;
}

interface PurchaseOrderItemsProps {
  supplierId: string;
  discount: number;
  notes: string;
  tax: number;
  totalAmount: number;
  balanceAmount: number;
  shippingCost: number;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItems[];
}

export async function createPurchaseOrder(req: Request, res: Response) {
  const {
    supplierId,
    discount,
    notes,
    tax,
    totalAmount,
    balanceAmount,
    shippingCost,
    items,
    status,
  }: PurchaseOrderItemsProps = req.body;
  try {
    const purchaseOrderId = await db.$transaction(async (transaction) => {
      const purchaseOrder = await transaction.purchaseOrder.create({
        data: {
          supplierId,
          discount,
          notes,
          tax,
          refNo: generateOrderNumber(),
          totalAmount,
          balanceAmount,
          shippingCost,
          status,
        },
      });
      for (const item of items) {
        const updateProduct = await db.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stockQty: {
              increment: item.quantity,
            },
          },
        });
        if (!updateProduct) {
          ErrorMessage(res, 404, "Failed to update stock for the product");
          return null;
        }
        const message = `New Stock for the product ${updateProduct.name} is ${updateProduct.stockQty}`;
        const statusText = "New Stock";
        const status: NotificationStatus = "INFO";

        const notification = {
          message,
          statusText,
          status,
        };

        await db.notification.create({
          data: notification,
        });

        const purchaseItem = await db.purchaseOrderItems.create({
          data: {
            purchaseOrderId: purchaseOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            productName: item.productName,
            unitCost: item.unitCost,
            subTotal: item.subTotal,
            currentStock: item.currentStock,
          },
        });

        if (!purchaseItem) {
          ErrorMessage(res, 404, "Failed to create purchase order item");
          return null;
        }
      }
      return purchaseOrder.id;
    });

    if (!purchaseOrderId) {
      return ErrorMessage(res, 404, "Failed to create purchase order");
    }
    const savedPurchase = await db.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
      },
      include: {
        items: true,
        supplier: true,
      },
    });
    return res.status(200).json({ data: savedPurchase, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getPurchaseOrder(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
        supplier: true,
      },
    });
    if (!purchaseOrder) {
      return ErrorMessage(res, 404, "Purchase order not found");
    }
    return res.status(200).json({ data: purchaseOrder, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getPurchaseOrders(req: Request, res: Response) {
  try {
    const purchaseOrders = await db.purchaseOrder.findMany({
      include: {
        items: true,
        supplier: true,
      },
    });
    const total = purchaseOrders.length;
    return res
      .status(200)
      .json({ data: { purchaseOrders, total }, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}
