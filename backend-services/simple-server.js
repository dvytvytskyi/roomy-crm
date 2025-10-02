const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const s3Service = require('./s3-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Data persistence
const DATA_DIR = path.join(__dirname, 'data');
const OWNERS_FILE = path.join(DATA_DIR, 'owners.json');
const GUESTS_FILE = path.join(DATA_DIR, 'guests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load data from file or use default
function loadOwnersData() {
  try {
    if (fs.existsSync(OWNERS_FILE)) {
      const data = fs.readFileSync(OWNERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading owners data:', error);
  }
  return null;
}

function loadGuestsData() {
  try {
    if (fs.existsSync(GUESTS_FILE)) {
      const data = fs.readFileSync(GUESTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading guests data:', error);
  }
  return null;
}

// Save data to file
function saveOwnersData(owners) {
  try {
    fs.writeFileSync(OWNERS_FILE, JSON.stringify(owners, null, 2));
    console.log('✅ Owners data saved to file');
  } catch (error) {
    console.error('Error saving owners data:', error);
  }
}

function saveGuestsData(guests) {
  try {
    fs.writeFileSync(GUESTS_FILE, JSON.stringify(guests, null, 2));
    console.log('✅ Guests data saved to file');
  } catch (error) {
    console.error('Error saving guests data:', error);
  }
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Logging middleware
app.use(morgan('combined'));

// Compression middleware
app.use(compression());

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, TXT, XLS, XLSX files are allowed.'), false);
    }
  }
});

// Rate limiting (relaxed for development)
if (process.env.DISABLE_RATE_LIMIT !== 'true') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // limit each IP to 10000 requests per windowMs (increased for development)
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
  console.log('🛡️ Rate limiting enabled: 10000 requests per 15 minutes');
} else {
  console.log('⚠️ Rate limiting disabled for development');
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Mock data for reservations with extended structure
const mockReservations = [
  {
    id: 'res_1',
    propertyId: 'prop_1',
    propertyName: 'Luxury Downtown Apartment',
    propertyType: 'APARTMENT',
    propertyAddress: '123 Main St, Dubai',
    propertyCity: 'Dubai',
    guestId: 'guest_1',
    guestName: 'John Smith',
    guestEmail: 'john@example.com',
    guestPhone: '+971501234567',
    guestWhatsapp: '+971501234567',
    checkIn: '2024-02-01T00:00:00.000Z',
    checkOut: '2024-02-05T00:00:00.000Z',
    status: 'CONFIRMED',
    paymentStatus: 'FULLY_PAID',
    guestStatus: 'UPCOMING',
    source: 'DIRECT',
    totalAmount: 1200,
    paidAmount: 1200,
    outstandingBalance: 0,
    nights: 4,
    guests: 2,
    guestCount: 2,
    specialRequests: 'Early check-in requested',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    createdBy: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com'
    },
    // Extended data for detailed view
    notesList: [
      {
        id: 1,
        content: 'Early check-in requested',
        type: 'special_request',
        priority: 'high',
        createdAt: '2024-01-10T10:00:00Z',
        createdBy: 'Sarah Johnson'
      }
    ],
    payments: [
      {
        id: 1,
        amount: 1200,
        method: 'credit_card',
        date: '2024-01-10',
        reference: 'TXN-001',
        description: 'Full payment',
        type: 'payment',
        status: 'completed'
      }
    ],
    adjustments: [],
    pricingHistory: [
      {
        id: 1,
        pricePerNight: 300,
        totalAmount: 1200,
        reason: 'Initial booking',
        date: '2024-01-10',
        changedBy: 'Sarah Johnson'
      }
    ],
    communicationHistory: [
      {
        id: 1,
        type: 'email',
        subject: 'Welcome to your stay',
        date: '2024-01-10T10:00:00Z',
        status: 'sent'
      }
    ],
    transactions: []
  },
  {
    id: 'res_2',
    propertyId: 'prop_2',
    propertyName: 'Beach Villa Palm Jumeirah',
    propertyType: 'VILLA',
    propertyAddress: '456 Beach Rd, Dubai',
    propertyCity: 'Dubai',
    guestId: 'guest_2',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah@example.com',
    guestPhone: '+971507654321',
    guestWhatsapp: '+971507654321',
    checkIn: '2024-02-10T00:00:00.000Z',
    checkOut: '2024-02-15T00:00:00.000Z',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    guestStatus: 'UPCOMING',
    source: 'AIRBNB',
    totalAmount: 2500,
    paidAmount: 0,
    outstandingBalance: 2500,
    nights: 5,
    guests: 4,
    guestCount: 4,
    specialRequests: null,
    createdAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    createdBy: {
      name: 'Admin User',
      email: 'admin@company.com'
    },
    // Extended data for detailed view
    notesList: [],
    payments: [],
    adjustments: [],
    pricingHistory: [
      {
        id: 2,
        pricePerNight: 500,
        totalAmount: 2500,
        reason: 'Initial booking',
        date: '2024-01-12',
        changedBy: 'Admin User'
      }
    ],
    communicationHistory: [],
    transactions: []
  },
  {
    id: 'res_3',
    propertyId: 'prop_3',
    propertyName: 'Business Bay Office',
    propertyType: 'APARTMENT',
    propertyAddress: '789 Business Bay, Dubai',
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
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-27T12:00:00Z',
    createdBy: {
      name: 'System',
      email: 'system@company.com'
    },
    // Extended data for detailed view
    notesList: [
      {
        id: 3,
        content: 'Business trip',
        type: 'internal',
        priority: 'normal',
        createdAt: '2024-01-08T09:15:00Z',
        createdBy: 'System'
      }
    ],
    payments: [
      {
        id: 3,
        amount: 800,
        method: 'bank_transfer',
        date: '2024-01-08',
        reference: 'TXN-003',
        description: 'Full payment',
        type: 'payment',
        status: 'completed'
      }
    ],
    adjustments: [],
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
    communicationHistory: [],
    transactions: []
  }
];

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  // For development, we'll skip real authentication
  req.user = {
    id: 'admin_1',
    email: 'admin@roomy.com',
    role: 'ADMIN'
  };
  next();
};

// Reservations routes
app.get('/api/reservations', mockAuth, (req, res) => {
  console.log('📅 GET /api/reservations - Fetching reservations');
  console.log('📅 Query params:', req.query);
  
  const { 
    page = 1, 
    limit = 50, 
    status, 
    source, 
    checkInFrom,
    checkInTo,
    minAmount,
    maxAmount,
    guestName,
    searchTerm
  } = req.query;

  let filteredReservations = [...mockReservations];

  // Apply filters
  if (status) {
    const statusArray = status.split(',').map(s => {
      // Map frontend values to backend values
      const mapping = {
        'confirmed': 'CONFIRMED',
        'pending': 'PENDING',
        'cancelled': 'CANCELLED',
        'canceled': 'CANCELLED',
        'completed': 'COMPLETED',
        'no_show': 'NO_SHOW',
        'modified': 'MODIFIED'
      };
      return mapping[s.toLowerCase()] || s.toUpperCase();
    });
    console.log('📅 Filtering by status:', statusArray);
    filteredReservations = filteredReservations.filter(r => statusArray.includes(r.status));
    console.log('📅 After status filter:', filteredReservations.length, 'reservations');
  }

  if (source) {
    const sourceArray = source.split(',').map(s => {
      // Map frontend values to backend values
      const mapping = {
        'airbnb': 'AIRBNB',
        'booking': 'BOOKING_COM',
        'vrbo': 'VRBO',
        'direct': 'DIRECT'
      };
      return mapping[s.toLowerCase()] || s.toUpperCase();
    });
    console.log('📅 Filtering by source:', sourceArray);
    filteredReservations = filteredReservations.filter(r => sourceArray.includes(r.source));
    console.log('📅 After source filter:', filteredReservations.length, 'reservations');
  }


  if (guestName) {
    console.log('📅 Filtering by guest name:', guestName);
    filteredReservations = filteredReservations.filter(r => 
      r.guestName.toLowerCase().includes(guestName.toLowerCase())
    );
    console.log('📅 After guest name filter:', filteredReservations.length, 'reservations');
  }

  if (searchTerm) {
    console.log('📅 Filtering by search term:', searchTerm);
    filteredReservations = filteredReservations.filter(r => 
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log('📅 After search term filter:', filteredReservations.length, 'reservations');
  }

  if (checkInFrom) {
    console.log('📅 Filtering by check-in from:', checkInFrom);
    filteredReservations = filteredReservations.filter(r => 
      new Date(r.checkIn) >= new Date(checkInFrom)
    );
    console.log('📅 After check-in from filter:', filteredReservations.length, 'reservations');
  }

  if (checkInTo) {
    console.log('📅 Filtering by check-in to:', checkInTo);
    filteredReservations = filteredReservations.filter(r => 
      new Date(r.checkIn) <= new Date(checkInTo)
    );
    console.log('📅 After check-in to filter:', filteredReservations.length, 'reservations');
  }

  if (minAmount) {
    console.log('📅 Filtering by min amount:', minAmount);
    filteredReservations = filteredReservations.filter(r => 
      r.totalAmount >= parseFloat(minAmount)
    );
    console.log('📅 After min amount filter:', filteredReservations.length, 'reservations');
  }

  if (maxAmount) {
    console.log('📅 Filtering by max amount:', maxAmount);
    filteredReservations = filteredReservations.filter(r => 
      r.totalAmount <= parseFloat(maxAmount)
    );
    console.log('📅 After max amount filter:', filteredReservations.length, 'reservations');
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedReservations = filteredReservations.slice(startIndex, endIndex);

  console.log('📅 Final result:', {
    totalFiltered: filteredReservations.length,
    paginated: paginatedReservations.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: paginatedReservations,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredReservations.length,
      totalPages: Math.ceil(filteredReservations.length / limit),
      hasNext: endIndex < filteredReservations.length,
      hasPrev: page > 1
    },
    message: 'Reservations retrieved successfully'
  });
});

app.get('/api/reservations/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`📅 GET /api/reservations/${id} - Fetching reservation by ID`);
  
  const reservation = mockReservations.find(r => r.id === id);
  
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
});

app.get('/api/reservations/stats', mockAuth, (req, res) => {
  console.log('📊 GET /api/reservations/stats - Fetching statistics');
  
  const stats = {
    totalReservations: mockReservations.length,
    confirmedReservations: mockReservations.filter(r => r.status === 'CONFIRMED').length,
    pendingReservations: mockReservations.filter(r => r.status === 'PENDING').length,
    cancelledReservations: mockReservations.filter(r => r.status === 'CANCELLED').length,
    completedReservations: mockReservations.filter(r => r.status === 'COMPLETED').length,
    totalRevenue: mockReservations.reduce((sum, r) => sum + r.totalAmount, 0),
    averageStay: mockReservations.reduce((sum, r) => sum + r.nights, 0) / mockReservations.length,
    occupancyRate: 75.5
  };

  res.json({
    success: true,
    data: stats,
    message: 'Reservation statistics retrieved successfully'
  });
});

app.get('/api/reservations/sources', mockAuth, (req, res) => {
  console.log('📋 GET /api/reservations/sources - Fetching sources');
  
  const sources = [
    { source: 'DIRECT', count: 2 },
    { source: 'AIRBNB', count: 1 },
    { source: 'BOOKING_COM', count: 0 },
    { source: 'VRBO', count: 0 }
  ];

  res.json({
    success: true,
    data: sources,
    message: 'Reservation sources retrieved successfully'
  });
});

app.get('/api/reservations/calendar', mockAuth, (req, res) => {
  console.log('📅 GET /api/reservations/calendar - Fetching calendar');
  
  const calendar = mockReservations.map(r => ({
    id: r.id,
    title: r.guestName,
    start: r.checkIn,
    end: r.checkOut,
    propertyId: r.propertyId,
    propertyName: r.propertyName,
    status: r.status,
    guestStatus: r.guestStatus,
    totalAmount: r.totalAmount,
    guestCount: r.guestCount
  }));

  res.json({
    success: true,
    data: calendar,
    message: 'Reservation calendar retrieved successfully'
  });
});

app.get('/api/reservations/available-properties', mockAuth, (req, res) => {
  console.log('🏠 GET /api/reservations/available-properties - Fetching available properties');
  
  const properties = [
    {
      id: 'prop_1',
      name: 'Luxury Downtown Apartment',
      type: 'APARTMENT',
      address: '123 Main St, Dubai',
      city: 'Dubai',
      capacity: 4,
      bedrooms: 2,
      bathrooms: 2,
      pricePerNight: 300,
      primaryImage: 'https://example.com/image1.jpg'
    },
    {
      id: 'prop_2',
      name: 'Beach Villa Palm Jumeirah',
      type: 'VILLA',
      address: '456 Beach Rd, Dubai',
      city: 'Dubai',
      capacity: 8,
      bedrooms: 4,
      bathrooms: 3,
      pricePerNight: 500,
      primaryImage: 'https://example.com/image2.jpg'
    }
  ];

  res.json({
    success: true,
    data: properties,
    message: 'Available properties retrieved successfully'
  });
});

// Auth routes (mock)
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 POST /api/auth/login - Mock login');
  
  const { email, password } = req.body;
  
  if (email === 'admin2@roomy.com' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        accessToken: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          id: 'admin_1',
          email: 'admin2@roomy.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        }
      },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Get user profile
app.get('/api/auth/profile', mockAuth, (req, res) => {
  console.log('👤 GET /api/auth/profile - Mock profile');
  
  res.json({
    success: true,
    data: {
      id: 'admin_1',
      email: 'admin2@roomy.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    },
    message: 'Profile retrieved successfully'
  });
});

// Refresh token
app.post('/api/auth/refresh-token', (req, res) => {
  console.log('🔄 POST /api/auth/refresh-token - Mock refresh');
  
  const { refreshToken } = req.body;
  
  if (refreshToken && refreshToken.startsWith('mock-refresh-token-')) {
    res.json({
      success: true,
      data: {
        accessToken: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      },
      message: 'Token refreshed successfully'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Logout
app.post('/api/auth/logout', mockAuth, (req, res) => {
  console.log('🚪 POST /api/auth/logout - Mock logout');
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// ===== RESERVATION DETAILS ENDPOINTS =====

// Update reservation
app.put('/api/reservations/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`📝 PUT /api/reservations/${id} - Updating reservation`);
  console.log('📝 Update data:', updateData);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  // Update reservation
  mockReservations[reservationIndex] = {
    ...mockReservations[reservationIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: mockReservations[reservationIndex],
    message: 'Reservation updated successfully'
  });
});

// Add note to reservation
app.post('/api/reservations/:id/notes', mockAuth, (req, res) => {
  const { id } = req.params;
  const { content, type = 'internal', priority = 'normal' } = req.body;
  console.log(`📝 POST /api/reservations/${id}/notes - Adding note`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const newNote = {
    id: Date.now(),
    content,
    type,
    priority,
    createdAt: new Date().toISOString(),
    createdBy: 'Current User'
  };
  
  if (!mockReservations[reservationIndex].notesList) {
    mockReservations[reservationIndex].notesList = [];
  }
  mockReservations[reservationIndex].notesList.push(newNote);
  mockReservations[reservationIndex].updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: newNote,
    message: 'Note added successfully'
  });
});

// Update note
app.put('/api/reservations/:id/notes/:noteId', mockAuth, (req, res) => {
  const { id, noteId } = req.params;
  const { content } = req.body;
  console.log(`📝 PUT /api/reservations/${id}/notes/${noteId} - Updating note`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = mockReservations[reservationIndex];
  if (!reservation.notesList) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }
  
  const noteIndex = reservation.notesList.findIndex(n => n.id === parseInt(noteId));
  if (noteIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }
  
  reservation.notesList[noteIndex].content = content;
  reservation.notesList[noteIndex].updatedAt = new Date().toISOString();
  reservation.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: reservation.notesList[noteIndex],
    message: 'Note updated successfully'
  });
});

// Delete note
app.delete('/api/reservations/:id/notes/:noteId', mockAuth, (req, res) => {
  const { id, noteId } = req.params;
  console.log(`🗑️ DELETE /api/reservations/${id}/notes/${noteId} - Deleting note`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = mockReservations[reservationIndex];
  if (!reservation.notesList) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }
  
  const noteIndex = reservation.notesList.findIndex(n => n.id === parseInt(noteId));
  if (noteIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }
  
  reservation.notesList.splice(noteIndex, 1);
  reservation.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Note deleted successfully'
  });
});

// Add payment to reservation
app.post('/api/reservations/:id/payments', mockAuth, (req, res) => {
  const { id } = req.params;
  const { amount, method, date, reference, description, type = 'payment' } = req.body;
  console.log(`💳 POST /api/reservations/${id}/payments - Adding payment`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const newPayment = {
    id: Date.now(),
    amount: parseFloat(amount),
    method,
    date,
    reference,
    description,
    type,
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  
  if (!mockReservations[reservationIndex].payments) {
    mockReservations[reservationIndex].payments = [];
  }
  mockReservations[reservationIndex].payments.push(newPayment);
  
  // Update payment amounts
  const reservation = mockReservations[reservationIndex];
  if (type === 'payment') {
    reservation.paidAmount += newPayment.amount;
    reservation.outstandingBalance -= newPayment.amount;
  } else if (type === 'refund') {
    reservation.paidAmount -= newPayment.amount;
    reservation.outstandingBalance += newPayment.amount;
  }
  
  reservation.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: newPayment,
    message: 'Payment added successfully'
  });
});

// Add adjustment to reservation
app.post('/api/reservations/:id/adjustments', mockAuth, (req, res) => {
  const { id } = req.params;
  const { type, amount, reason } = req.body;
  console.log(`⚖️ POST /api/reservations/${id}/adjustments - Adding adjustment`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const newAdjustment = {
    id: Date.now(),
    type,
    amount: parseFloat(amount),
    reason,
    date: new Date().toISOString().split('T')[0],
    createdBy: 'Current User',
    createdAt: new Date().toISOString()
  };
  
  if (!mockReservations[reservationIndex].adjustments) {
    mockReservations[reservationIndex].adjustments = [];
  }
  mockReservations[reservationIndex].adjustments.push(newAdjustment);
  
  // Update total amount
  mockReservations[reservationIndex].totalAmount += newAdjustment.amount;
  mockReservations[reservationIndex].outstandingBalance += newAdjustment.amount;
  mockReservations[reservationIndex].updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: newAdjustment,
    message: 'Adjustment added successfully'
  });
});

// Delete adjustment
app.delete('/api/reservations/:id/adjustments/:adjustmentId', mockAuth, (req, res) => {
  const { id, adjustmentId } = req.params;
  console.log(`🗑️ DELETE /api/reservations/${id}/adjustments/${adjustmentId} - Deleting adjustment`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = mockReservations[reservationIndex];
  if (!reservation.adjustments) {
    return res.status(404).json({
      success: false,
      message: 'Adjustment not found'
    });
  }
  
  const adjustmentIndex = reservation.adjustments.findIndex(a => a.id === parseInt(adjustmentId));
  if (adjustmentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Adjustment not found'
    });
  }
  
  const adjustment = reservation.adjustments[adjustmentIndex];
  reservation.adjustments.splice(adjustmentIndex, 1);
  
  // Update total amount
  reservation.totalAmount -= adjustment.amount;
  reservation.outstandingBalance -= adjustment.amount;
  reservation.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Adjustment deleted successfully'
  });
});

