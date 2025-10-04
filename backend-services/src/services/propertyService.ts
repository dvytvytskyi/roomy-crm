import fs from 'fs/promises';
import path from 'path';
import s3Service from '../../s3-service';

interface Property {
  id: string;
  name: string;
  nickname?: string;
  status: string;
  type: string;
  location: string;
  address: string;
  size: number;
  beds: Array<{type: string; count: number}>;
  parkingSlots: number;
  agencyFee: number;
  dtcmLicenseExpiry: string;
  referringAgent: {name: string; commission: number};
  checkInFrom: string;
  checkOutTo: string;
  unitIntakeDate: string;
  ownerId?: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  photos?: Photo[];
}

interface Photo {
  id: string;
  url: string;
  name: string;
  size: number;
  isCover: boolean;
  uploadedAt: string;
  s3Key?: string;
}

const PROPERTIES_FILE = path.join(__dirname, '../../data/properties.json');

class PropertyService {
  private async loadProperties(): Promise<Property[]> {
    try {
      const data = await fs.readFile(PROPERTIES_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading properties:', error);
      return [];
    }
  }

  private async saveProperties(properties: Property[]): Promise<void> {
    try {
      await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
    } catch (error) {
      console.error('Error saving properties:', error);
      throw error;
    }
  }

  async getAllProperties(): Promise<Property[]> {
    return this.loadProperties();
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const properties = await this.loadProperties();
    return properties.find(p => p.id === id) || null;
  }

  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    const properties = await this.loadProperties();
    const newProperty: Property = {
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
      referringAgent: propertyData.referringAgent || {name: '', commission: 0},
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

  async updateProperty(id: string, updateData: Partial<Property>): Promise<Property | null> {
    const properties = await this.loadProperties();
    const index = properties.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    properties[index] = { ...properties[index], ...updateData };
    await this.saveProperties(properties);
    return properties[index];
  }

  async deleteProperty(id: string): Promise<boolean> {
    const properties = await this.loadProperties();
    const index = properties.findIndex(p => p.id === id);
    
    if (index === -1) return false;

    // Delete all photos from S3 before deleting property
    const property = properties[index];
    if (property.photos) {
      for (const photo of property.photos) {
        if (photo.s3Key) {
          await s3Service.deleteFile(photo.s3Key);
        }
      }
    }

    properties.splice(index, 1);
    await this.saveProperties(properties);
    return true;
  }

  async getPhotos(propertyId: string): Promise<Photo[]> {
    const property = await this.getPropertyById(propertyId);
    return property?.photos || [];
  }

  async uploadPhotos(propertyId: string, files: Express.Multer.File[]): Promise<Photo[]> {
    const property = await this.getPropertyById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const uploadedPhotos: Photo[] = [];

    for (const file of files) {
      try {
        // Upload to S3
        const uploadResult = await s3Service.uploadFile(file, `properties/${propertyId}/photos`);
        
        if (!uploadResult.success) {
          console.error('Failed to upload file to S3:', uploadResult.error);
          continue;
        }

        const photo: Photo = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: uploadResult.url,
          name: file.originalname,
          size: file.size,
          isCover: false,
          uploadedAt: new Date().toISOString(),
          s3Key: uploadResult.key
        };

        uploadedPhotos.push(photo);
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    }

    // Update property with new photos
    const updatedPhotos = [...(property.photos || []), ...uploadedPhotos];
    await this.updateProperty(propertyId, { photos: updatedPhotos });

    return uploadedPhotos;
  }

  async setCoverPhoto(propertyId: string, photoId: string): Promise<Photo[]> {
    const property = await this.getPropertyById(propertyId);
    if (!property || !property.photos) {
      throw new Error('Property or photos not found');
    }

    // Update all photos to set isCover to false, then set the selected one to true
    const updatedPhotos = property.photos.map(photo => ({
      ...photo,
      isCover: photo.id === photoId
    }));

    await this.updateProperty(propertyId, { photos: updatedPhotos });
    return updatedPhotos;
  }

  async deletePhoto(propertyId: string, photoId: string): Promise<Photo[]> {
    const property = await this.getPropertyById(propertyId);
    if (!property || !property.photos) {
      throw new Error('Property or photos not found');
    }

    const photoToDelete = property.photos.find(p => p.id === photoId);
    if (!photoToDelete) {
      throw new Error('Photo not found');
    }

    // Delete from S3
    if (photoToDelete.s3Key) {
      await s3Service.deleteFile(photoToDelete.s3Key);
    }

    // Remove from property photos
    const updatedPhotos = property.photos.filter(p => p.id !== photoId);
    
    // If we deleted the cover photo, set the first remaining photo as cover
    if (photoToDelete.isCover && updatedPhotos.length > 0) {
      updatedPhotos[0].isCover = true;
    }

    await this.updateProperty(propertyId, { photos: updatedPhotos });
    return updatedPhotos;
  }
}

export const propertyService = new PropertyService();
