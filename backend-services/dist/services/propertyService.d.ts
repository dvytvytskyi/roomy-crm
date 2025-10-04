interface Property {
    id: string;
    name: string;
    nickname?: string;
    status: string;
    type: string;
    location: string;
    address: string;
    size: number;
    beds: Array<{
        type: string;
        count: number;
    }>;
    parkingSlots: number;
    agencyFee: number;
    dtcmLicenseExpiry: string;
    referringAgent: {
        name: string;
        commission: number;
    };
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
declare class PropertyService {
    private loadProperties;
    private saveProperties;
    getAllProperties(): Promise<Property[]>;
    getPropertyById(id: string): Promise<Property | null>;
    createProperty(propertyData: Partial<Property>): Promise<Property>;
    updateProperty(id: string, updateData: Partial<Property>): Promise<Property | null>;
    deleteProperty(id: string): Promise<boolean>;
    getPhotos(propertyId: string): Promise<Photo[]>;
    uploadPhotos(propertyId: string, files: Express.Multer.File[]): Promise<Photo[]>;
    setCoverPhoto(propertyId: string, photoId: string): Promise<Photo[]>;
    deletePhoto(propertyId: string, photoId: string): Promise<Photo[]>;
}
export declare const propertyService: PropertyService;
export {};
//# sourceMappingURL=propertyService.d.ts.map