// Update reservation dates
app.put('/api/reservations/:id/dates', mockAuth, (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.body;
  console.log(`📅 PUT /api/reservations/${id}/dates - Updating dates`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  mockReservations[reservationIndex].checkIn = checkIn;
  mockReservations[reservationIndex].checkOut = checkOut;
  mockReservations[reservationIndex].nights = nights;
  mockReservations[reservationIndex].updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: mockReservations[reservationIndex],
    message: 'Dates updated successfully'
  });
});

// Update reservation pricing
app.put('/api/reservations/:id/pricing', mockAuth, (req, res) => {
  const { id } = req.params;
  const { pricePerNight, totalAmount } = req.body;
  console.log(`💰 PUT /api/reservations/${id}/pricing - Updating pricing`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = mockReservations[reservationIndex];
  const oldTotalAmount = reservation.totalAmount;
  
  reservation.totalAmount = parseFloat(totalAmount);
  reservation.outstandingBalance = reservation.totalAmount - reservation.paidAmount;
  reservation.updatedAt = new Date().toISOString();
  
  // Add to pricing history
  if (!reservation.pricingHistory) {
    reservation.pricingHistory = [];
  }
  reservation.pricingHistory.push({
    id: Date.now(),
    pricePerNight: parseFloat(pricePerNight),
    totalAmount: parseFloat(totalAmount),
    reason: 'Price adjustment',
    date: new Date().toISOString().split('T')[0],
    changedBy: 'Current User'
  });
  
  res.json({
    success: true,
    data: reservation,
    message: 'Pricing updated successfully'
  });
});

// Send communication
app.post('/api/reservations/:id/communications', mockAuth, (req, res) => {
  const { id } = req.params;
  const { type, subject, content } = req.body;
  console.log(`📧 POST /api/reservations/${id}/communications - Sending communication`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const newCommunication = {
    id: Date.now(),
    type,
    subject,
    content,
    date: new Date().toISOString(),
    status: 'sent',
    sentBy: 'Current User'
  };
  
  if (!mockReservations[reservationIndex].communicationHistory) {
    mockReservations[reservationIndex].communicationHistory = [];
  }
  mockReservations[reservationIndex].communicationHistory.push(newCommunication);
  mockReservations[reservationIndex].updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: newCommunication,
    message: 'Communication sent successfully'
  });
});

