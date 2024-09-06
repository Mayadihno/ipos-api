import {
  createPurchaseOrder,
  getPurchaseOrder,
  getPurchaseOrders,
} from "@/controller/purchaseOrder";
import express from "express";

const purchaseOrderRouter = express.Router();

purchaseOrderRouter.post("/purchase-order", createPurchaseOrder);
purchaseOrderRouter.get("/purchases", getPurchaseOrders);
purchaseOrderRouter.get("/purchase/:id", getPurchaseOrder);

export default purchaseOrderRouter;
