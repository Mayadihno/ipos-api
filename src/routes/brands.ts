import {
  createBrands,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "@/controller/brands";
import express from "express";

const brandRouter = express.Router();

brandRouter.post("/create-brand", createBrands);
brandRouter.get("/brands", getBrands);
brandRouter.get("/brand/:id", getBrandById);
brandRouter.patch("/brand/:id", updateBrand);
brandRouter.delete("/brand/:id", deleteBrand);

export default brandRouter;