// Generate invoice
app.post('/api/reservations/:id/invoices', mockAuth, (req, res) => {
  const { id } = req.params;
  const { type = 'standard' } = req.body;
  console.log(`🧾 POST /api/reservations/${id}/invoices - Generating invoice`);
  
  const reservationIndex = mockReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = mockReservations[reservationIndex];
  const invoice = {
    id: `INV-${Date.now()}`,
    reservationId: id,
    type,
    totalAmount: reservation.totalAmount,
    paidAmount: reservation.paidAmount,
    outstandingBalance: reservation.outstandingBalance,
    generatedAt: new Date().toISOString(),
    generatedBy: 'Current User',
    status: 'generated'
  };
  
  res.json({
    success: true,
    data: invoice,
    message: 'Invoice generated successfully'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ===== GUESTS API ENDPOINTS =====

// Default guests data
const defaultGuests = [
  {
    id: 'guest_1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    whatsapp: '+1 (555) 123-4567',
    telegram: '@johnsmith',
    nationality: 'American',
    dateOfBirth: '1985-03-15T00:00:00.000Z',
    reservationCount: 5,
    unit: 'Apartment Burj Khalifa 1A',
    comments: 'VIP guest, prefers high floors',
    customCategories: ['Star Guest', 'VIP'],
    starGuest: true,
    primaryGuest: true,
    loyaltyTier: 'Gold',
    preferredLanguage: 'English',
    specialRequests: 'Ground floor units preferred',
    documents: [
      { id: 1, name: 'passport.pdf', type: 'Passport', uploadedAt: '2024-01-15T10:30:00Z', size: '2.3 MB' }
    ],
    createdBy: 'Admin',
    createdAt: '2024-01-15T10:30:00Z',
    lastModifiedBy: 'Manager',
    lastModifiedAt: '2024-07-20T14:20:00Z'
  },
  {
    id: 'guest_2',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '+34 612 345 678',
    whatsapp: '+34 612 345 678',
    telegram: '@mariag',
    nationality: 'Spanish',
    dateOfBirth: '1990-07-22T00:00:00.000Z',
    reservationCount: 3,
    unit: 'Apartment Marina 2B',
    comments: 'Family with children, needs baby crib',
    customCategories: ['Family Guest'],
    starGuest: false,
    primaryGuest: true,
    loyaltyTier: 'Silver',
    preferredLanguage: 'Spanish',
    specialRequests: 'Baby crib and high chair needed',
    documents: [],
    createdBy: 'Admin',
    createdAt: '2024-02-10T09:15:00Z',
    lastModifiedBy: 'Admin',
    lastModifiedAt: '2024-06-15T11:45:00Z'
  },
  {
    id: 'guest_3',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    phone: '+20 123 456 7890',
    whatsapp: '+20 123 456 7890',
    telegram: '',
    nationality: 'Egyptian',
    dateOfBirth: '1988-12-03T00:00:00.000Z',
    reservationCount: 1,
    unit: 'Studio Downtown 3C',
    comments: 'Business traveler, needs quiet room',
    customCategories: ['Business Guest'],
    starGuest: false,
    primaryGuest: false,
    loyaltyTier: 'Bronze',
    preferredLanguage: 'Arabic',
    specialRequests: 'Quiet room, late checkout',
    documents: [],
    createdBy: 'Manager',
    createdAt: '2024-03-05T16:20:00Z',
    lastModifiedBy: 'Manager',
    lastModifiedAt: '2024-03-05T16:20:00Z'
  },
  {
    id: 'guest_4',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+44 7700 900123',
    whatsapp: '+44 7700 900123',
    telegram: '@sarahj',
    nationality: 'British',
    dateOfBirth: '1992-05-18T00:00:00.000Z',
    reservationCount: 8,
    unit: 'Penthouse Skyline 5A',
    comments: 'Loyalty program member, frequent visitor',
    customCategories: ['Star Guest', 'Loyalty Program'],
    starGuest: true,
    primaryGuest: true,
    loyaltyTier: 'Platinum',
    preferredLanguage: 'English',
    specialRequests: 'City view preferred, early check-in',
    documents: [],
    createdBy: 'Admin',
    createdAt: '2023-11-20T08:30:00Z',
    lastModifiedBy: 'Admin',
    lastModifiedAt: '2024-08-10T12:15:00Z'
  },
  {
    id: 'guest_5',
    name: 'Chen Wei',
    email: 'chen.wei@example.com',
    phone: '+86 138 0013 8000',
    whatsapp: '+86 138 0013 8000',
    telegram: '@chenwei',
    nationality: 'Chinese',
    dateOfBirth: '1987-09-12T00:00:00.000Z',
    reservationCount: 2,
    unit: 'Apartment Business 4D',
    comments: 'Corporate booking, group leader',
    customCategories: ['Corporate Guest'],
    starGuest: false,
    primaryGuest: true,
    loyaltyTier: 'Silver',
    preferredLanguage: 'Chinese',
    specialRequests: 'Meeting room access, group discounts',
    documents: [],
    createdBy: 'Manager',
    createdAt: '2024-04-12T13:45:00Z',
    lastModifiedBy: 'Manager',
    lastModifiedAt: '2024-07-25T10:30:00Z'
  }
];

// Load guests data from file or use default
let mockGuests = loadGuestsData() || defaultGuests;

// Save initial data if file doesn't exist
if (!loadGuestsData()) {
  saveGuestsData(mockGuests);
  console.log('📁 Initial guests data saved to file');
}

// GET /api/guests - Get all guests with filtering
app.get('/api/guests', mockAuth, (req, res) => {
  console.log('👥 GET /api/guests - Fetching guests');
  console.log('👥 Query params:', req.query);

  const { 
    nationality, 
    dateOfBirthFrom, 
    dateOfBirthTo,
    minReservations,
    maxReservations,
    unit,
    categories,
    starGuest,
    primaryGuest,
    searchTerm,
    page = 1, 
    limit = 50 
  } = req.query;

  let filteredGuests = [...mockGuests];

  // Apply nationality filter
  if (nationality) {
    const nationalityArray = nationality.split(',').map(n => n.trim());
    filteredGuests = filteredGuests.filter(guest =>
      nationalityArray.includes(guest.nationality)
    );
    console.log(`👥 Filtered by nationality: ${filteredGuests.length} guests`);
  }

  // Apply date of birth filter
  if (dateOfBirthFrom || dateOfBirthTo) {
    filteredGuests = filteredGuests.filter(guest => {
      const guestDOB = new Date(guest.dateOfBirth);
      if (dateOfBirthFrom && guestDOB < new Date(dateOfBirthFrom)) return false;
      if (dateOfBirthTo && guestDOB > new Date(dateOfBirthTo)) return false;
      return true;
    });
    console.log(`👥 Filtered by DOB: ${filteredGuests.length} guests`);
  }

  // Apply reservation count filter
  if (minReservations || maxReservations) {
    filteredGuests = filteredGuests.filter(guest => {
      if (minReservations && guest.reservationCount < parseInt(minReservations)) return false;
      if (maxReservations && guest.reservationCount > parseInt(maxReservations)) return false;
      return true;
    });
    console.log(`👥 Filtered by reservation count: ${filteredGuests.length} guests`);
  }

  // Apply unit filter
  if (unit) {
    const unitArray = unit.split(',').map(u => u.trim());
    filteredGuests = filteredGuests.filter(guest =>
      guest.unit && unitArray.includes(guest.unit)
    );
    console.log(`👥 Filtered by unit: ${filteredGuests.length} guests`);
  }

  // Apply categories filter
  if (categories) {
    const categoriesArray = categories.split(',').map(c => c.trim());
    filteredGuests = filteredGuests.filter(guest =>
      guest.customCategories.some(cat => categoriesArray.includes(cat))
    );
    console.log(`👥 Filtered by categories: ${filteredGuests.length} guests`);
  }

  // Apply star guest filter
  if (starGuest === 'true') {
    filteredGuests = filteredGuests.filter(guest => guest.starGuest === true);
    console.log(`👥 Filtered by star guest: ${filteredGuests.length} guests`);
  }

  // Apply primary guest filter
  if (primaryGuest === 'true') {
    filteredGuests = filteredGuests.filter(guest => guest.primaryGuest === true);
    console.log(`👥 Filtered by primary guest: ${filteredGuests.length} guests`);
  }

  // Apply search term filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredGuests = filteredGuests.filter(guest =>
      guest.name.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      guest.phone.includes(searchTerm) ||
      guest.nationality.toLowerCase().includes(searchLower) ||
      (guest.comments && guest.comments.toLowerCase().includes(searchLower))
    );
    console.log(`👥 Filtered by search term '${searchTerm}': ${filteredGuests.length} guests`);
  }

  // Calculate age for each guest
  const guestsWithAge = filteredGuests.map(guest => ({
    ...guest,
    age: calculateAge(guest.dateOfBirth)
  }));

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedGuests = guestsWithAge.slice(startIndex, endIndex);

  console.log(`👥 Final result: { totalFiltered: ${filteredGuests.length}, paginated: ${paginatedGuests.length}, page: ${pageNum}, limit: ${limitNum} }`);

  res.json({
    success: true,
    data: paginatedGuests,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filteredGuests.length,
      totalPages: Math.ceil(filteredGuests.length / limitNum)
    }
  });
});

// Helper function to calculate age
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// GET /api/guests/stats - Get guest statistics (MUST be before /:id route)
app.get('/api/guests/stats', mockAuth, (req, res) => {
  console.log('👥 GET /api/guests/stats - Fetching guest statistics');

  const stats = {
    totalGuests: mockGuests.length,
    starGuests: mockGuests.filter(g => g.starGuest).length,
    primaryGuests: mockGuests.filter(g => g.primaryGuest).length,
    birthdaysThisMonth: mockGuests.filter(g => {
      const today = new Date();
      const birthDate = new Date(g.dateOfBirth);
      return birthDate.getMonth() === today.getMonth();
    }).length,
    averageReservations: Math.round(
      mockGuests.reduce((sum, g) => sum + g.reservationCount, 0) / mockGuests.length
    )
  };

  res.json({
    success: true,
    data: stats
  });
});

// GET /api/guests/:id - Get guest by ID
app.get('/api/guests/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👥 GET /api/guests/${id} - Fetching guest by ID`);

  const guest = mockGuests.find(g => g.id === id);
  
  if (!guest) {
    return res.status(404).json({
      success: false,
      message: 'Guest not found'
    });
  }

  const guestWithAge = {
    ...guest,
    age: calculateAge(guest.dateOfBirth)
  };

  res.json({
    success: true,
    data: guestWithAge
  });
});

