import { createUser, getUserById, getusers } from "@/controller/users";
import express from "express";

const userRouter = express.Router();
userRouter.post("/users", createUser);
userRouter.get("/users", getusers);
userRouter.get("/users/:id", getUserById);

export default userRouter;
