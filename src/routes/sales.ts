import {
  createSale,
  createSaleItem,
  deleteSale,
  getSales,
  getShopSales,
  getShopsSales,
} from "@/controller/sales";
import express from "express";

const salesRouter = express.Router();

salesRouter.post("/create-sale", createSale);
salesRouter.post("/create-sale/item", createSaleItem);
salesRouter.get("/sales", getSales);
salesRouter.get("/sales/shop/:shopId", getShopSales);
salesRouter.get("/sales/all-shop", getShopsSales);
salesRouter.delete("/sale/:id", deleteSale);

export default salesRouter;
