import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../lib/envConfig";
import { UserModel } from "../utils/models/User.model";
import { GenerateATK } from "../lib/JWToken";

export const ProtectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = req.cookies;
    // console.log("Request=>",req);
    console.log("AccessToken=>",accessToken)

    // ❌ No tokens
    if (!accessToken && !refreshToken) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized - Tokens missing"
      });
    }

    // ✅ Try access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(
          accessToken,
          env.ACCESS_TOKEN_SECRET
        ) as JwtPayload;

        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) throw new Error("User not found");

        req.user = user;
        return next();
      } catch (err) {
        // continue to refresh token logic
      }
    }

    // 🔁 Refresh token flow
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        env.REFRESH_TOKEN_SECRET
      ) as JwtPayload;

      const user = await UserModel.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized - Invalid refresh token"
        });
      }

      GenerateATK(user._id.toString(), res);
      req.user = user;
      return next();
    }

    return res.status(401).json({
      status: false,
      message: "Unauthorized"
    });

  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized - Token verification failed"
    });
  }
};
