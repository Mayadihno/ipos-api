import { Response } from "express";

export function ErrorMessage(
  res: Response,
  statusCode: number,
  message: string
) {
  return res.status(statusCode).json({ message, data: null });
}
