import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { updateUserSchema, changeRoleSchema, createUserSchema } from "../validationSchemas";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// User management routes
router.get("/", userController.getUsers);
router.get("/stats", userController.getUserStats);
router.post("/", validateRequest(createUserSchema), userController.createUser);
router.get("/:id", userController.getUser);
router.put("/:id", validateRequest(updateUserSchema), userController.updateUser);
router.delete("/:id", userController.deleteUser);

// User status and role management
router.put("/:id/activate", userController.toggleUserStatus);
router.put("/:id/role", validateRequest(changeRoleSchema), userController.changeUserRole);

export default router;
