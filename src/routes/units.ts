import {
  createUnits,
  deleteUnit,
  getUnitById,
  getUnits,
  updateUnit,
} from "@/controller/units";
import express from "express";

const unitRouter = express.Router();

unitRouter.post("/create-unit", createUnits);
unitRouter.get("/units", getUnits);
unitRouter.get("/unit/:id", getUnitById);
unitRouter.patch("/unit/:id", updateUnit);
unitRouter.delete("/unit/:id", deleteUnit);

export default unitRouter;
