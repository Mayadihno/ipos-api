import {
  createSale,
  createSaleItem,
  deleteSale,
  getSales,
} from "@/controller/sales";
import express from "express";

const salesRouter = express.Router();

salesRouter.post("/create-sale", createSale);
salesRouter.post("/create-sale/item", createSaleItem);
salesRouter.get("/sales", getSales);
salesRouter.delete("/sale/:id", deleteSale);

export default salesRouter;
