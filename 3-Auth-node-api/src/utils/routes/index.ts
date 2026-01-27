import { Router, Request, Response } from "express";
import { AuthRouter } from "./auth";
import { ProtectedRoute } from "../../middlewares/ProtectedRoute";

const router = Router();

router.get("/", ProtectedRoute, (req: Request, res: Response) => {
  return res.status(200).json({
    status: true,
    message: "success",
    data: {
      body: "Welcome to my Auth API"
    }
  });
});

router.use("/auth", AuthRouter);

export { router as MainRouter };
