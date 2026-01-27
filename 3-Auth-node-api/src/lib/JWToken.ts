// lib/JWToken.ts
import jwt from "jsonwebtoken";
import { env } from "./envConfig";
import { Response } from "express";

export const GenerateJWT = (userId: string, res: Response) => {
  const accessToken = jwt.sign(
    { id: userId },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: "2h" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: "10d" }
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: env.NODE_ENV !== "Development",
    maxAge: 2 * 60 * 60 * 1000
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: env.NODE_ENV !== "Development",
    maxAge: 10 * 24 * 60 * 60 * 1000
  });

  return { accessToken, refreshToken };
};

export const GenerateATK = (userId: string, res: Response) => {
  const accessToken = jwt.sign(
    { id: userId },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: "2h" }
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: env.NODE_ENV !== "Development",
    maxAge: 2 * 60 * 60 * 1000
  });

  return accessToken;
};
