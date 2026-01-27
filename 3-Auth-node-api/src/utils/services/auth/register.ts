import { Request, Response } from "express";
import { UserModel } from "../../models/User.model";
import bcrypt from "bcryptjs";
import { GenerateJWT } from "../../../lib/JWToken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, dob } = req.body;

    // 1️⃣ Validate required fields
    if (!name || !email || !password || !phone || !dob) {
      return res.status(400).json({
        status: false,
        message: "Required fields are missing [name, email, password, phone, dob]"
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exists"
      });
    }

    // 3️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const newUser = await UserModel.create({
      name,
      email,
      password: passwordHash,
      phone,
      dob: new Date(dob)
    });

    GenerateJWT(newUser._id.toString(), res);

    // 5️⃣ Success response (no password)
    return res.status(201).json({
      status: true,
      message: "Registration successful",
      data: {
        user_id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    const err = error as Error;
    console.error("❌ Error in register:", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};
