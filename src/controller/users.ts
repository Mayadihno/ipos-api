import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { error } from "console";
import { User } from "@prisma/client";

export async function createUser(req: Request, res: Response) {
  const {
    email,
    username,
    password,
    lastName,
    firstName,
    phone,
    dob,
    gender,
    image,
  } = req.body;
  try {
    const emailExist = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (emailExist) {
      return ErrorMessage(res, 409, `Email ${email} already exists`);
    }

    const usernameExist = await db.user.findUnique({
      where: {
        username,
      },
    });
    if (usernameExist) {
      return ErrorMessage(res, 409, `Username ${username} already exists`);
    }

    const phoneExist = await db.user.findUnique({
      where: {
        phone,
      },
    });
    if (phoneExist) {
      return ErrorMessage(res, 409, `Phone Number ${phone} already exists`);
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        lastName,
        firstName,
        phone,
        dob,
        gender,
        image: image
          ? image
          : "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg",
      },
    });
    const { password: savedPassword, ...newUser } = user;
    return res.status(201).json({
      data: newUser,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getusers(req: Request, res: Response) {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const filterPassword = users.map((user) => {
      const { password, ...others } = user;
      return others;
    });

    const total = await db.user.count();
    return res
      .status(200)
      .json({ data: { users: filterPassword, total }, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });
    const { password, ...userData } = user as User;
    return res.status(200).json({ data: userData, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}
