import {
  createUser,
  deleteUserById,
  getAttendants,
  getUserById,
  getusers,
  updateUser,
  updateUserPassword,
} from "@/controller/users";
import express from "express";

const userRouter = express.Router();
userRouter.post("/users", createUser);
userRouter.get("/users", getusers);
userRouter.get("/attendants", getAttendants);
userRouter.get("/users/:id", getUserById);
userRouter.put("/users/:id", updateUser);
userRouter.patch("/users/:id", updateUserPassword);
userRouter.delete("/users/:id", deleteUserById);

export default userRouter;
