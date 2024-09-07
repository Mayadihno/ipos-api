import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateAccessToken } from "@/utils/generateJWT";

// Extend the Request interface to include custom properties
interface CustomRequest extends Request {
  email?: string;
  id?: string;
}

interface DecodedToken {
  id: string;
  email: string;
}

async function renewToken(req: CustomRequest, res: Response): Promise<boolean> {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return false;
  }

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
      maxAge: 2 * 60 * 60 * 1000, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return true;
  } catch (err) {
    if (!res.headersSent) {
      res
        .status(401)
        .json({ valid: false, message: "Refresh token verification error" });
    }
    return false;
  }
}

export async function verifyUser(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.cookies?.sessionToken;

    if (!accessToken) {
      const renewed = await renewToken(req, res);
      if (renewed) {
        return next(); // Token renewed, continue to the next middleware
      } else {
        if (!res.headersSent) {
          return res
            .status(401)
            .json({ valid: false, message: "No Access Token" });
        }
      }
    } else {
      const decoded = jwt.verify(
        accessToken,
        process.env.SECRET_KEY as string
      ) as DecodedToken;
      req.email = decoded.email;
      req.id = decoded.id;
      return next();
    }
  } catch (err) {
    if (!res.headersSent) {
      return res.status(401).json({ valid: false, message: "Invalid Token" });
    }
  }
}
