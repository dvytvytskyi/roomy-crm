"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const propertyController_1 = require("../controllers/propertyController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
router.get("/", propertyController_1.propertyController.getAllProperties);
router.get("/:id", propertyController_1.propertyController.getPropertyById);
router.post("/", propertyController_1.propertyController.createProperty);
router.put("/:id", propertyController_1.propertyController.updateProperty);
router.delete("/:id", propertyController_1.propertyController.deleteProperty);
router.get("/:id/photos", propertyController_1.propertyController.getPhotos);
router.post("/:id/photos/upload", upload.array('photos', 10), propertyController_1.propertyController.uploadPhotos);
router.post("/:id/photos/:photoId/cover", propertyController_1.propertyController.setCoverPhoto);
router.delete("/:id/photos/:photoId", propertyController_1.propertyController.deletePhoto);
exports.default = router;
//# sourceMappingURL=propertyRoutes.js.map