import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { registerSchema, loginSchema } from "../validation/authValidation";

const router = Router();

// Public routes
router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/refresh", authController.refresh);

// Protected routes
router.get("/profile", authenticate, authController.profile);

export default router;
