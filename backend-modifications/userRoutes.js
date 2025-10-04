"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../validationSchemas");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", userController_1.userController.getUsers);
router.get("/stats", userController_1.userController.getUserStats);
router.post("/", (0, validation_1.validateRequest)(validationSchemas_1.createUserSchema), userController_1.userController.createUser);
router.get("/:id", userController_1.userController.getUser);
router.put("/:id", (0, validation_1.validateRequest)(validationSchemas_1.updateUserSchema), userController_1.userController.updateUser);
router.delete("/:id", userController_1.userController.deleteUser);
router.put("/:id/activate", userController_1.userController.toggleUserStatus);
router.put("/:id/role", (0, validation_1.validateRequest)(validationSchemas_1.changeRoleSchema), userController_1.userController.changeUserRole);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map