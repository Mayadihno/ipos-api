import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
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
    role,
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
        role,
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

    if (!user) {
      return ErrorMessage(res, 404, "User not found");
    }
    const { password, ...userData } = user as User;
    return res.status(200).json({ data: userData, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { email, username, lastName, firstName, phone, dob, gender, image } =
    req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return ErrorMessage(res, 404, "User not found");
    }

    if (email && email !== user.email) {
      const emailExist = await db.user.findUnique({
        where: {
          email,
        },
      });

      if (emailExist) {
        return ErrorMessage(res, 409, `Email ${email} already exist`);
      }
    }

    if (username && username !== user.username) {
      const usernameExist = await db.user.findUnique({
        where: {
          username,
        },
      });

      if (usernameExist) {
        return ErrorMessage(res, 409, `Username ${username} already exist`);
      }
    }

    if (phone && phone !== user.phone) {
      const phoneExist = await db.user.findUnique({
        where: {
          phone,
        },
      });

      if (phoneExist) {
        return ErrorMessage(res, 409, `Phone Number ${phone} already exist`);
      }
    }

    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        email,
        username,
        lastName,
        firstName,
        phone,
        dob,
        gender,
        image,
      },
    });

    const { password, ...userData } = updatedUser as User;

    res.status(200).json({
      data: userData,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function updateUserPassword(req: Request, res: Response) {
  const { id } = req.params;
  const { password, newPassword } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return ErrorMessage(res, 404, "User not found");
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return ErrorMessage(res, 401, "Incorrect password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      data: "Password updated successfully",
      error: null,
    });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function deleteUserById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return ErrorMessage(res, 404, "User not found");
    }

    await db.user.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      data: "User deleted successfully",
      error: null,
    });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}

export async function getAttendants(req: Request, res: Response) {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        role: "ATTENDANT",
      },
    });

    const filterPassword = users.map((user) => {
      const { password, ...others } = user;
      return others;
    });

    const total = users.length;
    return res
      .status(200)
      .json({ data: { users: filterPassword, total }, error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server Error");
  }
}
