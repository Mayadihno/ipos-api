import {
  createPayee,
  deletePayee,
  getPayees,
  getSinglePayee,
  updatePayee,
} from "@/controller/payee";
import express from "express";

const payeeRouter = express.Router();

payeeRouter.post("/create-payee", createPayee);
payeeRouter.get("/payees", getPayees);
payeeRouter.get("/payee/:id", getSinglePayee);
payeeRouter.patch("/update-payee/:id", updatePayee);
payeeRouter.delete("/payee/:id", deletePayee);

export default payeeRouter;
