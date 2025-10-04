"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const authValidation_1 = require("../validation/authValidation");
const router = (0, express_1.Router)();
router.post("/register", (0, validation_1.validateRequest)(authValidation_1.registerSchema), authController_1.authController.register);
router.post("/login", (0, validation_1.validateRequest)(authValidation_1.loginSchema), authController_1.authController.login);
router.post("/refresh", authController_1.authController.refresh);
router.get("/profile", auth_1.authenticate, authController_1.authController.profile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map