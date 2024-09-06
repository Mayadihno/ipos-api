import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import express, { Request, Response } from "express";

export async function createNotifcation(req: Request, res: Response) {
  const { message, statusText, status } = req.body;

  try {
    const notification = await db.notification.create({
      data: {
        message,
        statusText,
        status,
      },
    });

    return res.status(200).json({ data: notification, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getNotifications(req: Request, res: Response) {
  try {
    const notifications = await db.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = notifications.length;

    return res
      .status(200)
      .json({ data: { notifications, total }, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getSingleNotification(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const notification = await db.notification.findUnique({
      where: {
        id,
      },
    });

    if (!notification) {
      return ErrorMessage(res, 404, "Notification not found");
    }

    return res.status(200).json({ data: notification, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function updateNotification(req: Request, res: Response) {
  const { id } = req.params;
  const { read } = req.body;
  try {
    const notification = await db.notification.findUnique({
      where: {
        id,
      },
    });

    if (!notification) {
      return ErrorMessage(res, 404, "Notification not found");
    }

    const updatedNotification = await db.notification.update({
      where: {
        id,
      },
      data: {
        read,
      },
    });

    return res.status(200).json({ data: updatedNotification, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function deleteNotification(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const notification = await db.notification.findUnique({
      where: {
        id,
      },
    });

    if (!notification) {
      return ErrorMessage(res, 404, "Notification not found");
    }

    await db.notification.delete({
      where: {
        id,
      },
    });

    return res
      .status(200)
      .json({ data: "Notification deleted successfully", error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}
