import {
  changePassword,
  forgotPassword,
  loginUser,
  verifyToken,
} from "@/controller/login";
import express from "express";

const loginRouter = express.Router();

loginRouter.post("/auth/login", loginUser);
loginRouter.patch("/auth/forgot-password", forgotPassword);
loginRouter.get("/auth/verify-token", verifyToken);
loginRouter.put("/auth/change-password", changePassword);

export default loginRouter;