// POST /api/guests - Create new guest
app.post('/api/guests', mockAuth, (req, res) => {
  console.log('👥 POST /api/guests - Creating new guest');
  const guestData = req.body;

  const newGuest = {
    id: `guest_${Date.now()}`,
    ...guestData,
    reservationCount: 0,
    createdBy: 'Current User',
    createdAt: new Date().toISOString(),
    lastModifiedBy: 'Current User',
    lastModifiedAt: new Date().toISOString()
  };

  mockGuests.push(newGuest);
  saveGuestsData(mockGuests);

  res.json({
    success: true,
    data: newGuest,
    message: 'Guest created successfully'
  });
});

// PUT /api/guests/:id - Update guest
app.put('/api/guests/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`👥 PUT /api/guests/${id} - Updating guest`);

  const guestIndex = mockGuests.findIndex(g => g.id === id);
  if (guestIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Guest not found'
    });
  }

  mockGuests[guestIndex] = {
    ...mockGuests[guestIndex],
    ...updateData,
    lastModifiedBy: 'Current User',
    lastModifiedAt: new Date().toISOString()
  };

  saveGuestsData(mockGuests);

  res.json({
    success: true,
    data: mockGuests[guestIndex],
    message: 'Guest updated successfully'
  });
});

// DELETE /api/guests/:id - Delete guest
app.delete('/api/guests/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👥 DELETE /api/guests/${id} - Deleting guest`);

  const guestIndex = mockGuests.findIndex(g => g.id === id);
  if (guestIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Guest not found'
    });
  }

  mockGuests.splice(guestIndex, 1);
  saveGuestsData(mockGuests);

  res.json({
    success: true,
    message: 'Guest deleted successfully'
  });
});

