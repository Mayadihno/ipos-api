import {
  createSale,
  createSaleItem,
  deleteSale,
  getSales,
  getShopSales,
  getShopsSales,
} from "@/controller/sales";
import { verifyUser } from "@/utils/verify-user";
import express from "express";

const salesRouter = express.Router();

salesRouter.post("/create-sale", verifyUser, createSale);
salesRouter.post("/create-sale/item", createSaleItem);
salesRouter.get("/sales", verifyUser, getSales);
salesRouter.get("/sales/shop/:shopId", verifyUser, getShopSales);
salesRouter.get("/sales/all-shop", verifyUser, getShopsSales);
salesRouter.delete("/sale/:id", verifyUser, deleteSale);

export default salesRouter;
