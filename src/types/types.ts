import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export interface SalesRequestBody {
  customerId: string;
  customerName: string;
  customerEmail: string;
  saleAmount: number;
  balanceAmount: number;
  paidAmount: number;
  status: OrderStatus;
  saleType: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionCode: string;
  salesItem: SalesItem[];
}

export interface SalesItem {
  productId: string;
  saleId: string;
  qty: number;
  productPrice: number;
  productName: string;
  productImage: string;
}
