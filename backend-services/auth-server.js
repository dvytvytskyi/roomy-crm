const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const s3Service = require('./s3-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Data files
const USERS_FILE = path.join(__dirname, 'data/users.json');
const PROPERTIES_FILE = path.join(__dirname, 'data/properties.json');

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

// Helper functions
async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

async function saveUsers(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
}

// Initialize default admin users if users file doesn't exist
async function initializeUsers() {
  try {
    await fs.access(USERS_FILE);
    // File exists, check if we need to add admin2@roomy.com
    const users = await loadUsers();
    const hasAdmin2 = users.find(u => u.email === 'admin2@roomy.com');
    if (!hasAdmin2) {
      users.push({
        id: '2',
        email: 'admin2@roomy.com',
        password: 'admin123',
        name: 'Admin User 2',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      await saveUsers(users);
      console.log('✅ Added admin2@roomy.com / admin123');
    }
  } catch (error) {
    // File doesn't exist, create default admin users
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@roomy.com',
        password: 'admin123', // In production, this should be hashed
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'admin2@roomy.com',
        password: 'admin123',
        name: 'Admin User 2',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];
    await saveUsers(defaultUsers);
    console.log('✅ Created default admin users: admin@roomy.com / admin123 and admin2@roomy.com / admin123');
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth server is running',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const users = await loadUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    const users = await loadUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this password
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    // Create JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        },
        token
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    },
    message: 'Profile retrieved successfully'
  });
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const users = await loadUsers();
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      data: safeUsers,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Photo endpoints
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

// Helper functions for properties
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
async function startServer() {
  try {
    // Initialize default users
    await initializeUsers();
    
    app.listen(PORT, () => {
      console.log(`🚀 Auth server running on port ${PORT}`);
      console.log(`📧 Available admins: admin@roomy.com / admin123 and admin2@roomy.com / admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
