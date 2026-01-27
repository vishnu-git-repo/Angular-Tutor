import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../../models/User.model";
import { GenerateJWT } from "../../../lib/JWToken";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required"
      });
    }

    // Find user and include password
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials"
      });
    }

    // Generate tokens (cookies)
    GenerateJWT(user._id.toString(), res);

    // Success response (NO password)
    return res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    const err = error as Error;
    console.error("❌ Error in login:", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};
