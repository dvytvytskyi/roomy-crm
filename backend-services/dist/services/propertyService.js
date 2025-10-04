"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const s3_service_1 = __importDefault(require("../../s3-service"));
const PROPERTIES_FILE = path_1.default.join(__dirname, '../../data/properties.json');
class PropertyService {
    async loadProperties() {
        try {
            const data = await promises_1.default.readFile(PROPERTIES_FILE, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error loading properties:', error);
            return [];
        }
    }
    async saveProperties(properties) {
        try {
            await promises_1.default.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
        }
        catch (error) {
            console.error('Error saving properties:', error);
            throw error;
        }
    }
    async getAllProperties() {
        return this.loadProperties();
    }
    async getPropertyById(id) {
        const properties = await this.loadProperties();
        return properties.find(p => p.id === id) || null;
    }
    async createProperty(propertyData) {
        const properties = await this.loadProperties();
        const newProperty = {
            id: `prop_${Date.now()}`,
            name: propertyData.name || '',
            nickname: propertyData.nickname || '',
            status: propertyData.status || 'active',
            type: propertyData.type || 'apartment',
            location: propertyData.location || '',
            address: propertyData.address || '',
            size: propertyData.size || 0,
            beds: propertyData.beds || [],
            parkingSlots: propertyData.parkingSlots || 0,
            agencyFee: propertyData.agencyFee || 0,
            dtcmLicenseExpiry: propertyData.dtcmLicenseExpiry || '',
            referringAgent: propertyData.referringAgent || { name: '', commission: 0 },
            checkInFrom: propertyData.checkInFrom || '15:00',
            checkOutTo: propertyData.checkOutTo || '12:00',
            unitIntakeDate: propertyData.unitIntakeDate || '',
            ownerId: propertyData.ownerId,
            owner_name: propertyData.owner_name,
            owner_email: propertyData.owner_email,
            owner_phone: propertyData.owner_phone,
            photos: []
        };
        properties.push(newProperty);
        await this.saveProperties(properties);
        return newProperty;
    }
    async updateProperty(id, updateData) {
        const properties = await this.loadProperties();
        const index = properties.findIndex(p => p.id === id);
        if (index === -1)
            return null;
        properties[index] = { ...properties[index], ...updateData };
        await this.saveProperties(properties);
        return properties[index];
    }
    async deleteProperty(id) {
        const properties = await this.loadProperties();
        const index = properties.findIndex(p => p.id === id);
        if (index === -1)
            return false;
        const property = properties[index];
        if (property.photos) {
            for (const photo of property.photos) {
                if (photo.s3Key) {
                    await s3_service_1.default.deleteFile(photo.s3Key);
                }
            }
        }
        properties.splice(index, 1);
        await this.saveProperties(properties);
        return true;
    }
    async getPhotos(propertyId) {
        const property = await this.getPropertyById(propertyId);
        return property?.photos || [];
    }
    async uploadPhotos(propertyId, files) {
        const property = await this.getPropertyById(propertyId);
        if (!property) {
            throw new Error('Property not found');
        }
        const uploadedPhotos = [];
        for (const file of files) {
            try {
                const uploadResult = await s3_service_1.default.uploadFile(file, `properties/${propertyId}/photos`);
                if (!uploadResult.success) {
                    console.error('Failed to upload file to S3:', uploadResult.error);
                    continue;
                }
                const photo = {
                    id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    url: uploadResult.url,
                    name: file.originalname,
                    size: file.size,
                    isCover: false,
                    uploadedAt: new Date().toISOString(),
                    s3Key: uploadResult.key
                };
                uploadedPhotos.push(photo);
            }
            catch (error) {
                console.error('Error uploading photo:', error);
            }
        }
        const updatedPhotos = [...(property.photos || []), ...uploadedPhotos];
        await this.updateProperty(propertyId, { photos: updatedPhotos });
        return uploadedPhotos;
    }
    async setCoverPhoto(propertyId, photoId) {
        const property = await this.getPropertyById(propertyId);
        if (!property || !property.photos) {
            throw new Error('Property or photos not found');
        }
        const updatedPhotos = property.photos.map(photo => ({
            ...photo,
            isCover: photo.id === photoId
        }));
        await this.updateProperty(propertyId, { photos: updatedPhotos });
        return updatedPhotos;
    }
    async deletePhoto(propertyId, photoId) {
        const property = await this.getPropertyById(propertyId);
        if (!property || !property.photos) {
            throw new Error('Property or photos not found');
        }
        const photoToDelete = property.photos.find(p => p.id === photoId);
        if (!photoToDelete) {
            throw new Error('Photo not found');
        }
        if (photoToDelete.s3Key) {
            await s3_service_1.default.deleteFile(photoToDelete.s3Key);
        }
        const updatedPhotos = property.photos.filter(p => p.id !== photoId);
        if (photoToDelete.isCover && updatedPhotos.length > 0) {
            updatedPhotos[0].isCover = true;
        }
        await this.updateProperty(propertyId, { photos: updatedPhotos });
        return updatedPhotos;
    }
}
exports.propertyService = new PropertyService();
//# sourceMappingURL=propertyService.js.map