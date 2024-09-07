import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "@/utils/generateJWT";

interface CustomRequest extends Request {
  email?: string;
  id?: string;
}

interface DecodedToken {
  id: string;
  email: string;
}

export async function verifyUser(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.cookies.sessionToken;

  if (!accessToken) {
    const renewed = await renewToken(req, res);
    if (renewed) {
      return next();
    } else {
      return res.status(401).json({ valid: false, message: "No Access Token" });
    }
  } else {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.SECRET_KEY as string
      ) as DecodedToken;
      req.email = decoded.email;
      req.id = decoded.id;
      return next();
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ valid: false, message: "Invalid Token" });
    }
  }
}

async function renewToken(req: CustomRequest, res: Response): Promise<boolean> {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return false;
  } else {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.SECRET_KEY as string
      ) as DecodedToken;

      const newAccessToken = generateAccessToken({
        id: decoded.id,
        email: decoded.email,
      });

      res.cookie("sessionToken", newAccessToken, {
        maxAge: 3600000, // 1 hr
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return true;
    } catch (err) {
      console.error("Refresh token verification error:", err);
      return false;
    }
  }
}