// GET /api/guests/:id/reservations - Get guest's reservations
app.get('/api/guests/:id/reservations', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👥 GET /api/guests/${id}/reservations - Fetching guest reservations`);

  const guest = mockGuests.find(g => g.id === id);
  if (!guest) {
    return res.status(404).json({
      success: false,
      message: 'Guest not found'
    });
  }

  // Filter reservations by guest name (in real app, would be by guestId)
  const guestReservations = mockReservations.filter(r => r.guestName === guest.name);

  res.json({
    success: true,
    data: guestReservations
  });
});

// GET /api/guests/:id/activity - Get guest's activity log
app.get('/api/guests/:id/activity', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👥 GET /api/guests/${id}/activity - Fetching guest activity`);

  const guest = mockGuests.find(g => g.id === id);
  if (!guest) {
    return res.status(404).json({
      success: false,
      message: 'Guest not found'
    });
  }

  // Generate activity log from guest data
  const activity = [];

  // Guest created
  activity.push({
    id: `activity_created_${guest.id}`,
    action: 'Guest Profile Created',
    details: `Profile created for ${guest.name}`,
    user: guest.createdBy,
    timestamp: guest.createdAt,
    type: 'create'
  });

  // Guest updated
  if (guest.lastModifiedAt && guest.lastModifiedAt !== guest.createdAt) {
    activity.push({
      id: `activity_updated_${guest.id}`,
      action: 'Profile Updated',
      details: 'Guest information was updated',
      user: guest.lastModifiedBy || guest.createdBy,
      timestamp: guest.lastModifiedAt,
      type: 'update'
    });
  }

  // Documents uploaded
  if (guest.documents && guest.documents.length > 0) {
    guest.documents.forEach((doc, index) => {
      activity.push({
        id: `activity_doc_${guest.id}_${index}`,
        action: 'Document Uploaded',
        details: `Uploaded ${doc.name}`,
        user: 'Admin',
        timestamp: doc.uploadedAt,
        type: 'document'
      });
    });
  }

  // Reservations created (from mockReservations)
  const guestReservations = mockReservations.filter(r => r.guestName === guest.name);
  guestReservations.forEach(reservation => {
    activity.push({
      id: `activity_reservation_${reservation.id}`,
      action: 'Reservation Created',
      details: `Booking for ${reservation.propertyName} (${reservation.checkIn} - ${reservation.checkOut})`,
      user: reservation.createdBy,
      timestamp: reservation.createdAt,
      type: 'reservation'
    });
  });

  // Sort by timestamp (most recent first)
  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    success: true,
    data: activity
  });
});

