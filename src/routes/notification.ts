import {
  createNotifcation,
  deleteNotification,
  getNotifications,
  getSingleNotification,
  updateNotification,
} from "@/controller/notification";
import express from "express";

const notificationRouter = express.Router();

notificationRouter.post("/create-notification", createNotifcation);
notificationRouter.get("/notifications", getNotifications);
notificationRouter.get("/notification/:id", getSingleNotification);
notificationRouter.patch("/notification/:id", updateNotification);
notificationRouter.delete("/notification/:id", deleteNotification);

export default notificationRouter;
