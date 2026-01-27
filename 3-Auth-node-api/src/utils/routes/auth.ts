import {Router} from "express";
import { checkAuth, login, register } from "../services/auth";
import { ProtectedRoute } from "../../middlewares/ProtectedRoute";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/checkAuth", ProtectedRoute, checkAuth)

export {router as AuthRouter};