// GET /api/guests/:id/stats - Get guest statistics
app.get('/api/guests/:id/stats', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👥 GET /api/guests/${id}/stats - Fetching guest statistics`);

  const guest = mockGuests.find(g => g.id === id);
  if (!guest) {
    return res.status(404).json({
      success: false,
      message: 'Guest not found'
    });
  }

  // Calculate stats from reservations
  const guestReservations = mockReservations.filter(r => r.guestName === guest.name);
  
  const totalReservations = guestReservations.length;
  const totalNights = guestReservations.reduce((sum, r) => {
    const checkIn = new Date(r.checkIn);
    const checkOut = new Date(r.checkOut);
    const nights = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return sum + nights;
  }, 0);
  
  const lifetimeValue = guestReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const averageBookingValue = totalReservations > 0 ? lifetimeValue / totalReservations : 0;
  
  const completedReservations = guestReservations.filter(r => r.status === 'COMPLETED').length;
  const upcomingReservations = guestReservations.filter(r => 
    r.status === 'CONFIRMED' || r.status === 'PENDING'
  ).length;
  const cancelledReservations = guestReservations.filter(r => r.status === 'CANCELLED').length;

  const lastActivity = guest.lastModifiedAt || guest.createdAt;

  const stats = {
    totalReservations,
    totalNights,
    lifetimeValue,
    averageBookingValue: Math.round(averageBookingValue),
    completedReservations,
    upcomingReservations,
    cancelledReservations,
    lastActivity
  };

  res.json({
    success: true,
    data: stats
  });
});

// POST /api/guests/:id/documents - Upload document for guest
app.post('/api/guests/:id/documents', mockAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`👥 POST /api/guests/${id}/documents - Uploading document`);

  const guest = mockGuests.find(g => g.id === id);
  if (!guest) {
    return res.status(404).json({
      success: false,
      message: 'Guest not found'
    });
  }

  try {
    // In real implementation with multer, file would be in req.file
    // For mock, we'll accept file data in body
    const { filename, mimetype, size } = req.body;
    
    const fileKey = `guests/${id}/${Date.now()}_${filename}`;
    
    // Mock S3 upload
    const uploadResult = await s3Service.uploadFile(
      Buffer.alloc(size || 1024), // Mock buffer
      fileKey,
      'documents',
      mimetype || 'application/pdf'
    );

    const newDocument = {
      id: guest.documents ? guest.documents.length + 1 : 1,
      name: filename,
      type: mimetype || 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: `${Math.round((size || 1024) / 1024)}KB`,
      url: uploadResult.url,
      key: uploadResult.key
    };

    if (!guest.documents) {
      guest.documents = [];
    }
    guest.documents.push(newDocument);

    res.json({
      success: true,
      data: newDocument,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

// DELETE /api/guests/:id/documents/:docId - Delete guest document
app.delete('/api/guests/:id/documents/:docId', mockAuth, async (req, res) => {
  const { id, docId } = req.params;
  console.log(`👥 DELETE /api/guests/${id}/documents/${docId} - Deleting document`);

  const guest = mockGuests.find(g => g.id === id);
  if (!guest) {
    return res.status(404).json({
      success: false,
      message: 'Guest not found'
    });
  }

  if (!guest.documents) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  const docIndex = guest.documents.findIndex(d => d.id === parseInt(docId));
  if (docIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  try {
    const document = guest.documents[docIndex];
    
    // Delete from S3 if key exists
    if (document.key) {
      await s3Service.deleteFile(document.key);
    }

    guest.documents.splice(docIndex, 1);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

// ===== S3 FILE STORAGE ENDPOINTS =====

// Upload file endpoint with S3 integration
app.post('/api/upload', mockAuth, upload.single('file'), async (req, res) => {
  console.log('📤 POST /api/upload - Upload file to S3');
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const folder = req.body.folder || 'documents';
    const ownerId = req.body.ownerId || 'unknown';
    
    // Upload to S3
    const uploadResult = await s3Service.uploadFile(req.file, `${folder}/${ownerId}`);
    
    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file to S3',
        error: uploadResult.error
      });
    }

    const result = {
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
      bucket: uploadResult.bucket,
      size: req.file.size,
      filename: req.file.originalname,
      mimetype: req.file.mimetype
    };
    
    console.log('📤 S3 upload result:', result);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Get signed URL for download
app.get('/api/files/signed-url', mockAuth, async (req, res) => {
  const { key } = req.query;
  console.log(`📥 GET /api/files/signed-url - Generate signed URL for: ${key}`);
  
  if (!key) {
    return res.status(400).json({
      success: false,
      message: 'File key is required'
    });
  }
  
  try {
    const signedUrlResult = await s3Service.getSignedDownloadUrl(key, 3600);
    
    if (!signedUrlResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate signed URL',
        error: signedUrlResult.error
      });
    }
    
    res.json({
      success: true,
      url: signedUrlResult.url,
      expiresIn: 3600
    });
  } catch (error) {
    console.error('❌ Signed URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate signed URL',
      error: error.message
    });
  }
});

// Delete file
app.delete('/api/files/:key(*)', mockAuth, async (req, res) => {
  const key = req.params.key;
  console.log(`🗑️ DELETE /api/files/${key} - Delete file from S3`);
  
  try {
    const deleteResult = await s3Service.deleteFile(key);
    
    if (!deleteResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete file from S3',
        error: deleteResult.error
      });
    }
    
    res.json({
      success: true,
      message: deleteResult.message
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

// List files in folder
app.get('/api/files/list', mockAuth, (req, res) => {
  const { folder = '' } = req.query;
  console.log(`📁 GET /api/files/list - List files in folder: ${folder}`);
  
  res.json({
    success: true,
    files: [],
    message: 'File listing (mocked - install AWS SDK for real functionality)'
  });
});

// ===== OWNERS ENDPOINTS =====

// Default owners data
const defaultOwners = [
  {
    id: 'owner_1',
    firstName: 'Mohammed',
    lastName: 'Al-Maktoum',
    email: 'mohammed.almaktoum@example.com',
    phone: '+971 50 123 4567',
    nationality: 'Emirati',
    dateOfBirth: '1975-03-15',
    role: 'OWNER',
    isActive: true,
    properties: ['Burj Khalifa Penthouse', 'Palm Jumeirah Villa'],
    totalUnits: 5,
    comments: 'VIP owner with premium properties',
    createdAt: '2023-01-15T10:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-09-01T14:30:00Z',
    lastModifiedBy: 'manager',
    documents: [],
    bankDetails: [],
    transactions: [],
    activityLog: []
  },
  {
    id: 'owner_2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 555 234 5678',
    nationality: 'American',
    dateOfBirth: '1982-07-20',
    role: 'OWNER',
    isActive: true,
    properties: ['Marina Apartment'],
    totalUnits: 2,
    comments: 'Reliable owner, on-time payments',
    createdAt: '2023-03-20T11:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-08-15T09:20:00Z',
    lastModifiedBy: 'admin',
    documents: [],
    bankDetails: [],
    transactions: [],
    activityLog: []
  },
  {
    id: 'owner_3',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    email: 'ahmed.rashid@example.com',
    phone: '+971 55 987 6543',
    nationality: 'Emirati',
    dateOfBirth: '1988-11-10',
    role: 'OWNER',
    isActive: true,
    properties: ['Downtown Loft', 'Business Bay Studio'],
    totalUnits: 3,
    comments: 'New owner, growing portfolio',
    createdAt: '2024-01-10T12:00:00Z',
    createdBy: 'manager',
    lastModifiedAt: '2024-09-20T16:45:00Z',
    lastModifiedBy: 'manager',
    documents: [],
    bankDetails: [],
    transactions: [],
    activityLog: []
  },
  {
    id: 'owner_4',
    firstName: 'Elena',
    lastName: 'Petrova',
    email: 'elena.petrova@example.com',
    phone: '+7 915 123 4567',
    nationality: 'Russian',
    dateOfBirth: '1979-05-25',
    role: 'OWNER',
    isActive: false,
    properties: ['Skyline Penthouse'],
    totalUnits: 1,
    comments: 'Inactive - properties sold',
    createdAt: '2022-11-05T09:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-06-01T10:00:00Z',
    lastModifiedBy: 'admin',
    documents: [],
    bankDetails: [],
    transactions: [],
    activityLog: []
  },
  {
    id: 'owner_5',
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.anderson@example.com',
    phone: '+44 20 7123 4567',
    nationality: 'British',
    dateOfBirth: '1985-09-12',
    role: 'OWNER',
    isActive: true,
    properties: ['Beach Villa', 'City Apartment'],
    totalUnits: 4,
    comments: 'International investor',
    createdAt: '2023-06-18T14:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-09-25T11:10:00Z',
    lastModifiedBy: 'manager',
    documents: [],
    bankDetails: [],
    transactions: [],
    activityLog: []
  }
];

// Load owners data from file or use default
let mockOwners = loadOwnersData() || defaultOwners;

// Save initial data if file doesn't exist
if (!loadOwnersData()) {
  saveOwnersData(mockOwners);
  console.log('📁 Initial owners data saved to file');
}

// GET /api/users/owners - Get all owners with filtering
app.get('/api/users/owners', mockAuth, (req, res) => {
  console.log('👤 GET /api/users/owners - Fetching owners');
  console.log('Query params:', req.query);

  const { 
    search = '', 
    page = '1', 
    limit = '10',
    nationality,
    isActive,
    units,
    dateOfBirthFrom,
    dateOfBirthTo,
    phoneNumber,
    comments
  } = req.query;

  let filtered = [...mockOwners];

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(owner =>
      owner.firstName.toLowerCase().includes(searchLower) ||
      owner.lastName.toLowerCase().includes(searchLower) ||
      owner.email.toLowerCase().includes(searchLower) ||
      owner.phone.includes(search)
    );
  }

  // Nationality filter
  if (nationality) {
    const nationalities = nationality.split(',');
    filtered = filtered.filter(owner => nationalities.includes(owner.nationality));
  }

  // Active status filter
  if (isActive !== undefined) {
    const activeStatus = isActive === 'true';
    filtered = filtered.filter(owner => owner.isActive === activeStatus);
  }

  // Units filter (filter by property names)
  if (units) {
    const unitList = units.split(',');
    filtered = filtered.filter(owner =>
      owner.properties.some(prop => unitList.includes(prop))
    );
  }

  // Date of birth filter
  if (dateOfBirthFrom) {
    filtered = filtered.filter(owner => owner.dateOfBirth >= dateOfBirthFrom);
  }
  if (dateOfBirthTo) {
    filtered = filtered.filter(owner => owner.dateOfBirth <= dateOfBirthTo);
  }

  // Phone number filter
  if (phoneNumber) {
    filtered = filtered.filter(owner => owner.phone.includes(phoneNumber));
  }

  // Comments filter
  if (comments) {
    const commentsLower = comments.toLowerCase();
    filtered = filtered.filter(owner =>
      owner.comments && owner.comments.toLowerCase().includes(commentsLower)
    );
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginated = filtered.slice(startIndex, endIndex);

  console.log(`👤 Filtered: ${filtered.length}, Paginated: ${paginated.length}`);

  res.json({
    success: true,
    data: {
      users: paginated,
      pagination: {
        total: filtered.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filtered.length / limitNum)
      }
    }
  });
});

// GET /api/users/owners/:id - Get owner by ID
app.get('/api/users/owners/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👤 GET /api/users/owners/${id} - Fetching owner by ID`);

  const owner = mockOwners.find(o => o.id === id);
  
  if (!owner) {
    return res.status(404).json({
      success: false,
      message: 'Owner not found'
    });
  }

  // Ensure totalUnits is calculated correctly
  const ownerWithCalculatedUnits = {
    ...owner,
    totalUnits: owner.properties?.length || 0
  };

  console.log('📄 Owner documents:', owner.documents);
  res.json({
    success: true,
    data: ownerWithCalculatedUnits
  });
});

