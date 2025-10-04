"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyController = void 0;
const propertyService_1 = require("../services/propertyService");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.propertyController = {
    getAllProperties: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const properties = await propertyService_1.propertyService.getAllProperties();
        res.json({
            success: true,
            data: properties,
            message: "Properties retrieved successfully"
        });
    }),
    getPropertyById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const property = await propertyService_1.propertyService.getPropertyById(id);
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
    createProperty: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const propertyData = req.body;
        const property = await propertyService_1.propertyService.createProperty(propertyData);
        res.status(201).json({
            success: true,
            data: property,
            message: "Property created successfully"
        });
    }),
    updateProperty: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        const property = await propertyService_1.propertyService.updateProperty(id, updateData);
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
    deleteProperty: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const deleted = await propertyService_1.propertyService.deleteProperty(id);
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
    getPhotos: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const photos = await propertyService_1.propertyService.getPhotos(id);
        res.json({
            success: true,
            data: photos,
            message: "Photos retrieved successfully"
        });
    }),
    uploadPhotos: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }
        const photos = await propertyService_1.propertyService.uploadPhotos(id, files);
        res.status(201).json({
            success: true,
            data: photos,
            message: `Successfully uploaded ${photos.length} photos`
        });
    }),
    setCoverPhoto: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id, photoId } = req.params;
        const photos = await propertyService_1.propertyService.setCoverPhoto(id, photoId);
        res.json({
            success: true,
            data: photos,
            message: "Cover photo set successfully"
        });
    }),
    deletePhoto: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id, photoId } = req.params;
        const photos = await propertyService_1.propertyService.deletePhoto(id, photoId);
        res.json({
            success: true,
            data: photos,
            message: "Photo deleted successfully"
        });
    })
};
//# sourceMappingURL=propertyController.js.map