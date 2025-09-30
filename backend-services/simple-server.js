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

// Mock data for reservations
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
    adjustments: [],
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
    adjustments: [],
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
    adjustments: [],
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
