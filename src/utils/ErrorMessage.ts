import { Response } from "express";

export function ErrorMessage(res: Response, statusCode: number, error: string) {
  return res.status(statusCode).json({ error, data: null });
}
