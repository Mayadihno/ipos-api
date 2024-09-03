import { loginUser } from "@/controller/login";
import express from "express";

const loginRouter = express.Router();

loginRouter.post("/auth/login", loginUser);

export default loginRouter;
