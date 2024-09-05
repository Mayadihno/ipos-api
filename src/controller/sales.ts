import { db } from "@/db/db";
import { SalesItem, SalesRequestBody } from "@/types/types";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { generateOrderNumber } from "@/utils/generateOrderNumbers";
import { Request, Response } from "express";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
} from "date-fns";

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
    shopId,
  }: SalesRequestBody = req.body;

  try {
    const saleId = await db.$transaction(async (transaction) => {
      if (balanceAmount > 0) {
        const customer = await transaction.customer.findUnique({
          where: { id: customerId },
        });

        if (!customer) {
          ErrorMessage(res, 400, "Customer not found");
          return null;
        }

        if (balanceAmount > customer?.maxCreditLimit) {
          ErrorMessage(res, 403, "Customer credit limit exceeded");
          return null;
        }

        const updateCustomer = await transaction.customer.update({
          where: { id: customerId },
          data: {
            unPaidCreditAmount: customer?.unPaidCreditAmount + balanceAmount,

            maxCreditLimit: { decrement: balanceAmount },
          },
        });

        if (!updateCustomer) {
          ErrorMessage(res, 400, "Failed to update customer credit details");
          return null;
        }
      }

      // Create the sale
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
          shopId,
        },
      });

      // Create the sales items
      if (salesItem && salesItem.length > 0) {
        for (const item of salesItem) {
          const updateProduct = await transaction.product.update({
            where: { id: item.productId },
            data: { stockQty: { decrement: item.qty } },
          });

          if (!updateProduct) {
            ErrorMessage(res, 400, "Failed to update stock product");
            return null;
          }

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
            ErrorMessage(res, 400, "Failed to create sale item");
            return null;
          }
        }
      }

      return sale.id;
    });

    if (!saleId) return;

    const sale = await db.sale.findUnique({
      where: { id: saleId as string },
      include: { salesItem: true },
    });

    return res.status(201).json({ data: sale, error: null });
  } catch (error) {
    console.error(error);
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

export async function getShopSales(req: Request, res: Response) {
  const { shopId } = req.params;

  // Define time periods
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  try {
    const shop = await db.shop.findUnique({
      where: {
        id: shopId,
      },
    });

    if (!shop) {
      return ErrorMessage(res, 404, "Shop not found");
    }
    // Fetch sales for different periods
    const categorizeSales = async (sales: any[]) => {
      return {
        total: sales,
        salesPaidInCash: sales.filter(
          (sale) => sale.paymentMethod === "CASH" && sale.balanceAmount <= 0
        ),
        salesPaidInCredit: sales.filter((sale) => sale.balanceAmount > 0),
        salesByMobileMoney: sales.filter(
          (sale) => sale.paymentMethod === "MOBILEMONEY"
        ),
        salesByHandCash: sales.filter(
          (sale) => sale.paymentMethod === "CASH" && sale.balanceAmount <= 0
        ),
      };
    };

    const salesToday = await db.sale.findMany({
      where: {
        shopId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const salesThisWeek = await db.sale.findMany({
      where: {
        shopId,
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const salesThisMonth = await db.sale.findMany({
      where: {
        shopId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const salesAllTime = await db.sale.findMany({
      where: {
        shopId,
      },
    });

    res.status(200).json({
      today: await categorizeSales(salesToday),
      thisWeek: await categorizeSales(salesThisWeek),
      thisMonth: await categorizeSales(salesThisMonth),
      allTime: await categorizeSales(salesAllTime),
      error: null,
    });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getShopsSales(req: Request, res: Response) {
  // Define time periods
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  try {
    // Fetch all sales and group by shopId for different periods

    const fetchSalesData = async (startDate: Date, endDate: Date) => {
      return await db.sale.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          shopId: true,
          paymentMethod: true,
          balanceAmount: true,
          saleAmount: true,
          saleType: true,
        },
      });
    };
    const categorizeSales = (sales: any[]) => {
      return {
        totalSales: sales,
        salesPaidInCash: sales.filter(
          (sale) => sale.paymentMethod === "CASH" && sale.balanceAmount <= 0
        ),
        salesPaidInCredit: sales.filter((sale) => sale.balanceAmount > 0),
        salesByMobileMoney: sales.filter(
          (sale) => sale.paymentMethod === "MOBILEMONEY"
        ),
        salesByHandCash: sales.filter(
          (sale) => sale.paymentMethod === "CASH" && sale.balanceAmount <= 0
        ),
      };
    };

    const salesToday = await fetchSalesData(todayStart, todayEnd);

    const salesThisWeek = await fetchSalesData(weekStart, weekEnd);

    const salesThisMonth = await fetchSalesData(monthStart, monthEnd);

    const salesAllTime = await db.sale.findMany({
      select: {
        shopId: true,
        paymentMethod: true,
        balanceAmount: true,
        saleAmount: true,
        saleType: true,
      },
    });

    res.status(200).json({
      today: categorizeSales(salesToday),
      thisWeek: categorizeSales(salesThisWeek),
      thisMonth: categorizeSales(salesThisMonth),
      allTime: categorizeSales(salesAllTime),
      error: null,
    });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal server error");
  }
}
