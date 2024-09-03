import {
  createCategoris,
  deletecategories,
  getCategoriesById,
  getCategoriess,
  updateCategories,
} from "@/controller/categories";
import express from "express";

const categoryRouter = express.Router();

categoryRouter.post("/create-category", createCategoris);
categoryRouter.get("/categories", getCategoriess);
categoryRouter.get("/category/:id", getCategoriesById);
categoryRouter.patch("/category/:id", updateCategories);
categoryRouter.delete("/category/:id", deletecategories);

export default categoryRouter;
