import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { generateAccessToken } from "@/utils/generateJWT";

export async function loginUser(req: Request, res: Response) {
  const { email, username, password } = req.body;
  try {
    let existingUser;
    if (email) {
      existingUser = await db.user.findUnique({
        where: {
          email,
        },
      });
      if (!existingUser) {
        return ErrorMessage(res, 403, "Incorrect Email OR Password");
      }
    }

    if (username) {
      existingUser = await db.user.findUnique({
        where: {
          username,
        },
      });
      if (!existingUser) {
        return ErrorMessage(res, 403, "Incorrect Username OR Password");
      }
    }

    const comparePassword = await bcrypt.compare(
      password,
      existingUser?.password ?? ""
    );

    if (!comparePassword) {
      return ErrorMessage(res, 403, "Invalid Password");
    }

    const { password: savedPassword, ...usersData } = existingUser as User;
    const accessToken = generateAccessToken(usersData);
    res.status(200).json({ data: { usersData, accessToken } });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}