// POST /api/users/owners - Create new owner
app.post('/api/users/owners', mockAuth, (req, res) => {
  console.log('👤 POST /api/users/owners - Creating new owner');
  const ownerData = req.body;

  const newOwner = {
    id: `owner_${Date.now()}`,
    ...ownerData,
    role: 'OWNER',
    isActive: true,
    totalUnits: ownerData.properties?.length || 0,
    createdAt: new Date().toISOString(),
    createdBy: 'Current User',
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  mockOwners.push(newOwner);
  saveOwnersData(mockOwners);

  res.json({
    success: true,
    data: newOwner,
    message: 'Owner created successfully'
  });
});

// PUT /api/users/owners/:id - Update owner
app.put('/api/users/owners/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`👤 PUT /api/users/owners/${id} - Updating owner`);
  console.log('📄 Documents in update:', updateData.documents);

  const ownerIndex = mockOwners.findIndex(o => o.id === id);
  if (ownerIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Owner not found'
    });
  }

  // Auto-calculate totalUnits based on properties array length
  const calculatedTotalUnits = updateData.properties ? updateData.properties.length : mockOwners[ownerIndex].properties?.length || 0
  
  mockOwners[ownerIndex] = {
    ...mockOwners[ownerIndex],
    ...updateData,
    totalUnits: calculatedTotalUnits,
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  console.log('💾 Saving owner with documents:', mockOwners[ownerIndex].documents);
  saveOwnersData(mockOwners);

  res.json({
    success: true,
    data: mockOwners[ownerIndex],
    message: 'Owner updated successfully'
  });
});

// DELETE /api/users/owners/:id - Delete owner
app.delete('/api/users/owners/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👤 DELETE /api/users/owners/${id} - Deleting owner`);

  const ownerIndex = mockOwners.findIndex(o => o.id === id);
  if (ownerIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Owner not found'
    });
  }

  mockOwners.splice(ownerIndex, 1);
  saveOwnersData(mockOwners);

  res.json({
    success: true,
    message: 'Owner deleted successfully'
  });
});

