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

// Password utilities
const { hashPassword, comparePassword, validatePasswordStrength } = require('./utils/passwordUtils');

// Logger
const logger = require('./utils/logger');

// Rate limiting
const { generalLimiter, authLimiter, speedLimiter } = require('./middleware/rateLimiter');

// Apply rate limiting
app.use(generalLimiter);
app.use(speedLimiter);

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is required');
  process.exit(1);
}

// Data files
const USERS_FILE = path.join(__dirname, 'data/users.json');
const PROPERTIES_FILE = path.join(__dirname, 'data/properties.json');
const RESERVATIONS_FILE = path.join(__dirname, 'data/reservations.json');

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

async function loadOwners() {
  try {
    const OWNERS_FILE = path.join(__dirname, 'data/owners.json');
    const data = await fs.readFile(OWNERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading owners:', error);
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
      const hashedPassword = await hashPassword('admin123');
      users.push({
        id: '2',
        email: 'admin2@roomy.com',
        password: hashedPassword,
        name: 'Admin User 2',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      await saveUsers(users);
      logger.info('Added admin2@roomy.com with hashed password');
    }
  } catch (error) {
    // File doesn't exist, create default admin users
    const hashedPassword = await hashPassword('admin123');
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@roomy.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'admin2@roomy.com',
        password: hashedPassword,
        name: 'Admin User 2',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];
    await saveUsers(defaultUsers);
    logger.info('Created default admin users with hashed passwords: admin@roomy.com and admin2@roomy.com');
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
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const users = await loadUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password using bcrypt
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
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
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register endpoint
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
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

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
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

// Get all owners
app.get('/api/users/owners', async (req, res) => {
  try {
    const owners = await loadOwners();
    res.json({
      success: true,
      data: owners,
      total: owners.length,
      message: 'Owners retrieved successfully'
    });
  } catch (error) {
    console.error('Error loading owners:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific owner
app.get('/api/users/owners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const owners = await loadOwners();
    const owner = owners.find(o => o.id === id);
    
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }
    
    res.json({
      success: true,
      data: owner,
      message: 'Owner retrieved successfully'
    });
  } catch (error) {
    console.error('Error loading owner:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Properties endpoints
// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await loadProperties();
    res.json({
      success: true,
      data: properties,
      total: properties.length,
      message: 'Properties retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting properties:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get property by ID
app.get('/api/properties/:id', async (req, res) => {
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
      data: property,
      message: 'Property retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting property:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new property
app.post('/api/properties', async (req, res) => {
  try {
    const propertyData = req.body;
    const properties = await loadProperties();
    
    const newProperty = {
      id: `prop_${Date.now()}`,
      ...propertyData,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString()
    };

    properties.push(newProperty);
    await saveProperties(properties);

    res.status(201).json({
      success: true,
      data: newProperty,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update property
app.put('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const properties = await loadProperties();
    const propertyIndex = properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    properties[propertyIndex] = {
      ...properties[propertyIndex],
      ...updateData,
      lastModifiedAt: new Date().toISOString()
    };

    await saveProperties(properties);

    res.json({
      success: true,
      data: properties[propertyIndex],
      message: 'Property updated successfully'
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const properties = await loadProperties();
    const propertyIndex = properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    properties.splice(propertyIndex, 1);
    await saveProperties(properties);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
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

// Load and save functions for reservations
async function loadReservations() {
  try {
    const data = await fs.readFile(RESERVATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Reservations file not found, returning empty array');
    return [];
  }
}

async function saveReservations(reservations) {
  try {
    await fs.writeFile(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
  } catch (error) {
    console.error('Error saving reservations:', error);
    throw error;
  }
}

// Initialize default properties if properties file doesn't exist
async function initializeProperties() {
  try {
    await fs.access(PROPERTIES_FILE);
  } catch (error) {
    // File doesn't exist, create default properties
    const defaultProperties = [
      {
        id: 'prop_1',
        name: 'Luxury Apartment Downtown Dubai',
        type: 'APARTMENT',
        address: '57QG+GF9 - Burj Khalifa Blvd',
        city: 'Dubai',
        country: 'UAE',
        capacity: 4,
        bedrooms: 2,
        bathrooms: 2,
        area: 120,
        pricePerNight: 460,
        description: 'Luxury apartment in the heart of Dubai with stunning city views',
        amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
        primaryImage: '',
        agentId: 1,
        agentName: 'John Smith',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString()
      }
    ];
    await saveProperties(defaultProperties);
    console.log('✅ Created default properties');
  }
}

// Initialize default reservations if reservations file doesn't exist
async function initializeReservations() {
  try {
    await fs.access(RESERVATIONS_FILE);
  } catch (error) {
    // File doesn't exist, create default reservations
    const defaultReservations = [
      {
        id: 'res_1',
        propertyId: 'prop_1',
        propertyName: 'Luxury Apartment Downtown Dubai',
        propertyType: 'APARTMENT',
        propertyAddress: '57QG+GF9 - Burj Khalifa Blvd',
        propertyCity: 'Dubai',
        guestId: 'guest_1',
        guestName: 'John Smith',
        guestEmail: 'john@example.com',
        guestPhone: '+971501234567',
        guestWhatsapp: '+971501234567',
        checkIn: '2024-01-15T00:00:00.000Z',
        checkOut: '2024-01-18T00:00:00.000Z',
        status: 'CONFIRMED',
        paymentStatus: 'FULLY_PAID',
        guestStatus: 'CHECKED_OUT',
        source: 'AIRBNB',
        totalAmount: 1200,
        paidAmount: 1200,
        outstandingBalance: 0,
        nights: 3,
        guests: 2,
        guestCount: 2,
        specialRequests: 'Early check-in requested',
        createdAt: '2024-01-10T10:00:00.000Z',
        updatedAt: '2024-01-18T12:00:00.000Z',
        notesList: [
          {
            id: 1,
            content: 'Guest requested early check-in',
            type: 'special_request',
            priority: 'medium',
            createdAt: '2024-01-10T10:00:00.000Z',
            createdBy: 'System'
          }
        ],
        payments: [
          {
            id: 1,
            amount: 1200,
            method: 'credit_card',
            date: '2024-01-10',
            reference: 'PAY_001',
            description: 'Full payment',
            type: 'payment',
            status: 'completed',
            createdAt: '2024-01-10T10:00:00.000Z'
          }
        ],
        pricingHistory: [
          {
            id: 1,
            pricePerNight: 400,
            totalAmount: 1200,
            reason: 'Initial booking',
            date: '2024-01-10',
            changedBy: 'System'
          }
        ],
        communicationHistory: [
          {
            id: 1,
            type: 'email',
            subject: 'Booking Confirmation',
            content: 'Thank you for your booking',
            date: '2024-01-10T10:00:00.000Z',
            status: 'sent',
            sentBy: 'System'
          }
        ],
        adjustments: [],
        transactions: []
      },
      {
        id: 'res_2',
        propertyId: 'prop_1',
        propertyName: 'Luxury Apartment Downtown Dubai',
        propertyType: 'APARTMENT',
        propertyAddress: '57QG+GF9 - Burj Khalifa Blvd',
        propertyCity: 'Dubai',
        guestId: 'guest_2',
        guestName: 'Sarah Johnson',
        guestEmail: 'sarah@example.com',
        guestPhone: '+971507654321',
        guestWhatsapp: '+971507654321',
        checkIn: '2024-01-20T00:00:00.000Z',
        checkOut: '2024-01-25T00:00:00.000Z',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        guestStatus: 'UPCOMING',
        source: 'BOOKING_COM',
        totalAmount: 2500,
        paidAmount: 0,
        outstandingBalance: 2500,
        nights: 5,
        guests: 4,
        guestCount: 4,
        specialRequests: 'Late checkout requested',
        createdAt: '2024-01-12T14:30:00.000Z',
        updatedAt: '2024-01-12T14:30:00.000Z',
        notesList: [
          {
            id: 2,
            content: 'Guest requested late checkout',
            type: 'special_request',
            priority: 'low',
            createdAt: '2024-01-12T14:30:00.000Z',
            createdBy: 'System'
          }
        ],
        payments: [],
        pricingHistory: [
          {
            id: 2,
            pricePerNight: 500,
            totalAmount: 2500,
            reason: 'Initial booking',
            date: '2024-01-12',
            changedBy: 'System'
          }
        ],
        communicationHistory: [
          {
            id: 2,
            type: 'email',
            subject: 'Booking Request',
            content: 'Your booking request has been received',
            date: '2024-01-12T14:30:00.000Z',
            status: 'sent',
            sentBy: 'System'
          }
        ],
        adjustments: [],
        transactions: []
      },
      {
        id: 'res_3',
        propertyId: 'prop_1',
        propertyName: 'Luxury Apartment Downtown Dubai',
        propertyType: 'APARTMENT',
        propertyAddress: '57QG+GF9 - Burj Khalifa Blvd',
        propertyCity: 'Dubai',
        guestId: 'guest_3',
        guestName: 'Ahmed Al-Rashid',
        guestEmail: 'ahmed@example.com',
        guestPhone: '+971509876543',
        guestWhatsapp: '+971509876543',
        checkIn: '2024-01-25T00:00:00.000Z',
        checkOut: '2024-01-27T00:00:00.000Z',
        status: 'COMPLETED',
        paymentStatus: 'FULLY_PAID',
        guestStatus: 'CHECKED_OUT',
        source: 'DIRECT',
        totalAmount: 800,
        paidAmount: 800,
        outstandingBalance: 0,
        nights: 2,
        guests: 1,
        guestCount: 1,
        specialRequests: 'Business trip',
        createdAt: '2024-01-08T09:15:00.000Z',
        updatedAt: '2024-01-27T12:00:00.000Z',
        notesList: [
          {
            id: 3,
            content: 'Business trip - professional guest',
            type: 'internal',
            priority: 'normal',
            createdAt: '2024-01-08T09:15:00.000Z',
            createdBy: 'Admin'
          }
        ],
        payments: [
          {
            id: 3,
            amount: 800,
            method: 'bank_transfer',
            date: '2024-01-08',
            reference: 'PAY_003',
            description: 'Full payment',
            type: 'payment',
            status: 'completed',
            createdAt: '2024-01-08T09:15:00.000Z'
          }
        ],
        pricingHistory: [
          {
            id: 3,
            pricePerNight: 400,
            totalAmount: 800,
            reason: 'Initial booking',
            date: '2024-01-08',
            changedBy: 'System'
          }
        ],
        communicationHistory: [
          {
            id: 3,
            type: 'email',
            subject: 'Booking Confirmation',
            content: 'Thank you for your booking',
            date: '2024-01-08T09:15:00.000Z',
            status: 'sent',
            sentBy: 'System'
          },
          {
            id: 4,
            type: 'email',
            subject: 'Check-out Instructions',
            content: 'Thank you for staying with us',
            date: '2024-01-27T12:00:00.000Z',
            status: 'sent',
            sentBy: 'System'
          }
        ],
        adjustments: [],
        transactions: []
      }
    ];
    await saveReservations(defaultReservations);
    console.log('✅ Created default reservations');
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

// Reservations routes
app.get('/api/reservations', authenticateToken, async (req, res) => {
  try {
    console.log('📅 GET /api/reservations - Fetching reservations');
    const reservations = await loadReservations();
    res.json({
      success: true,
      data: reservations,
      message: 'Reservations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations'
    });
  }
});

app.get('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📅 GET /api/reservations/${id} - Fetching reservation by ID`);
    
    const reservations = await loadReservations();
    const reservation = reservations.find(r => r.id === id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    res.json({
      success: true,
      data: reservation,
      message: 'Reservation retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservation'
    });
  }
});

// Analytics routes
app.get('/api/analytics/overview', authenticateToken, async (req, res) => {
  try {
    console.log('📊 GET /api/analytics/overview - Fetching analytics overview');
    
    // Mock analytics data
    const analyticsData = {
      totalRevenue: 45000,
      totalExpenses: 18000,
      netProfit: 27000,
      occupancyRate: 78.5,
      totalUnits: 12,
      activeReservations: 8,
      averageStayDuration: 3.2,
      revenueGrowth: 15.3,
      expenseGrowth: 8.7,
      profitGrowth: 22.1,
      occupancyGrowth: 5.2
    };
    
    res.json({
      success: true,
      data: analyticsData,
      message: 'Analytics overview retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview'
    });
  }
});

app.get('/api/analytics/financials', authenticateToken, async (req, res) => {
  try {
    console.log('💰 GET /api/analytics/financials - Fetching financial analytics');
    
    // Mock financial analytics data
    const financialData = {
      revenue: {
        total: 45000,
        byUnit: [
          { unit: 'Luxury Apartment Downtown Dubai', revenue: 12000, percentage: 26.7 },
          { unit: 'Beach Villa Palm Jumeirah', revenue: 15000, percentage: 33.3 },
          { unit: 'Business Bay Office', revenue: 18000, percentage: 40.0 }
        ],
        bySource: [
          { source: 'Airbnb', revenue: 18000, percentage: 40.0 },
          { source: 'Booking.com', revenue: 13500, percentage: 30.0 },
          { source: 'Direct', revenue: 9000, percentage: 20.0 },
          { source: 'VRBO', revenue: 4500, percentage: 10.0 }
        ],
        trends: [
          { month: 'Jan', revenue: 38000 },
          { month: 'Feb', revenue: 42000 },
          { month: 'Mar', revenue: 45000 }
        ]
      },
      expenses: {
        total: 18000,
        categories: [
          { category: 'Maintenance', amount: 7200, percentage: 40.0 },
          { category: 'Cleaning', amount: 5400, percentage: 30.0 },
          { category: 'Utilities', amount: 3600, percentage: 20.0 },
          { category: 'Marketing', amount: 1800, percentage: 10.0 }
        ],
        byUnit: [
          { unit: 'Luxury Apartment Downtown Dubai', expenses: 6000 },
          { unit: 'Beach Villa Palm Jumeirah', expenses: 7500 },
          { unit: 'Business Bay Office', expenses: 4500 }
        ]
      },
      profit: {
        net: 27000,
        byUnit: [
          { unit: 'Luxury Apartment Downtown Dubai', profit: 6000, margin: 50.0 },
          { unit: 'Beach Villa Palm Jumeirah', profit: 7500, margin: 50.0 },
          { unit: 'Business Bay Office', profit: 13500, margin: 75.0 }
        ]
      }
    };
    
    res.json({
      success: true,
      data: financialData,
      message: 'Financial analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial analytics'
    });
  }
});

app.get('/api/analytics/units', authenticateToken, async (req, res) => {
  try {
    console.log('🏠 GET /api/analytics/units - Fetching units analytics');
    
    // Mock units analytics data
    const unitsData = {
      performance: [
        {
          unit: 'Luxury Apartment Downtown Dubai',
          revenue: 12000,
          expenses: 6000,
          profit: 6000,
          occupancyRate: 85.0,
          revenuePerNight: 400,
          totalNights: 30,
          avgStayDuration: 3.5
        },
        {
          unit: 'Beach Villa Palm Jumeirah',
          revenue: 15000,
          expenses: 7500,
          profit: 7500,
          occupancyRate: 72.0,
          revenuePerNight: 500,
          totalNights: 30,
          avgStayDuration: 2.8
        },
        {
          unit: 'Business Bay Office',
          revenue: 18000,
          expenses: 4500,
          profit: 13500,
          occupancyRate: 78.0,
          revenuePerNight: 600,
          totalNights: 30,
          avgStayDuration: 3.2
        }
      ]
    };
    
    res.json({
      success: true,
      data: unitsData,
      message: 'Units analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching units analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch units analytics'
    });
  }
});

app.get('/api/analytics/owners', authenticateToken, async (req, res) => {
  try {
    console.log('👤 GET /api/analytics/owners - Fetching owners analytics');
    
    // Mock owners analytics data
    const ownersData = {
      profitability: [
        {
          owner: 'John Smith',
          units: ['Luxury Apartment Downtown Dubai'],
          totalRevenue: 12000,
          totalExpenses: 6000,
          netProfit: 6000,
          profitMargin: 50.0,
          unitsCount: 1,
          avgRevenuePerUnit: 12000
        },
        {
          owner: 'Sarah Johnson',
          units: ['Beach Villa Palm Jumeirah'],
          totalRevenue: 15000,
          totalExpenses: 7500,
          netProfit: 7500,
          profitMargin: 50.0,
          unitsCount: 1,
          avgRevenuePerUnit: 15000
        },
        {
          owner: 'Ahmed Al-Rashid',
          units: ['Business Bay Office'],
          totalRevenue: 18000,
          totalExpenses: 4500,
          netProfit: 13500,
          profitMargin: 75.0,
          unitsCount: 1,
          avgRevenuePerUnit: 18000
        }
      ]
    };
    
    res.json({
      success: true,
      data: ownersData,
      message: 'Owners analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching owners analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owners analytics'
    });
  }
});

app.get('/api/analytics/reservations', authenticateToken, async (req, res) => {
  try {
    console.log('📅 GET /api/analytics/reservations - Fetching reservations analytics');
    
    // Mock reservations analytics data
    const reservationsData = {
      trends: {
        monthly: [
          { month: 'Jan', reservations: 25, cancellations: 3, net: 22 },
          { month: 'Feb', reservations: 28, cancellations: 2, net: 26 },
          { month: 'Mar', reservations: 32, cancellations: 4, net: 28 }
        ]
      },
      status: {
        confirmed: 18,
        pending: 4,
        cancelled: 3,
        completed: 25,
        total: 50,
        cancellationRate: 6.0,
        confirmationRate: 94.0
      }
    };
    
    res.json({
      success: true,
      data: reservationsData,
      message: 'Reservations analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching reservations analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations analytics'
    });
  }
});

app.get('/api/analytics/agents', authenticateToken, async (req, res) => {
  try {
    console.log('👥 GET /api/analytics/agents - Fetching agents analytics');
    
    // Mock agents analytics data
    const agentsData = {
      performance: [
        {
          agent: 'John Smith',
          unitsReferred: 3,
          totalRevenue: 36000,
          totalPayouts: 3600,
          commissionRate: 10.0,
          avgRevenuePerUnit: 12000,
          lastReferral: '2024-01-15',
          status: 'active'
        },
        {
          agent: 'Sarah Johnson',
          unitsReferred: 2,
          totalRevenue: 24000,
          totalPayouts: 2400,
          commissionRate: 10.0,
          avgRevenuePerUnit: 12000,
          lastReferral: '2024-01-10',
          status: 'active'
        },
        {
          agent: 'Mike Wilson',
          unitsReferred: 1,
          totalRevenue: 12000,
          totalPayouts: 1200,
          commissionRate: 10.0,
          avgRevenuePerUnit: 12000,
          lastReferral: '2024-01-05',
          status: 'inactive'
        }
      ]
    };
    
    res.json({
      success: true,
      data: agentsData,
      message: 'Agents analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching agents analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents analytics'
    });
  }
});

app.get('/api/analytics/reports', authenticateToken, async (req, res) => {
  try {
    console.log('📋 GET /api/analytics/reports - Fetching reports');
    
    // Mock reports data
    const reportsData = [
      {
        id: 1,
        name: 'Monthly Revenue Report',
        description: 'Comprehensive monthly revenue analysis',
        type: 'revenue',
        lastGenerated: '2024-01-01',
        frequency: 'monthly',
        recipients: ['admin@roomy.com', 'finance@roomy.com']
      },
      {
        id: 2,
        name: 'Property Performance Report',
        description: 'Individual property performance metrics',
        type: 'performance',
        lastGenerated: '2024-01-01',
        frequency: 'weekly',
        recipients: ['admin@roomy.com']
      },
      {
        id: 3,
        name: 'Owner Payout Report',
        description: 'Monthly owner payout calculations',
        type: 'payouts',
        lastGenerated: '2024-01-01',
        frequency: 'monthly',
        recipients: ['admin@roomy.com', 'accounting@roomy.com']
      }
    ];
    
    res.json({
      success: true,
      data: reportsData,
      message: 'Reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// Cleaning routes
app.get('/api/cleaning', authenticateToken, async (req, res) => {
  try {
    console.log('🧹 GET /api/cleaning - Fetching cleaning tasks');
    
    // Mock cleaning tasks data
    const cleaningTasks = [
      {
        id: 1,
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        type: 'Deep Clean',
        status: 'Completed',
        scheduledDate: '2024-01-15',
        scheduledTime: '10:00',
        duration: '3 hours',
        cleaner: 'Clean Pro Services',
        cleanerId: 'cleaner_1',
        cost: 150,
        notes: 'Post-checkout cleaning after guest departure',
        createdAt: '2024-01-15T08:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-15T13:00:00.000Z',
        lastModifiedBy: 'cleaner_1',
        includesLaundry: true,
        laundryCount: 12,
        linenComments: 'Bed sheets and towels need special care due to guest allergies',
        comments: [
          {
            id: 1,
            author: 'Clean Pro Services',
            date: '2024-01-15T10:30:00.000Z',
            text: 'Started deep cleaning - all surfaces sanitized',
            type: 'cleaner'
          },
          {
            id: 2,
            author: 'Clean Pro Services',
            date: '2024-01-15T13:00:00.000Z',
            text: 'Deep cleaning completed successfully. All checklist items done.',
            type: 'completion'
          }
        ],
        checklist: [
          {
            id: 1,
            item: 'Kitchen appliances cleaned',
            completed: true
          },
          {
            id: 2,
            item: 'Bathroom sanitized',
            completed: true
          },
          {
            id: 3,
            item: 'Carpet cleaning',
            completed: true
          },
          {
            id: 4,
            item: 'Bed linens changed',
            completed: true
          },
          {
            id: 5,
            item: 'Towels replaced',
            completed: true
          },
          {
            id: 6,
            item: 'Windows cleaned',
            completed: true
          }
        ],
        staticChecklist: [true, true, true, true, true, true]
      },
      {
        id: 2,
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        type: 'Regular Clean',
        status: 'Scheduled',
        scheduledDate: '2024-01-16',
        scheduledTime: '14:00',
        duration: '2 hours',
        cleaner: 'Sparkle Clean',
        cleanerId: 'cleaner_2',
        cost: 80,
        notes: 'Weekly maintenance cleaning',
        createdAt: '2024-01-15T09:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-15T09:00:00.000Z',
        lastModifiedBy: 'admin@roomy.com',
        includesLaundry: false,
        laundryCount: 0,
        linenComments: '',
        comments: [],
        checklist: [],
        staticChecklist: [false, false, false, false, false, false]
      },
      {
        id: 3,
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        type: 'Deep Clean',
        status: 'Scheduled',
        scheduledDate: '2024-01-17',
        scheduledTime: '09:00',
        duration: '4 hours',
        cleaner: 'Clean Pro Services',
        cleanerId: 'cleaner_1',
        cost: 200,
        notes: 'Pre-arrival deep cleaning for new guest',
        createdAt: '2024-01-16T10:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-16T10:00:00.000Z',
        lastModifiedBy: 'admin@roomy.com',
        includesLaundry: true,
        laundryCount: 8,
        linenComments: 'Standard cleaning for new guest arrival',
        comments: [],
        checklist: [],
        staticChecklist: [false, false, false, false, false, false]
      },
      {
        id: 4,
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        type: 'Regular Clean',
        status: 'Scheduled',
        scheduledDate: '2024-01-18',
        scheduledTime: '11:30',
        duration: '2.5 hours',
        cleaner: 'Sparkle Clean',
        cleanerId: 'cleaner_2',
        cost: 100,
        notes: 'Mid-stay cleaning for long-term guest',
        createdAt: '2024-01-17T08:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-17T08:00:00.000Z',
        lastModifiedBy: 'admin@roomy.com',
        includesLaundry: false,
        laundryCount: 0,
        linenComments: '',
        comments: [],
        checklist: [],
        staticChecklist: [false, false, false, false, false, false]
      },
      {
        id: 5,
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        type: 'Office Clean',
        status: 'Completed',
        scheduledDate: '2024-01-14',
        scheduledTime: '16:00',
        duration: '2 hours',
        cleaner: 'Professional Cleaners',
        cleanerId: 'cleaner_3',
        cost: 120,
        notes: 'End of week office cleaning',
        createdAt: '2024-01-14T15:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-14T18:00:00.000Z',
        lastModifiedBy: 'cleaner_3',
        includesLaundry: false,
        laundryCount: 0,
        linenComments: '',
        comments: [
          {
            id: 3,
            author: 'Professional Cleaners',
            date: '2024-01-14T16:15:00.000Z',
            text: 'Office cleaning in progress',
            type: 'cleaner'
          },
          {
            id: 4,
            author: 'Professional Cleaners',
            date: '2024-01-14T18:00:00.000Z',
            text: 'Office cleaning completed. All areas sanitized.',
            type: 'completion'
          }
        ],
        checklist: [
          {
            id: 7,
            item: 'Desks cleaned and organized',
            completed: true
          },
          {
            id: 8,
            item: 'Trash bins emptied',
            completed: true
          },
          {
            id: 9,
            item: 'Floors vacuumed and mopped',
            completed: true
          },
          {
            id: 10,
            item: 'Windows cleaned',
            completed: true
          }
        ],
        staticChecklist: [true, true, true, true, true, true]
      }
    ];
    
    res.json({
      success: true,
      data: cleaningTasks,
      total: cleaningTasks.length,
      page: 1,
      limit: 50,
      message: 'Cleaning tasks retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching cleaning tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cleaning tasks'
    });
  }
});

app.get('/api/cleaning/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 GET /api/cleaning/stats - Fetching cleaning statistics');
    
    // Mock cleaning stats data
    const statsData = {
      totalTasks: 15,
      scheduledTasks: 8,
      completedTasks: 6,
      cancelledTasks: 1
    };
    
    res.json({
      success: true,
      data: statsData,
      message: 'Cleaning statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching cleaning stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cleaning statistics'
    });
  }
});

app.get('/api/cleaning/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🧹 GET /api/cleaning/${id} - Fetching cleaning task by ID`);
    
    // Mock detailed cleaning task data
    const taskData = {
      id: parseInt(id),
      unit: 'Luxury Apartment Downtown Dubai',
      unitId: 'prop_1',
      type: 'Deep Clean',
      status: 'Completed',
      scheduledDate: '2024-01-15',
      scheduledTime: '10:00',
      duration: '3 hours',
      cleaner: 'Clean Pro Services',
      cleanerId: 'cleaner_1',
      cost: 150,
      notes: 'Post-checkout cleaning after guest departure. Guest had allergies, so extra attention to bedding and air quality.',
      createdAt: '2024-01-15T08:00:00.000Z',
      createdBy: 'admin@roomy.com',
      lastModifiedAt: '2024-01-15T13:00:00.000Z',
      lastModifiedBy: 'cleaner_1',
      includesLaundry: true,
      laundryCount: 12,
      linenComments: 'Bed sheets and towels need special care due to guest allergies. Use hypoallergenic detergent.',
      comments: [
        {
          id: 1,
          author: 'Clean Pro Services',
          date: '2024-01-15T10:30:00.000Z',
          text: 'Started deep cleaning - all surfaces sanitized with eco-friendly products',
          type: 'cleaner'
        },
        {
          id: 2,
          author: 'Clean Pro Services',
          date: '2024-01-15T11:15:00.000Z',
          text: 'Kitchen and bathroom deep cleaning completed. Moving to bedroom area.',
          type: 'cleaner'
        },
        {
          id: 3,
          author: 'Clean Pro Services',
          date: '2024-01-15T13:00:00.000Z',
          text: 'Deep cleaning completed successfully. All checklist items done. Special attention paid to allergen removal.',
          type: 'completion'
        }
      ],
      checklist: [
        {
          id: 1,
          item: 'Kitchen appliances cleaned',
          completed: true
        },
        {
          id: 2,
          item: 'Bathroom sanitized',
          completed: true
        },
        {
          id: 3,
          item: 'Carpet cleaning',
          completed: true
        },
        {
          id: 4,
          item: 'Bed linens changed',
          completed: true
        },
        {
          id: 5,
          item: 'Towels replaced',
          completed: true
        },
        {
          id: 6,
          item: 'Windows cleaned',
          completed: true
        },
        {
          id: 7,
          item: 'Air vents cleaned',
          completed: true
        },
        {
          id: 8,
          item: 'Allergen removal treatment',
          completed: true
        }
      ],
      staticChecklist: [true, true, true, true, true, true]
    };
    
    res.json({
      success: true,
      data: taskData,
      message: 'Cleaning task retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching cleaning task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cleaning task'
    });
  }
});

app.get('/api/cleaning/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`💬 GET /api/cleaning/${id}/comments - Fetching cleaning comments`);
    
    // Mock comments data
    const commentsData = [
      {
        id: 1,
        author: 'Clean Pro Services',
        date: '2024-01-15T10:30:00.000Z',
        text: 'Started deep cleaning - all surfaces sanitized with eco-friendly products',
        type: 'cleaner'
      },
      {
        id: 2,
        author: 'Clean Pro Services',
        date: '2024-01-15T11:15:00.000Z',
        text: 'Kitchen and bathroom deep cleaning completed. Moving to bedroom area.',
        type: 'cleaner'
      },
      {
        id: 3,
        author: 'Clean Pro Services',
        date: '2024-01-15T13:00:00.000Z',
        text: 'Deep cleaning completed successfully. All checklist items done. Special attention paid to allergen removal.',
        type: 'completion'
      }
    ];
    
    res.json({
      success: true,
      data: commentsData,
      message: 'Cleaning comments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching cleaning comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cleaning comments'
    });
  }
});

app.get('/api/cleaning/:id/checklist', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✅ GET /api/cleaning/${id}/checklist - Fetching cleaning checklist`);
    
    // Mock checklist data
    const checklistData = {
      checklist: [
        {
          id: 1,
          item: 'Kitchen appliances cleaned',
          completed: true
        },
        {
          id: 2,
          item: 'Bathroom sanitized',
          completed: true
        },
        {
          id: 3,
          item: 'Carpet cleaning',
          completed: true
        },
        {
          id: 4,
          item: 'Bed linens changed',
          completed: true
        },
        {
          id: 5,
          item: 'Towels replaced',
          completed: true
        },
        {
          id: 6,
          item: 'Windows cleaned',
          completed: true
        },
        {
          id: 7,
          item: 'Air vents cleaned',
          completed: true
        },
        {
          id: 8,
          item: 'Allergen removal treatment',
          completed: true
        }
      ],
      staticChecklist: [true, true, true, true, true, true]
    };
    
    res.json({
      success: true,
      data: checklistData,
      message: 'Cleaning checklist retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching cleaning checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cleaning checklist'
    });
  }
});

// Maintenance routes
app.get('/api/maintenance', authenticateToken, async (req, res) => {
  try {
    console.log('🔧 GET /api/maintenance - Fetching maintenance tasks');
    
    // Mock maintenance tasks data
    const maintenanceTasks = [
      {
        id: 1,
        title: 'AC Unit Repair - Living Room',
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        technician: 'HVAC Solutions Dubai',
        technicianId: 'tech_1',
        status: 'Completed',
        priority: 'High',
        type: 'HVAC',
        scheduledDate: '2024-01-15',
        estimatedDuration: '2 hours',
        description: 'AC unit not cooling properly in living room. Guest reported issue.',
        cost: 250,
        notes: 'Replaced compressor and recharged refrigerant. System working normally now.',
        createdAt: '2024-01-15T08:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-15T14:00:00.000Z',
        lastModifiedBy: 'tech_1',
        category: 'HVAC',
        date: '2024-01-15',
        contractor: 'HVAC Solutions Dubai',
        inspector: 'Maintenance Supervisor',
        price: 250,
        comments: [
          {
            id: 1,
            author: 'HVAC Solutions Dubai',
            date: '2024-01-15T10:00:00.000Z',
            text: 'Diagnosed compressor issue. Replacing unit.',
            type: 'contractor'
          },
          {
            id: 2,
            author: 'HVAC Solutions Dubai',
            date: '2024-01-15T14:00:00.000Z',
            text: 'Repair completed successfully. System tested and working.',
            type: 'contractor'
          }
        ],
        attachments: [
          {
            id: 1,
            name: 'AC_Repair_Invoice.pdf',
            size: '245 KB',
            type: 'application/pdf'
          }
        ],
        beforePhotos: [
          {
            id: 1,
            name: 'AC_before_repair.jpg',
            size: '1.2 MB'
          }
        ],
        afterPhotos: [
          {
            id: 2,
            name: 'AC_after_repair.jpg',
            size: '1.1 MB'
          }
        ]
      },
      {
        id: 2,
        title: 'Kitchen Faucet Leak',
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        technician: 'PlumbPro UAE',
        technicianId: 'tech_2',
        status: 'Scheduled',
        priority: 'Normal',
        type: 'Plumbing',
        scheduledDate: '2024-01-16',
        estimatedDuration: '1 hour',
        description: 'Kitchen faucet has minor leak. Needs replacement cartridge.',
        cost: 80,
        notes: '',
        createdAt: '2024-01-15T16:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-15T16:00:00.000Z',
        lastModifiedBy: 'admin@roomy.com',
        category: 'Plumbing',
        date: '2024-01-16',
        contractor: 'PlumbPro UAE',
        inspector: '',
        price: 80,
        comments: [],
        attachments: [],
        beforePhotos: [],
        afterPhotos: []
      },
      {
        id: 3,
        title: 'Light Fixture Replacement',
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        technician: 'ElectricPro Services',
        technicianId: 'tech_3',
        status: 'In Progress',
        priority: 'Low',
        type: 'Electrical',
        scheduledDate: '2024-01-14',
        estimatedDuration: '1.5 hours',
        description: 'Bedroom light fixture flickering. Needs replacement.',
        cost: 120,
        notes: 'In progress - replacing fixture and checking wiring.',
        createdAt: '2024-01-14T09:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-15T11:00:00.000Z',
        lastModifiedBy: 'tech_3',
        category: 'Electrical',
        date: '2024-01-14',
        contractor: 'ElectricPro Services',
        inspector: '',
        price: 120,
        comments: [
          {
            id: 3,
            author: 'ElectricPro Services',
            date: '2024-01-15T11:00:00.000Z',
            text: 'Started work on light fixture. Found wiring issue.',
            type: 'contractor'
          }
        ],
        attachments: [],
        beforePhotos: [
          {
            id: 3,
            name: 'light_fixture_before.jpg',
            size: '980 KB'
          }
        ],
        afterPhotos: []
      },
      {
        id: 4,
        title: 'General Maintenance Check',
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        technician: 'Maintenance Team',
        technicianId: 'tech_4',
        status: 'Completed',
        priority: 'Low',
        type: 'Preventive',
        scheduledDate: '2024-01-10',
        estimatedDuration: '3 hours',
        description: 'Monthly preventive maintenance check of all systems.',
        cost: 150,
        notes: 'All systems checked and working properly. No issues found.',
        createdAt: '2024-01-10T08:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-10T16:00:00.000Z',
        lastModifiedBy: 'tech_4',
        category: 'Preventive',
        date: '2024-01-10',
        contractor: 'Maintenance Team',
        inspector: 'Quality Control',
        price: 150,
        comments: [
          {
            id: 4,
            author: 'Maintenance Team',
            date: '2024-01-10T16:00:00.000Z',
            text: 'Preventive maintenance completed. All systems operational.',
            type: 'inspection'
          }
        ],
        attachments: [
          {
            id: 2,
            name: 'Maintenance_Report_Jan2024.pdf',
            size: '512 KB',
            type: 'application/pdf'
          }
        ],
        beforePhotos: [],
        afterPhotos: []
      },
      {
        id: 5,
        title: 'Emergency Water Heater Repair',
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        technician: 'Emergency Plumbers',
        technicianId: 'tech_5',
        status: 'Completed',
        priority: 'Urgent',
        type: 'Emergency',
        scheduledDate: '2024-01-12',
        estimatedDuration: '4 hours',
        description: 'Water heater stopped working. Guest has no hot water.',
        cost: 350,
        notes: 'Replaced heating element and thermostat. System restored.',
        createdAt: '2024-01-12T18:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-12T22:00:00.000Z',
        lastModifiedBy: 'tech_5',
        category: 'Emergency',
        date: '2024-01-12',
        contractor: 'Emergency Plumbers',
        inspector: 'Maintenance Supervisor',
        price: 350,
        comments: [
          {
            id: 5,
            author: 'Emergency Plumbers',
            date: '2024-01-12T18:30:00.000Z',
            text: 'Arrived on site. Diagnosing water heater issue.',
            type: 'contractor'
          },
          {
            id: 6,
            author: 'Emergency Plumbers',
            date: '2024-01-12T22:00:00.000Z',
            text: 'Emergency repair completed. Hot water restored.',
            type: 'contractor'
          }
        ],
        attachments: [
          {
            id: 3,
            name: 'Emergency_Repair_Invoice.pdf',
            size: '189 KB',
            type: 'application/pdf'
          }
        ],
        beforePhotos: [
          {
            id: 4,
            name: 'water_heater_before.jpg',
            size: '1.5 MB'
          }
        ],
        afterPhotos: [
          {
            id: 5,
            name: 'water_heater_after.jpg',
            size: '1.4 MB'
          }
        ]
      }
    ];
    
    res.json({
      success: true,
      data: maintenanceTasks,
      total: maintenanceTasks.length,
      page: 1,
      limit: 50,
      message: 'Maintenance tasks retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance tasks'
    });
  }
});

app.get('/api/maintenance/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 GET /api/maintenance/stats - Fetching maintenance statistics');
    
    // Mock maintenance stats data
    const statsData = {
      totalTasks: 12,
      scheduledTasks: 4,
      inProgressTasks: 2,
      completedTasks: 6
    };
    
    res.json({
      success: true,
      data: statsData,
      message: 'Maintenance statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance statistics'
    });
  }
});

app.get('/api/maintenance/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔧 GET /api/maintenance/${id} - Fetching maintenance task by ID`);
    
    // Mock detailed maintenance task data
    const taskData = {
      id: parseInt(id),
      title: 'AC Unit Repair - Living Room',
      unit: 'Luxury Apartment Downtown Dubai',
      unitId: 'prop_1',
      technician: 'HVAC Solutions Dubai',
      technicianId: 'tech_1',
      status: 'Completed',
      priority: 'High',
      type: 'HVAC',
      scheduledDate: '2024-01-15',
      estimatedDuration: '2 hours',
      description: 'AC unit not cooling properly in living room. Guest reported issue during stay. Temperature was not dropping below 25°C despite thermostat set to 20°C.',
      cost: 250,
      notes: 'Replaced compressor and recharged refrigerant. System working normally now. Guest satisfied with repair.',
      createdAt: '2024-01-15T08:00:00.000Z',
      createdBy: 'admin@roomy.com',
      lastModifiedAt: '2024-01-15T14:00:00.000Z',
      lastModifiedBy: 'tech_1',
      category: 'HVAC',
      date: '2024-01-15',
      contractor: 'HVAC Solutions Dubai',
      inspector: 'Maintenance Supervisor',
      price: 250,
      comments: [
        {
          id: 1,
          author: 'HVAC Solutions Dubai',
          date: '2024-01-15T10:00:00.000Z',
          text: 'Diagnosed compressor issue. Replacing unit and checking refrigerant levels.',
          type: 'contractor'
        },
        {
          id: 2,
          author: 'HVAC Solutions Dubai',
          date: '2024-01-15T14:00:00.000Z',
          text: 'Repair completed successfully. System tested and working at optimal temperature.',
          type: 'contractor'
        },
        {
          id: 3,
          author: 'Maintenance Supervisor',
          date: '2024-01-15T15:00:00.000Z',
          text: 'Inspection completed. Work quality is excellent. Guest confirmed AC is working properly.',
          type: 'inspection'
        }
      ],
      attachments: [
        {
          id: 1,
          name: 'AC_Repair_Invoice.pdf',
          size: '245 KB',
          type: 'application/pdf'
        },
        {
          id: 2,
          name: 'Warranty_Certificate.pdf',
          size: '156 KB',
          type: 'application/pdf'
        }
      ],
      beforePhotos: [
        {
          id: 1,
          name: 'AC_before_repair.jpg',
          size: '1.2 MB'
        },
        {
          id: 2,
          name: 'AC_unit_diagnosis.jpg',
          size: '980 KB'
        }
      ],
      afterPhotos: [
        {
          id: 3,
          name: 'AC_after_repair.jpg',
          size: '1.1 MB'
        },
        {
          id: 4,
          name: 'AC_temperature_test.jpg',
          size: '850 KB'
        }
      ]
    };
    
    res.json({
      success: true,
      data: taskData,
      message: 'Maintenance task retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance task'
    });
  }
});

app.get('/api/maintenance/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`💬 GET /api/maintenance/${id}/comments - Fetching maintenance comments`);
    
    // Mock comments data
    const commentsData = [
      {
        id: 1,
        author: 'HVAC Solutions Dubai',
        date: '2024-01-15T10:00:00.000Z',
        text: 'Diagnosed compressor issue. Replacing unit and checking refrigerant levels.',
        type: 'contractor'
      },
      {
        id: 2,
        author: 'HVAC Solutions Dubai',
        date: '2024-01-15T14:00:00.000Z',
        text: 'Repair completed successfully. System tested and working at optimal temperature.',
        type: 'contractor'
      },
      {
        id: 3,
        author: 'Maintenance Supervisor',
        date: '2024-01-15T15:00:00.000Z',
        text: 'Inspection completed. Work quality is excellent. Guest confirmed AC is working properly.',
        type: 'inspection'
      }
    ];
    
    res.json({
      success: true,
      data: commentsData,
      message: 'Maintenance comments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance comments'
    });
  }
});

app.get('/api/maintenance/:id/attachments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📎 GET /api/maintenance/${id}/attachments - Fetching maintenance attachments`);
    
    // Mock attachments data
    const attachmentsData = [
      {
        id: 1,
        name: 'AC_Repair_Invoice.pdf',
        size: '245 KB',
        type: 'application/pdf'
      },
      {
        id: 2,
        name: 'Warranty_Certificate.pdf',
        size: '156 KB',
        type: 'application/pdf'
      }
    ];
    
    res.json({
      success: true,
      data: attachmentsData,
      message: 'Maintenance attachments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance attachments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance attachments'
    });
  }
});

app.get('/api/maintenance/:id/photos', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    console.log(`📸 GET /api/maintenance/${id}/photos - Fetching maintenance photos (type: ${type})`);
    
    // Mock photos data
    const photosData = type === 'before' ? [
      {
        id: 1,
        name: 'AC_before_repair.jpg',
        size: '1.2 MB'
      },
      {
        id: 2,
        name: 'AC_unit_diagnosis.jpg',
        size: '980 KB'
      }
    ] : type === 'after' ? [
      {
        id: 3,
        name: 'AC_after_repair.jpg',
        size: '1.1 MB'
      },
      {
        id: 4,
        name: 'AC_temperature_test.jpg',
        size: '850 KB'
      }
    ] : [
      {
        id: 1,
        name: 'AC_before_repair.jpg',
        size: '1.2 MB'
      },
      {
        id: 2,
        name: 'AC_unit_diagnosis.jpg',
        size: '980 KB'
      },
      {
        id: 3,
        name: 'AC_after_repair.jpg',
        size: '1.1 MB'
      },
      {
        id: 4,
        name: 'AC_temperature_test.jpg',
        size: '850 KB'
      }
    ];
    
    res.json({
      success: true,
      data: photosData,
      message: 'Maintenance photos retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance photos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance photos'
    });
  }
});

// Owners routes
app.get('/api/users/owners', authenticateToken, async (req, res) => {
  try {
    console.log('👤 GET /api/users/owners - Fetching owners');
    
    // Mock owners data
    const ownersData = [
      {
        id: 'owner_1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+971 50 123 4567',
        nationality: 'American',
        dateOfBirth: '1985-03-15',
        role: 'OWNER',
        isActive: true,
        properties: ['Luxury Apartment Downtown Dubai'],
        totalUnits: 1,
        comments: 'VIP Owner - Excellent payment history',
        createdAt: '2024-01-01T00:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-15T10:30:00.000Z',
        lastModifiedBy: 'admin@roomy.com',
        documents: [
          {
            id: 1,
            name: 'Passport_John_Smith.pdf',
            type: 'passport',
            uploadedAt: '2024-01-01T00:00:00.000Z',
            size: '2.1 MB',
            s3Key: 'documents/owner_1/passport.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_1/passport.pdf'
          },
          {
            id: 2,
            name: 'Emirates_ID_John_Smith.pdf',
            type: 'emirates_id',
            uploadedAt: '2024-01-01T00:00:00.000Z',
            size: '1.8 MB',
            s3Key: 'documents/owner_1/emirates_id.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_1/emirates_id.pdf'
          }
        ],
        bankDetails: [
          {
            id: 1,
            bankName: 'Emirates NBD',
            accountHolderName: 'John Smith',
            accountNumber: '1234567890',
            iban: 'AE070331234567890123456',
            swiftCode: 'EBILAEAD',
            bankAddress: 'Sheikh Zayed Road, Dubai',
            isPrimary: true,
            addedDate: '2024-01-01T00:00:00.000Z',
            addedBy: 'admin@roomy.com',
            addedByEmail: 'admin@roomy.com'
          }
        ],
        transactions: [
          {
            id: 1,
            type: 'payout',
            amount: 4500,
            currency: 'AED',
            description: 'Monthly rental income payout',
            bankDetailId: 1,
            status: 'completed',
            date: '2024-01-15T00:00:00.000Z',
            processedBy: 'admin@roomy.com',
            processedByEmail: 'admin@roomy.com',
            reference: 'PAY_2024_001',
            title: 'January 2024 Payout',
            responsible: 'Admin'
          }
        ],
        activityLog: [
          {
            id: 1,
            action: 'created',
            description: 'Owner account created',
            timestamp: '2024-01-01T00:00:00.000Z',
            user: 'admin@roomy.com',
            type: 'account'
          },
          {
            id: 2,
            action: 'updated',
            description: 'Contact information updated',
            timestamp: '2024-01-15T10:30:00.000Z',
            user: 'admin@roomy.com',
            type: 'profile'
          }
        ]
      },
      {
        id: 'owner_2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+971 50 987 6543',
        nationality: 'British',
        dateOfBirth: '1990-07-22',
        role: 'OWNER',
        isActive: true,
        properties: ['Beach Villa Palm Jumeirah'],
        totalUnits: 1,
        comments: 'Regular owner - Good communication',
        createdAt: '2024-01-05T00:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-10T14:20:00.000Z',
        lastModifiedBy: 'admin@roomy.com',
        documents: [
          {
            id: 3,
            name: 'Passport_Sarah_Johnson.pdf',
            type: 'passport',
            uploadedAt: '2024-01-05T00:00:00.000Z',
            size: '1.9 MB',
            s3Key: 'documents/owner_2/passport.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_2/passport.pdf'
          }
        ],
        bankDetails: [
          {
            id: 2,
            bankName: 'ADCB',
            accountHolderName: 'Sarah Johnson',
            accountNumber: '9876543210',
            iban: 'AE070339876543210123456',
            swiftCode: 'ADCBAEAD',
            bankAddress: 'Al Falah Street, Abu Dhabi',
            isPrimary: true,
            addedDate: '2024-01-05T00:00:00.000Z',
            addedBy: 'admin@roomy.com',
            addedByEmail: 'admin@roomy.com'
          }
        ],
        transactions: [
          {
            id: 2,
            type: 'payout',
            amount: 6200,
            currency: 'AED',
            description: 'Monthly rental income payout',
            bankDetailId: 2,
            status: 'completed',
            date: '2024-01-15T00:00:00.000Z',
            processedBy: 'admin@roomy.com',
            processedByEmail: 'admin@roomy.com',
            reference: 'PAY_2024_002',
            title: 'January 2024 Payout',
            responsible: 'Admin'
          }
        ],
        activityLog: [
          {
            id: 3,
            action: 'created',
            description: 'Owner account created',
            timestamp: '2024-01-05T00:00:00.000Z',
            user: 'admin@roomy.com',
            type: 'account'
          },
          {
            id: 4,
            action: 'updated',
            description: 'Bank details added',
            timestamp: '2024-01-10T14:20:00.000Z',
            user: 'admin@roomy.com',
            type: 'banking'
          }
        ]
      },
      {
        id: 'owner_3',
        firstName: 'Ahmed',
        lastName: 'Al-Rashid',
        email: 'ahmed.alrashid@example.com',
        phone: '+971 50 555 1234',
        nationality: 'Emirati',
        dateOfBirth: '1978-11-08',
        role: 'OWNER',
        isActive: true,
        properties: ['Business Bay Office'],
        totalUnits: 1,
        comments: 'Local owner - Premium properties',
        createdAt: '2024-01-08T00:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-12T09:15:00.000Z',
        lastModifiedBy: 'admin@roomy.com',
        documents: [
          {
            id: 4,
            name: 'Emirates_ID_Ahmed_AlRashid.pdf',
            type: 'emirates_id',
            uploadedAt: '2024-01-08T00:00:00.000Z',
            size: '1.7 MB',
            s3Key: 'documents/owner_3/emirates_id.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_3/emirates_id.pdf'
          }
        ],
        bankDetails: [
          {
            id: 3,
            bankName: 'FAB',
            accountHolderName: 'Ahmed Al-Rashid',
            accountNumber: '5555123456',
            iban: 'AE070335555123456123456',
            swiftCode: 'FABLAEAD',
            bankAddress: 'Sheikh Khalifa Bin Zayed Street, Dubai',
            isPrimary: true,
            addedDate: '2024-01-08T00:00:00.000Z',
            addedBy: 'admin@roomy.com',
            addedByEmail: 'admin@roomy.com'
          }
        ],
        transactions: [
          {
            id: 3,
            type: 'payout',
            amount: 7800,
            currency: 'AED',
            description: 'Monthly rental income payout',
            bankDetailId: 3,
            status: 'completed',
            date: '2024-01-15T00:00:00.000Z',
            processedBy: 'admin@roomy.com',
            processedByEmail: 'admin@roomy.com',
            reference: 'PAY_2024_003',
            title: 'January 2024 Payout',
            responsible: 'Admin'
          }
        ],
        activityLog: [
          {
            id: 5,
            action: 'created',
            description: 'Owner account created',
            timestamp: '2024-01-08T00:00:00.000Z',
            user: 'admin@roomy.com',
            type: 'account'
          },
          {
            id: 6,
            action: 'updated',
            description: 'Property information updated',
            timestamp: '2024-01-12T09:15:00.000Z',
            user: 'admin@roomy.com',
            type: 'property'
          }
        ]
      },
      {
        id: 'owner_4',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@example.com',
        phone: '+971 50 777 8888',
        nationality: 'Spanish',
        dateOfBirth: '1982-05-14',
        role: 'OWNER',
        isActive: false,
        properties: ['Marina View Studio'],
        totalUnits: 1,
        comments: 'Inactive - Property under renovation',
        createdAt: '2024-01-03T00:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-20T16:45:00.000Z',
        lastModifiedBy: 'admin@roomy.com',
        documents: [
          {
            id: 5,
            name: 'Passport_Maria_Rodriguez.pdf',
            type: 'passport',
            uploadedAt: '2024-01-03T00:00:00.000Z',
            size: '2.0 MB',
            s3Key: 'documents/owner_4/passport.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_4/passport.pdf'
          }
        ],
        bankDetails: [],
        transactions: [],
        activityLog: [
          {
            id: 7,
            action: 'created',
            description: 'Owner account created',
            timestamp: '2024-01-03T00:00:00.000Z',
            user: 'admin@roomy.com',
            type: 'account'
          },
          {
            id: 8,
            action: 'deactivated',
            description: 'Account deactivated due to property renovation',
            timestamp: '2024-01-20T16:45:00.000Z',
            user: 'admin@roomy.com',
            type: 'account'
          }
        ]
      },
      {
        id: 'owner_5',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@example.com',
        phone: '+971 50 333 4444',
        nationality: 'Canadian',
        dateOfBirth: '1975-12-03',
        role: 'OWNER',
        isActive: true,
        properties: ['JBR Beach Apartment', 'Downtown Loft 2BR'],
        totalUnits: 2,
        comments: 'VIP Owner - Multiple properties, excellent tenant',
        createdAt: '2024-01-02T00:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-18T11:30:00.000Z',
        lastModifiedBy: 'admin@roomy.com',
        documents: [
          {
            id: 6,
            name: 'Passport_David_Wilson.pdf',
            type: 'passport',
            uploadedAt: '2024-01-02T00:00:00.000Z',
            size: '2.2 MB',
            s3Key: 'documents/owner_5/passport.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_5/passport.pdf'
          },
          {
            id: 7,
            name: 'Visa_David_Wilson.pdf',
            type: 'visa',
            uploadedAt: '2024-01-02T00:00:00.000Z',
            size: '1.5 MB',
            s3Key: 'documents/owner_5/visa.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_5/visa.pdf'
          }
        ],
        bankDetails: [
          {
            id: 4,
            bankName: 'HSBC',
            accountHolderName: 'David Wilson',
            accountNumber: '3333444455',
            iban: 'AE070333333444455123456',
            swiftCode: 'HSBCAEAD',
            bankAddress: 'Sheikh Zayed Road, Dubai',
            isPrimary: true,
            addedDate: '2024-01-02T00:00:00.000Z',
            addedBy: 'admin@roomy.com',
            addedByEmail: 'admin@roomy.com'
          }
        ],
        transactions: [
          {
            id: 4,
            type: 'payout',
            amount: 12500,
            currency: 'AED',
            description: 'Monthly rental income payout - Multiple properties',
            bankDetailId: 4,
            status: 'completed',
            date: '2024-01-15T00:00:00.000Z',
            processedBy: 'admin@roomy.com',
            processedByEmail: 'admin@roomy.com',
            reference: 'PAY_2024_004',
            title: 'January 2024 Payout',
            responsible: 'Admin'
          }
        ],
        activityLog: [
          {
            id: 9,
            action: 'created',
            description: 'Owner account created',
            timestamp: '2024-01-02T00:00:00.000Z',
            user: 'admin@roomy.com',
            type: 'account'
          },
          {
            id: 10,
            action: 'updated',
            description: 'Additional property added',
            timestamp: '2024-01-18T11:30:00.000Z',
            user: 'admin@roomy.com',
            type: 'property'
          }
        ]
      }
    ];
    
    res.json({
      success: true,
      data: {
        owners: ownersData,
        pagination: {
          page: 1,
          limit: 10,
          total: ownersData.length,
          totalPages: 1
        }
      },
      message: 'Owners retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owners'
    });
  }
});

app.get('/api/users/owners/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 GET /api/users/owners/stats - Fetching owner statistics');
    
    // Mock owner stats data
    const statsData = {
      totalOwners: 5,
      activeOwners: 4,
      inactiveOwners: 1,
      totalUnits: 6,
      totalTransactions: 4,
      totalAmount: 31000
    };
    
    res.json({
      success: true,
      data: statsData,
      message: 'Owner statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owner statistics'
    });
  }
});

app.get('/api/users/owners/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👤 GET /api/users/owners/${id} - Fetching owner by ID`);
    
    // Mock detailed owner data
    const ownerData = {
      id: id,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+971 50 123 4567',
      nationality: 'American',
      dateOfBirth: '1985-03-15',
      role: 'OWNER',
      isActive: true,
      properties: ['Luxury Apartment Downtown Dubai'],
      totalUnits: 1,
      comments: 'VIP Owner - Excellent payment history. Always pays on time and communicates well.',
      createdAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'admin@roomy.com',
      lastModifiedAt: '2024-01-15T10:30:00.000Z',
      lastModifiedBy: 'admin@roomy.com',
      documents: [
        {
          id: 1,
          name: 'Passport_John_Smith.pdf',
          type: 'passport',
          uploadedAt: '2024-01-01T00:00:00.000Z',
          size: '2.1 MB',
          s3Key: 'documents/owner_1/passport.pdf',
          s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_1/passport.pdf'
        },
        {
          id: 2,
          name: 'Emirates_ID_John_Smith.pdf',
          type: 'emirates_id',
          uploadedAt: '2024-01-01T00:00:00.000Z',
          size: '1.8 MB',
          s3Key: 'documents/owner_1/emirates_id.pdf',
          s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_1/emirates_id.pdf'
        }
      ],
      bankDetails: [
        {
          id: 1,
          bankName: 'Emirates NBD',
          accountHolderName: 'John Smith',
          accountNumber: '1234567890',
          iban: 'AE070331234567890123456',
          swiftCode: 'EBILAEAD',
          bankAddress: 'Sheikh Zayed Road, Dubai',
          isPrimary: true,
          addedDate: '2024-01-01T00:00:00.000Z',
          addedBy: 'admin@roomy.com',
          addedByEmail: 'admin@roomy.com'
        }
      ],
      transactions: [
        {
          id: 1,
          type: 'payout',
          amount: 4500,
          currency: 'AED',
          description: 'Monthly rental income payout',
          bankDetailId: 1,
          status: 'completed',
          date: '2024-01-15T00:00:00.000Z',
          processedBy: 'admin@roomy.com',
          processedByEmail: 'admin@roomy.com',
          reference: 'PAY_2024_001',
          title: 'January 2024 Payout',
          responsible: 'Admin'
        }
      ],
      activityLog: [
        {
          id: 1,
          action: 'created',
          description: 'Owner account created',
          timestamp: '2024-01-01T00:00:00.000Z',
          user: 'admin@roomy.com',
          type: 'account'
        },
        {
          id: 2,
          action: 'updated',
          description: 'Contact information updated',
          timestamp: '2024-01-15T10:30:00.000Z',
          user: 'admin@roomy.com',
          type: 'profile'
        }
      ]
    };
    
    res.json({
      success: true,
      data: ownerData,
      message: 'Owner retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching owner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owner'
    });
  }
});

app.get('/api/users/owners/:id/activity-log', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 GET /api/users/owners/${id}/activity-log - Fetching owner activity log`);
    
    // Mock activity log data
    const activityLogData = [
      {
        id: 1,
        action: 'created',
        description: 'Owner account created',
        timestamp: '2024-01-01T00:00:00.000Z',
        user: 'admin@roomy.com',
        type: 'account'
      },
      {
        id: 2,
        action: 'updated',
        description: 'Contact information updated',
        timestamp: '2024-01-15T10:30:00.000Z',
        user: 'admin@roomy.com',
        type: 'profile'
      },
      {
        id: 3,
        action: 'bank_detail_added',
        description: 'Bank account details added',
        timestamp: '2024-01-01T00:00:00.000Z',
        user: 'admin@roomy.com',
        type: 'banking'
      },
      {
        id: 4,
        action: 'document_uploaded',
        description: 'Passport document uploaded',
        timestamp: '2024-01-01T00:00:00.000Z',
        user: 'admin@roomy.com',
        type: 'document'
      },
      {
        id: 5,
        action: 'payout_processed',
        description: 'Monthly payout processed - AED 4,500',
        timestamp: '2024-01-15T00:00:00.000Z',
        user: 'admin@roomy.com',
        type: 'transaction'
      }
    ];
    
    res.json({
      success: true,
      data: activityLogData,
      message: 'Owner activity log retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching owner activity log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owner activity log'
    });
  }
});

// Start server
async function startServer() {
  try {
    // Initialize default users, properties, and reservations
    await initializeUsers();
    await initializeProperties();
    await initializeReservations();
    
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
