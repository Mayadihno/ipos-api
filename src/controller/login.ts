import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { CookieOptions, Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { generateAccessToken } from "@/utils/generateJWT";
import { generateToken } from "@/utils/generateToken";
import { addMinutes } from "date-fns";
import nodemailer from "nodemailer";

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
    const refreshToken = generateAccessToken(usersData);
    const accessTokenCookieOptions: CookieOptions = {
      maxAge: 2 * 60 * 60 * 1000, // 2 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };
    const refreshTokenCookieOptions: CookieOptions = {
      maxAge: 3 * 60 * 60 * 1000, // 3 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("sessionToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    res
      .status(200)
      .json({ message: "Login successful", user: usersData, accessToken });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  secure: true,
  port: 465,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return ErrorMessage(res, 404, "User Not Found");
    }

    const resetToken = generateToken().toString();
    const resetTokenExpiry = addMinutes(new Date(), 30);

    await db.user.update({
      where: {
        email,
      },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const htmlTemplate = `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
    IPOS
  </div>
  <div style="padding: 20px 0;">
    <h2 style="text-align: center; color: #0073e6; font-size: 24px;">Password Reset Request</h2>
    <p style="font-size: 16px; line-height: 1.5; color: #555555;">
      Dear ${user.username},
    </p>
    <p style="font-size: 16px; line-height: 1.5; color: #555555;">
      We received a request to reset the password associated with your account. If you made this request, please use the following token to reset your password:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; padding: 15px 30px; background-color: #0073e6; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 18px; font-weight: bold;">${resetToken}</span>
    </div>
    <p style="text-align: center; font-size: 14px; color: #ff4d4d; margin-bottom: 20px;">This token is valid for 30 minutes.</p>
    <p style="font-size: 16px; line-height: 1.5; color: #555555;">
      Please note that the token is sensitive and should not be shared with anyone. If you did not request a password reset, please disregard this email or contact our support team immediately.
    </p>
    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 4px; margin-top: 30px;">
      <p style="font-size: 16px; line-height: 1.5; color: #555555; margin: 0;"><strong>Your Account Information:</strong></p>
      <ul style="list-style-type: none; padding: 0; margin: 10px 0;">
        <li style="font-size: 16px; color: #555555;"><strong>Username:</strong> ${
          user.username
        }</li>
        <li style="font-size: 16px; color: #555555;"><strong>Email:</strong> ${
          user.email
        }</li>
      </ul>
    </div>
  </div>
  <div style="border-top: 1px solid #eaeaea; padding-top: 20px; margin-top: 30px; text-align: center; color: #999999; font-size: 14px;">
    <p>If you need further assistance, please visit our <a href="https://yourcompanysupport.com" style="color: #0073e6; text-decoration: none;">Support Center</a>.</p>
    <p>Thank you for using our service.</p>
    <p>&copy; ${new Date().getFullYear()} Your Company, Inc. All rights reserved.</p>
  </div>
</div>
`;

    // Send email using nodemailer
    await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: htmlTemplate,
    });

    res.status(201).json({
      data: `Password reset code sent to ${email}`,
      error: null,
    });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function verifyToken(req: Request, res: Response) {
  const { resetToken } = req.query;

  try {
    const user = await db.user.findFirst({
      where: {
        resetToken: resetToken as string,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      return ErrorMessage(res, 400, "Invalid or expired token");
    }

    return res
      .status(200)
      .json({ data: "Token Verified Successfully", error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal Server error");
  }
}

export async function changePassword(req: Request, res: Response) {
  const { resetToken } = req.query;
  const { newPassword } = req.body;
  try {
    const user = await db.user.findFirst({
      where: {
        resetToken: resetToken as string,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      return ErrorMessage(res, 400, "Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res
      .status(200)
      .json({ data: "Password changed successfully", error: null });
  } catch (error) {
    console.log(error);
    return ErrorMessage(res, 500, "Internal Server error");
  }
}
