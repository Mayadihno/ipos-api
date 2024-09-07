import {
  createAdjustment,
  deleteAdjustment,
  getAdjustment,
  getAdjustments,
  updateAdjustment,
} from "@/controller/adjustment";
import { verifyUser } from "@/utils/verify-user";
import express from "express";

const adjustmentRouter = express.Router();

adjustmentRouter.post("/create-adjustment", verifyUser, createAdjustment);
adjustmentRouter.get("/adjustment", verifyUser, getAdjustments);
adjustmentRouter.get("/adjustment/:id", verifyUser, getAdjustment);
adjustmentRouter.put("/update-adjustment/:id", verifyUser, updateAdjustment);
adjustmentRouter.delete("/delete-adjustment/:id", verifyUser, deleteAdjustment);

export default adjustmentRouter;
