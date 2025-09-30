const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Rate limiting (relaxed for development)
if (process.env.DISABLE_RATE_LIMIT !== 'true') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
  console.log('🛡️ Rate limiting enabled: 1000 requests per 15 minutes');
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
