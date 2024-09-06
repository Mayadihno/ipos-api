import {
  createAdjustment,
  deleteAdjustment,
  getAdjustment,
  getAdjustments,
  updateAdjustment,
} from "@/controller/adjustment";
import express from "express";

const adjustmentRouter = express.Router();

adjustmentRouter.post("/create-adjustment", createAdjustment);
adjustmentRouter.get("/adjustment", getAdjustments);
adjustmentRouter.get("/adjustment/:id", getAdjustment);
adjustmentRouter.put("/update-adjustment/:id", updateAdjustment);
adjustmentRouter.delete("/delete-adjustment/:id", deleteAdjustment);

export default adjustmentRouter;
