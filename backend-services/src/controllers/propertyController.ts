import { Request, Response } from "express";
import { propertyService } from "../services/propertyService";
import { asyncHandler } from "../middleware/asyncHandler";

export const propertyController = {
  // Get all properties
  getAllProperties: asyncHandler(async (req: Request, res: Response) => {
    const properties = await propertyService.getAllProperties();
    res.json({
      success: true,
      data: properties,
      message: "Properties retrieved successfully"
    });
  }),

  // Get property by ID
  getPropertyById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const property = await propertyService.getPropertyById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    res.json({
      success: true,
      data: property,
      message: "Property retrieved successfully"
    });
  }),

  // Create new property
  createProperty: asyncHandler(async (req: Request, res: Response) => {
    const propertyData = req.body;
    const property = await propertyService.createProperty(propertyData);
    
    res.status(201).json({
      success: true,
      data: property,
      message: "Property created successfully"
    });
  }),

  // Update property
  updateProperty: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const property = await propertyService.updateProperty(id, updateData);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    res.json({
      success: true,
      data: property,
      message: "Property updated successfully"
    });
  }),

  // Delete property
  deleteProperty: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await propertyService.deleteProperty(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    res.json({
      success: true,
      message: "Property deleted successfully"
    });
  }),

  // Get photos for property
  getPhotos: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const photos = await propertyService.getPhotos(id);
    
    res.json({
      success: true,
      data: photos,
      message: "Photos retrieved successfully"
    });
  }),

  // Upload photos for property
  uploadPhotos: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const photos = await propertyService.uploadPhotos(id, files);
    
    res.status(201).json({
      success: true,
      data: photos,
      message: `Successfully uploaded ${photos.length} photos`
    });
  }),

  // Set cover photo
  setCoverPhoto: asyncHandler(async (req: Request, res: Response) => {
    const { id, photoId } = req.params;
    const photos = await propertyService.setCoverPhoto(id, photoId);
    
    res.json({
      success: true,
      data: photos,
      message: "Cover photo set successfully"
    });
  }),

  // Delete photo
  deletePhoto: asyncHandler(async (req: Request, res: Response) => {
    const { id, photoId } = req.params;
    const photos = await propertyService.deletePhoto(id, photoId);
    
    res.json({
      success: true,
      data: photos,
      message: "Photo deleted successfully"
    });
  })
};