// GET /api/users/stats - Get user statistics
app.get('/api/users/stats', mockAuth, (req, res) => {
  console.log('📊 GET /api/users/stats - Fetching user statistics');

  const stats = {
    totalUsers: mockOwners.length,
    usersByRole: [
      {
        role: 'OWNER',
        count: mockOwners.length
      },
      {
        role: 'AGENT',
        count: 0
      },
      {
        role: 'GUEST',
        count: mockGuests.length
      }
    ],
    activeUsers: mockOwners.filter(o => o.isActive).length,
    inactiveUsers: mockOwners.filter(o => !o.isActive).length
  };

  res.json({
    success: true,
    data: stats
  });
});

// ==================== AGENTS API ====================

// Mock agents data
let mockAgents = [
  {
    id: 1,
    name: 'Ahmed Al-Mansouri',
    email: 'ahmed.almansouri@email.com',
    phone: '+971 50 123 4567',
    nationality: 'UAE',
    birthday: '1985-03-15',
    unitsAttracted: 12,
    totalPayouts: 45000,
    lastPayoutDate: '2024-01-15',
    status: 'Active',
    joinDate: '2023-03-15',
    createdAt: '2023-03-15T00:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-15T00:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+44 20 1234 5678',
    nationality: 'UK',
    birthday: '1988-07-22',
    unitsAttracted: 8,
    totalPayouts: 32000,
    lastPayoutDate: '2024-01-10',
    status: 'Active',
    joinDate: '2023-05-10',
    createdAt: '2023-05-10T00:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-10T00:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 3,
    name: 'Mohammed Hassan',
    email: 'mohammed.hassan@email.com',
    phone: '+20 2 1234 5678',
    nationality: 'Egypt',
    birthday: '1990-11-08',
    unitsAttracted: 15,
    totalPayouts: 68000,
    lastPayoutDate: '2024-01-20',
    status: 'Active',
    joinDate: '2023-02-28',
    createdAt: '2023-02-28T00:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-20T00:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 4,
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    phone: '+61 2 1234 5678',
    nationality: 'Australia',
    birthday: '1987-04-14',
    unitsAttracted: 6,
    totalPayouts: 18000,
    lastPayoutDate: '2023-12-15',
    status: 'Inactive',
    joinDate: '2023-08-15',
    createdAt: '2023-08-15T00:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2023-12-15T00:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 555 123 4567',
    nationality: 'USA',
    birthday: '1983-09-30',
    unitsAttracted: 10,
    totalPayouts: 42000,
    lastPayoutDate: '2024-01-18',
    status: 'Active',
    joinDate: '2023-04-20',
    createdAt: '2023-04-20T00:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-18T00:00:00.000Z',
    lastModifiedBy: 'System'
  }
];

// Function to save agents data
function saveAgentsData(agents) {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'data', 'agents.json');
    fs.writeFileSync(dataPath, JSON.stringify(agents, null, 2));
    console.log('✅ Agents data saved to file');
  } catch (error) {
    console.error('❌ Error saving agents data:', error);
  }
}

// Function to load agents data
function loadAgentsData() {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'data', 'agents.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      mockAgents = JSON.parse(data);
      console.log('📁 Initial agents data loaded from file');
    } else {
      saveAgentsData(mockAgents);
    }
  } catch (error) {
    console.error('❌ Error loading agents data:', error);
  }
}

// Load agents data on startup
loadAgentsData();

// GET /api/agents - Get all agents with filters
app.get('/api/agents', mockAuth, (req, res) => {
  console.log('👥 GET /api/agents - Fetching agents');
  const {
    search = '',
    status = '',
    nationality = '',
    joinDateFrom = '',
    joinDateTo = '',
    page = '1',
    limit = '50'
  } = req.query;

  console.log('👥 Query params:', req.query);

  let filtered = [...mockAgents];

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(agent =>
      agent.name.toLowerCase().includes(searchLower) ||
      agent.email.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (status) {
    filtered = filtered.filter(agent => agent.status === status);
  }

  // Nationality filter
  if (nationality) {
    filtered = filtered.filter(agent => agent.nationality === nationality);
  }


  // Join date range filter
  if (joinDateFrom || joinDateTo) {
    filtered = filtered.filter(agent => {
      const agentJoinDate = new Date(agent.joinDate);
      if (joinDateFrom) {
        const fromDate = new Date(joinDateFrom);
        if (agentJoinDate < fromDate) return false;
      }
      if (joinDateTo) {
        const toDate = new Date(joinDateTo);
        if (agentJoinDate > toDate) return false;
      }
      return true;
    });
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginated = filtered.slice(startIndex, endIndex);

  console.log(`👥 Final result: { totalFiltered: ${filtered.length}, paginated: ${paginated.length}, page: ${pageNum}, limit: ${limitNum} }`);

  res.json({
    success: true,
    data: paginated,
    total: filtered.length,
    page: pageNum,
    limit: limitNum
  });
});

// GET /api/agents/stats - Get agent statistics
app.get('/api/agents/stats', mockAuth, (req, res) => {
  console.log('📊 GET /api/agents/stats - Fetching agent statistics');
  
  const totalAgents = mockAgents.length;
  const activeAgents = mockAgents.filter(agent => agent.status === 'Active').length;
  const totalUnits = mockAgents.reduce((sum, agent) => sum + agent.unitsAttracted, 0);
  const totalPayouts = mockAgents.reduce((sum, agent) => sum + agent.totalPayouts, 0);

  const stats = {
    totalAgents,
    activeAgents,
    totalUnits,
    totalPayouts
  };

  res.json({
    success: true,
    data: stats
  });
});

// GET /api/agents/:id - Get agent by ID
app.get('/api/agents/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👥 GET /api/agents/${id} - Fetching agent by ID`);

  const agent = mockAgents.find(a => a.id === parseInt(id));
  
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  res.json({
    success: true,
    data: agent
  });
});

// POST /api/agents - Create new agent
app.post('/api/agents', mockAuth, (req, res) => {
  console.log('👥 POST /api/agents - Creating new agent');
  const agentData = req.body;

  const newAgent = {
    id: Math.max(...mockAgents.map(a => a.id)) + 1,
    ...agentData,
    status: agentData.status || 'Active',
    createdAt: new Date().toISOString(),
    createdBy: 'Current User',
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  mockAgents.push(newAgent);
  saveAgentsData(mockAgents);

  res.json({
    success: true,
    data: newAgent,
    message: 'Agent created successfully'
  });
});

// PUT /api/agents/:id - Update agent
app.put('/api/agents/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`👥 PUT /api/agents/${id} - Updating agent`);

  const agentIndex = mockAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  mockAgents[agentIndex] = {
    ...mockAgents[agentIndex],
    ...updateData,
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  saveAgentsData(mockAgents);

  res.json({
    success: true,
    data: mockAgents[agentIndex],
    message: 'Agent updated successfully'
  });
});

// DELETE /api/agents/:id - Delete agent
app.delete('/api/agents/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👥 DELETE /api/agents/${id} - Deleting agent`);

  const agentIndex = mockAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  mockAgents.splice(agentIndex, 1);
  saveAgentsData(mockAgents);

  res.json({
    success: true,
    message: 'Agent deleted successfully'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log(`📅 Reservations: http://localhost:${PORT}/api/reservations`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`\n🎯 Ready to serve reservations API!`);
});
