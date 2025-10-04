const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const s3Service = require('./s3-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Properties data file
const PROPERTIES_FILE = path.join(__dirname, 'data/properties.json');

// Helper functions
async function loadProperties() {
  try {
    const data = await fs.readFile(PROPERTIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading properties:', error);
    return [];
  }
}

async function saveProperties(properties) {
  try {
    await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
  } catch (error) {
    console.error('Error saving properties:', error);
    throw error;
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Photo server is running' });
});

// Get photos for property
app.get('/properties/:id/photos', async (req, res) => {
  try {
    const { id } = req.params;
    const properties = await loadProperties();
    const property = properties.find(p => p.id === id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property.photos || [],
      message: 'Photos retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting photos:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload photos for property
app.post('/properties/:id/photos/upload', upload.array('photos', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const properties = await loadProperties();
    const propertyIndex = properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      try {
        // Upload to S3
        const uploadResult = await s3Service.uploadFile(file, `properties/${id}/photos`);
        
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
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    }

    // Update property with new photos
    if (!properties[propertyIndex].photos) {
      properties[propertyIndex].photos = [];
    }
    properties[propertyIndex].photos = [...properties[propertyIndex].photos, ...uploadedPhotos];
    
    await saveProperties(properties);

    res.status(201).json({
      success: true,
      data: uploadedPhotos,
      message: `Successfully uploaded ${uploadedPhotos.length} photos`
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Set cover photo
app.post('/properties/:id/photos/:photoId/cover', async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const properties = await loadProperties();
    const propertyIndex = properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const property = properties[propertyIndex];
    if (!property.photos) {
      return res.status(404).json({
        success: false,
        message: 'No photos found for property'
      });
    }

    // Update all photos to set isCover to false, then set the selected one to true
    const updatedPhotos = property.photos.map(photo => ({
      ...photo,
      isCover: photo.id === photoId
    }));

    properties[propertyIndex].photos = updatedPhotos;
    await saveProperties(properties);

    res.json({
      success: true,
      data: updatedPhotos,
      message: 'Cover photo set successfully'
    });
  } catch (error) {
    console.error('Error setting cover photo:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete photo
app.delete('/properties/:id/photos/:photoId', async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const properties = await loadProperties();
    const propertyIndex = properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const property = properties[propertyIndex];
    if (!property.photos) {
      return res.status(404).json({
        success: false,
        message: 'No photos found for property'
      });
    }

    const photoToDelete = property.photos.find(p => p.id === photoId);
    if (!photoToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
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

    properties[propertyIndex].photos = updatedPhotos;
    await saveProperties(properties);

    res.json({
      success: true,
      data: updatedPhotos,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Photo server running on port ${PORT}`);
  console.log(`📦 S3 Bucket: ${s3Service.config.bucket}`);
  console.log(`🌍 S3 Region: ${s3Service.config.region}`);
});
