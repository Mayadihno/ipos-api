import {
  createProduct,
  deleteProductById,
  getProductById,
  getProducts,
  updateProduct,
} from "@/controller/products";
import express from "express";

const productRouter = express.Router();

productRouter.post("/create-product", createProduct);
productRouter.get("/products", getProducts);
productRouter.get("/product/:id", getProductById);
productRouter.put("/product/:id", updateProduct);
productRouter.delete("/product/:id", deleteProductById);

export default productRouter;
