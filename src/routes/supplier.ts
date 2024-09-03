import {
  createSupplier,
  getSupplier,
  getSupplierById,
} from "@/controller/supplier";
import express from "express";

const supplierRouter = express.Router();

supplierRouter.post("/create-supplier", createSupplier);
supplierRouter.get("/suppliers", getSupplier);
supplierRouter.get("/supplier/:id", getSupplierById);

export default supplierRouter;
