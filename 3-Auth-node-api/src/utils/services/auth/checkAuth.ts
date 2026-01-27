import { Request, Response } from "express";


export const checkAuth = async (req: Request, res: Response) => {
    try {
        const User = req.user;
        return res.status(200).json({
            status: true,
            message: "Authorized User!",
            data: User
        })
    } catch (error) {
        const err = error as Error
        return res.status(500).json({
            status: false,
            message: "Internal Server Error"
        })
    }
}