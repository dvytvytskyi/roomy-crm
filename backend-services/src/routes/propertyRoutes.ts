import { Router } from "express";
import multer from "multer";
import { propertyController } from "../controllers/propertyController";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Property routes
router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getPropertyById);
router.post("/", propertyController.createProperty);
router.put("/:id", propertyController.updateProperty);
router.delete("/:id", propertyController.deleteProperty);

// Photo routes
router.get("/:id/photos", propertyController.getPhotos);
router.post("/:id/photos/upload", upload.array('photos', 10), propertyController.uploadPhotos);
router.post("/:id/photos/:photoId/cover", propertyController.setCoverPhoto);
router.delete("/:id/photos/:photoId", propertyController.deletePhoto);

export default router;
