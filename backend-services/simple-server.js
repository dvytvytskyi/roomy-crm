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
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

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

function loadSettingsData() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading settings data:', error);
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

// Rate limiting (very relaxed for development)
if (process.env.DISABLE_RATE_LIMIT !== 'true') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100000, // limit each IP to 100000 requests per windowMs (very high for development)
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
  console.log('🛡️ Rate limiting enabled: 100000 requests per 15 minutes');
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

// Real reservations data with extended structure
const realReservations = [
  {
    id: 'res_1',
    propertyId: 'prop_1',
    propertyName: 'Luxury Apartment Downtown Dubai',
    propertyType: 'APARTMENT',
    propertyAddress: 'Burj Khalifa Boulevard, Dubai, UAE',
    propertyCity: 'Dubai',
    guestId: 'guest_1',
    guestName: 'Emma Thompson',
    guestEmail: 'emma.thompson@email.com',
    guestPhone: '+971501234567',
    guestWhatsapp: '+971501234567',
    checkIn: '2025-01-15T15:00:00.000Z',
    checkOut: '2025-01-18T12:00:00.000Z',
    status: 'CONFIRMED',
    paymentStatus: 'FULLY_PAID',
    guestStatus: 'UPCOMING',
    source: 'AIRBNB',
    totalAmount: 1560,
    paidAmount: 1560,
    outstandingBalance: 0,
    nights: 3,
    guests: 2,
    guestCount: 2,
    specialRequests: 'Late checkout requested, anniversary celebration',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
    createdBy: {
      name: 'Ahmed Al-Mansouri',
      email: 'ahmed.mansouri@roomy.com'
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
    propertyAddress: 'Palm Jumeirah, Dubai, UAE',
    propertyCity: 'Dubai',
    guestId: 'guest_2',
    guestName: 'Michael Chen',
    guestEmail: 'michael.chen@email.com',
    guestPhone: '+971507654321',
    guestWhatsapp: '+971507654321',
    checkIn: '2025-02-20T15:00:00.000Z',
    checkOut: '2025-02-25T12:00:00.000Z',
    status: 'PENDING',
    paymentStatus: 'PARTIAL_PAID',
    guestStatus: 'UPCOMING',
    source: 'BOOKING_COM',
    totalAmount: 4250,
    paidAmount: 2125,
    outstandingBalance: 2125,
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

  let filteredReservations = [...realReservations];

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
  
  const reservation = realReservations.find(r => r.id === id);
  
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
    totalReservations: realReservations.length,
    confirmedReservations: realReservations.filter(r => r.status === 'CONFIRMED').length,
    pendingReservations: realReservations.filter(r => r.status === 'PENDING').length,
    cancelledReservations: realReservations.filter(r => r.status === 'CANCELLED').length,
    completedReservations: realReservations.filter(r => r.status === 'COMPLETED').length,
    totalRevenue: realReservations.reduce((sum, r) => sum + r.totalAmount, 0),
    averageStay: realReservations.reduce((sum, r) => sum + r.nights, 0) / realReservations.length,
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
  
  const calendar = realReservations.map(r => ({
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

// ==================== PROPERTIES API ====================
  
// Real properties data with agent assignments
let mockProperties = [
    {
      id: 'prop_1',
      name: 'Luxury Apartment Downtown Dubai',
      type: 'APARTMENT',
      address: 'Burj Khalifa Boulevard, Dubai, UAE',
      city: 'Dubai',
      capacity: 4,
      bedrooms: 2,
      bathrooms: 2,
      pricePerNight: 520,
      primaryImage: 'https://example.com/image1.jpg',
      agentId: 1, // Assigned to Ahmed Al-Mansouri
      agentName: 'Ahmed Al-Mansouri',
      status: 'Active',
      createdAt: '2023-04-10T00:00:00.000Z',
      lastModifiedAt: '2023-04-10T00:00:00.000Z',
      size: '85 m²',
      beds: '2 bedrooms • 2 bathrooms',
      checkIn: '15:00',
      checkOut: '12:00',
      description: 'Luxury apartment in the heart of Downtown Dubai with stunning views of Burj Khalifa. Modern amenities and premium location make this the perfect choice for business and leisure travelers.',
      occupancyRate: 85,
      occupancyNights: 26,
      totalNights: 31,
      avgCostPerNight: 3200,
      monthlyPayout: 83200,
      owner: {
        id: 'owner_001',
        name: 'Ahmed Al-Rashid',
        country: 'United Arab Emirates',
        flag: '🇦🇪',
        birthDate: '15.06.1985',
        age: 38,
        units: 5,
        email: 'ahmed.alrashid@email.com',
        phone: '+971 50 123 4567',
        status: 'active'
      },
      amenities: ['Air conditioning', 'WiFi', 'Pool', 'Gym', 'Parking', 'Kitchen', 'Washing machine', 'TV', 'Balcony', 'Security', 'Concierge', 'Rooftop terrace'],
      rules: ['No smoking', 'No pets', 'No parties', 'Quiet hours 22:00-08:00', 'ID required at check-in']
  },
  {
    id: 'prop_2',
    name: 'Beach Villa Palm Jumeirah',
    type: 'VILLA',
    address: 'Palm Jumeirah, Dubai, UAE',
    city: 'Dubai',
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    pricePerNight: 850,
    primaryImage: 'https://example.com/image2.jpg',
    agentId: 1, // Assigned to Ahmed Al-Mansouri
    agentName: 'Ahmed Al-Mansouri',
    status: 'Active',
    createdAt: '2023-05-15T00:00:00.000Z',
    lastModifiedAt: '2023-05-15T00:00:00.000Z',
    size: '180 m²',
    beds: '4 bedrooms • 3 bathrooms',
    checkIn: '15:00',
    checkOut: '12:00',
    description: 'Stunning beachfront villa on Palm Jumeirah with private beach access, infinity pool, and panoramic views of the Arabian Gulf. Perfect for families and large groups seeking luxury and privacy.',
    occupancyRate: 78,
    occupancyNights: 24,
    totalNights: 31,
    avgCostPerNight: 6800,
    monthlyPayout: 163200,
    owner: {
      id: 'owner_002',
      name: 'Fatima Al-Zahra',
      country: 'United Arab Emirates',
      flag: '🇦🇪',
      birthDate: '22.03.1990',
      age: 33,
      units: 3,
      email: 'fatima.alzahra@email.com',
      phone: '+971 50 987 6543',
      status: 'active'
    },
    amenities: ['Private beach', 'Infinity pool', 'Air conditioning', 'WiFi', 'Gym', 'Parking', 'Kitchen', 'Washing machine', 'TV', 'Balcony', 'Security', 'Concierge', 'Garden', 'BBQ area'],
    rules: ['No smoking', 'No pets', 'No parties', 'Quiet hours 22:00-08:00', 'ID required at check-in', 'Maximum 8 guests']
  },
  {
    id: 'prop_3',
    name: 'Burj Khalifa 2BR',
    type: 'APARTMENT',
    address: 'Downtown Dubai, UAE',
      city: 'Dubai',
      capacity: 4,
      bedrooms: 2,
      bathrooms: 2,
    pricePerNight: 400,
    primaryImage: 'https://example.com/image3.jpg',
    agentId: 1, // Assigned to Ahmed Al-Mansouri
    agentName: 'Ahmed Al-Mansouri',
    status: 'Active',
    createdAt: '2023-06-20T00:00:00.000Z',
    lastModifiedAt: '2023-06-20T00:00:00.000Z'
  },
  {
    id: 'prop_4',
    name: 'JBR Beachfront 3BR',
    type: 'APARTMENT',
    address: 'JBR, Dubai, UAE',
    city: 'Dubai',
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
    pricePerNight: 450,
    primaryImage: 'https://example.com/image4.jpg',
    agentId: 1, // Assigned to Ahmed Al-Mansouri
    agentName: 'Ahmed Al-Mansouri',
    status: 'Active',
    createdAt: '2023-07-05T00:00:00.000Z',
    lastModifiedAt: '2023-07-05T00:00:00.000Z'
  },
  {
    id: 'prop_5',
    name: 'Palm Villa 4BR',
      type: 'VILLA',
    address: 'Palm Jumeirah, Dubai, UAE',
      city: 'Dubai',
      capacity: 8,
      bedrooms: 4,
    bathrooms: 4,
    pricePerNight: 800,
    primaryImage: 'https://example.com/image5.jpg',
    agentId: 2, // Assigned to Sarah Johnson
    agentName: 'Sarah Johnson',
    status: 'Active',
    createdAt: '2023-06-01T00:00:00.000Z',
    lastModifiedAt: '2023-06-01T00:00:00.000Z'
  },
  {
    id: 'prop_6',
    name: 'Marina Penthouse',
    type: 'PENTHOUSE',
    address: 'Dubai Marina, UAE',
    city: 'Dubai',
    capacity: 6,
    bedrooms: 3,
      bathrooms: 3,
    pricePerNight: 1000,
    primaryImage: 'https://example.com/image6.jpg',
    agentId: 2, // Assigned to Sarah Johnson
    agentName: 'Sarah Johnson',
    status: 'Active',
    createdAt: '2023-07-15T00:00:00.000Z',
    lastModifiedAt: '2023-07-15T00:00:00.000Z'
  }
];

// Function to save properties data
function savePropertiesData(properties) {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'data', 'properties.json');
    fs.writeFileSync(dataPath, JSON.stringify(properties, null, 2));
    console.log('✅ Properties data saved to file');
  } catch (error) {
    console.error('❌ Error saving properties data:', error);
  }
}

// Function to load properties data
function loadPropertiesData() {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'data', 'properties.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      mockProperties = JSON.parse(data);
      console.log('📁 Initial properties data loaded from file');
    } else {
      savePropertiesData(mockProperties);
    }
  } catch (error) {
    console.error('❌ Error loading properties data:', error);
  }
}

// Load properties data on startup
loadPropertiesData();

// ==================== MAINTENANCE API ====================

// Mock maintenance data
let mockMaintenanceTasks = [
  {
    id: 1,
    title: 'Fix Kitchen Faucet',
    unit: 'Apartment Burj Khalifa 2',
    unitId: 'burj-khalifa-2',
    technician: 'Mike Johnson',
    technicianId: 'mike-johnson',
    status: 'In Progress',
    priority: 'High',
    type: 'Plumbing',
    scheduledDate: '2024-01-15',
    estimatedDuration: '2 hours',
    description: 'Kitchen faucet is leaking and needs repair',
    cost: 150,
    notes: 'Guest reported leak in kitchen',
    createdAt: '2024-01-14T10:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-15T08:30:00.000Z',
    lastModifiedBy: 'Mike Johnson'
  },
  {
    id: 2,
    title: 'AC Unit Maintenance',
    unit: 'Marina View Studio',
    unitId: 'marina-view-studio',
    technician: 'Sarah Wilson',
    technicianId: 'sarah-wilson',
    status: 'Scheduled',
    priority: 'Normal',
    type: 'HVAC',
    scheduledDate: '2024-01-16',
    estimatedDuration: '3 hours',
    description: 'Regular AC maintenance and filter replacement',
    cost: 200,
    createdAt: '2024-01-14T11:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-14T11:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 3,
    title: 'Electrical Outlet Repair',
    unit: 'Downtown Loft 2BR',
    unitId: 'downtown-loft-2br',
    technician: 'David Chen',
    technicianId: 'david-chen',
    status: 'Completed',
    priority: 'Urgent',
    type: 'Electrical',
    scheduledDate: '2024-01-14',
    estimatedDuration: '1 hour',
    description: 'Master bedroom outlet not working',
    cost: 120,
    notes: 'Fixed loose wire connection',
    createdAt: '2024-01-13T14:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-14T16:00:00.000Z',
    lastModifiedBy: 'David Chen'
  },
  {
    id: 4,
    title: 'Door Lock Replacement',
    unit: 'JBR Beach Apartment',
    unitId: 'jbr-beach-apartment',
    technician: 'Alex Rodriguez',
    technicianId: 'alex-rodriguez',
    status: 'On Hold',
    priority: 'Normal',
    type: 'General',
    scheduledDate: '2024-01-17',
    estimatedDuration: '1.5 hours',
    description: 'Replace faulty door lock mechanism',
    cost: 180,
    createdAt: '2024-01-14T12:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-15T09:00:00.000Z',
    lastModifiedBy: 'Alex Rodriguez'
  },
  {
    id: 5,
    title: 'Water Heater Inspection',
    unit: 'Apartment Burj Khalifa 2',
    unitId: 'burj-khalifa-2',
    technician: 'Mike Johnson',
    technicianId: 'mike-johnson',
    status: 'Scheduled',
    priority: 'Low',
    type: 'Plumbing',
    scheduledDate: '2024-01-18',
    estimatedDuration: '2 hours',
    description: 'Annual water heater inspection and maintenance',
    cost: 100,
    createdAt: '2024-01-14T13:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-14T13:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 6,
    title: 'Light Fixture Installation',
    unit: 'Palm Villa 4BR',
    unitId: 'palm-villa-4br',
    technician: 'Sarah Wilson',
    technicianId: 'sarah-wilson',
    status: 'Scheduled',
    priority: 'Normal',
    type: 'Electrical',
    scheduledDate: '2024-01-19',
    estimatedDuration: '2.5 hours',
    description: 'Install new chandelier in dining room',
    cost: 250,
    createdAt: '2024-01-14T14:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-14T14:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 7,
    title: 'HVAC Filter Replacement',
    unit: 'Marina Penthouse',
    unitId: 'marina-penthouse',
    technician: 'David Chen',
    technicianId: 'david-chen',
    status: 'Completed',
    priority: 'Low',
    type: 'HVAC',
    scheduledDate: '2024-01-13',
    estimatedDuration: '1 hour',
    description: 'Replace all HVAC filters',
    cost: 80,
    notes: 'All filters replaced successfully',
    createdAt: '2024-01-12T10:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-13T11:00:00.000Z',
    lastModifiedBy: 'David Chen',
    comments: [
      {
        id: 1,
        author: 'Current User',
        date: '2025-10-02T12:27:32.952Z',
        text: 'фіаоуцащоуца',
        type: 'user'
      }
    ],
    attachments: [
      { id: 1, name: 'RECEIPT_res_2_2025-09-30 (1).pdf', size: '7.1 KB', type: 'application/pdf', s3Key: 'maintenance/7/receipt.pdf', s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/maintenance/7/receipt.pdf' }
    ],
    beforePhotos: [
      { id: 1, name: 'Porsche 911 GT3 wallpaper side view mobile.jpeg', size: '104.0 KB', s3Key: 'maintenance/7/before/porsche.jpg', s3Url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center' },
      { id: 2, name: 'IMG_0540.jpg', size: '99.1 KB', s3Key: 'maintenance/7/before/img_0540.jpg', s3Url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center' }
    ],
    afterPhotos: [
      { id: 1, name: 'clean_hvac.jpg', size: '1.2 MB', s3Key: 'maintenance/7/after/clean_hvac.jpg', s3Url: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?w=400&h=400&fit=crop&crop=center' }
    ]
  },
  {
    id: 8,
    title: 'Emergency Pipe Repair',
    unit: 'Downtown Loft 1BR',
    unitId: 'downtown-loft-1br',
    technician: 'Mike Johnson',
    technicianId: 'mike-johnson',
    status: 'In Progress',
    priority: 'Urgent',
    type: 'Emergency',
    scheduledDate: '2024-01-15',
    estimatedDuration: '4 hours',
    description: 'Burst pipe in bathroom causing water damage',
    cost: 400,
    notes: 'Emergency repair in progress',
    createdAt: '2024-01-15T07:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-15T07:30:00.000Z',
    lastModifiedBy: 'Mike Johnson',
    comments: [
      {
        id: 1,
        author: 'Mike Johnson',
        date: '2024-01-15T07:00:00.000Z',
        text: 'Emergency call received. On my way to assess the damage.',
        type: 'contractor'
      },
      {
        id: 2,
        author: 'Mike Johnson',
        date: '2024-01-15T07:30:00.000Z',
        text: 'Arrived on site. Pipe burst confirmed. Starting emergency repair.',
        type: 'contractor'
      }
    ],
    attachments: [
      { id: 1, name: 'Emergency_Quote.pdf', size: '245 KB', type: 'pdf', s3Key: 'maintenance/8/emergency_quote.pdf', s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/maintenance/8/emergency_quote.pdf' },
      { id: 2, name: 'Damage_Assessment.pdf', size: '180 KB', type: 'pdf', s3Key: 'maintenance/8/damage_assessment.pdf', s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/maintenance/8/damage_assessment.pdf' }
    ],
    beforePhotos: [
      { id: 1, name: 'burst_pipe.jpg', size: '2.1 MB', s3Key: 'maintenance/8/before/burst_pipe.jpg', s3Url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center' },
      { id: 2, name: 'water_damage.jpg', size: '1.8 MB', s3Key: 'maintenance/8/before/water_damage.jpg', s3Url: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?w=400&h=400&fit=crop&crop=center' }
    ],
    afterPhotos: [
      { id: 1, name: 'repaired_pipe.jpg', size: '2.3 MB', s3Key: 'maintenance/8/after/repaired_pipe.jpg', s3Url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center' }
    ]
  }
];

// ==================== CLEANING TASKS DATA ====================

// Mock cleaning tasks data
let mockCleaningTasks = [
  {
    id: 1,
    unit: 'Apartment Burj Khalifa 2',
    unitId: 'burj-khalifa-2',
    type: 'Regular Clean',
    status: 'Scheduled',
    scheduledDate: '2024-01-15',
    scheduledTime: '10:00',
    duration: '2 hours',
    cleaner: 'Clean Pro Services',
    cleanerId: 'clean-pro-services',
    cost: 120,
    notes: 'Regular weekly cleaning',
    createdAt: '2024-01-14T10:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-14T10:00:00.000Z',
    lastModifiedBy: 'System',
    comments: [
      {
        id: 1,
        author: 'Clean Pro Services',
        date: '2024-01-15T10:15:00.000Z',
        text: 'Started regular cleaning. Kitchen appliances cleaned and sanitized.',
        type: 'cleaner'
      },
      {
        id: 2,
        author: 'Clean Pro Services',
        date: '2024-01-15T12:30:00.000Z',
        text: 'Bathroom cleaning completed. All surfaces sanitized and towels replaced.',
        type: 'cleaner'
      }
    ],
    checklist: [
      { id: 1, item: 'Floors mopped', completed: true },
      { id: 2, item: 'Trash emptied', completed: true },
      { id: 3, item: 'Dust all surfaces', completed: false }
    ],
    staticChecklist: [true, true, false, false, true, false]
  },
  {
    id: 2,
    unit: 'Marina View Studio',
    unitId: 'marina-view-studio',
    type: 'Deep Clean',
    status: 'Completed',
    scheduledDate: '2024-01-14',
    scheduledTime: '14:00',
    duration: '4 hours',
    cleaner: 'Sparkle Clean',
    cleanerId: 'sparkle-clean',
    cost: 200,
    notes: 'Deep cleaning after guest checkout',
    createdAt: '2024-01-13T15:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-14T18:00:00.000Z',
    lastModifiedBy: 'Sparkle Clean'
  },
  {
    id: 3,
    unit: 'Downtown Loft 2BR',
    unitId: 'downtown-loft-2br',
    type: 'Post-Checkout',
    status: 'Scheduled',
    scheduledDate: '2024-01-16',
    scheduledTime: '09:00',
    duration: '3 hours',
    cleaner: 'Professional Cleaners',
    cleanerId: 'professional-cleaners',
    cost: 150,
    notes: 'Post-checkout cleaning for new guest arrival',
    createdAt: '2024-01-15T08:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-15T08:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 4,
    unit: 'JBR Beach Apartment',
    unitId: 'jbr-beach-apartment',
    type: 'Pre-Arrival',
    status: 'Completed',
    scheduledDate: '2024-01-13',
    scheduledTime: '11:00',
    duration: '2.5 hours',
    cleaner: 'Quick Clean',
    cleanerId: 'quick-clean',
    cost: 130,
    notes: 'Pre-arrival cleaning completed',
    createdAt: '2024-01-12T16:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-13T13:30:00.000Z',
    lastModifiedBy: 'Quick Clean'
  },
  {
    id: 5,
    unit: 'Business Bay Office',
    unitId: 'business-bay-office',
    type: 'Office Clean',
    status: 'Scheduled',
    scheduledDate: '2024-01-17',
    scheduledTime: '08:00',
    duration: '1.5 hours',
    cleaner: 'Elite Cleaning',
    cleanerId: 'elite-cleaning',
    cost: 100,
    notes: 'Weekly office cleaning',
    createdAt: '2024-01-16T09:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-16T09:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 6,
    unit: 'DIFC Penthouse',
    unitId: 'difc-penthouse',
    type: 'Mid-Stay',
    status: 'Completed',
    scheduledDate: '2024-01-12',
    scheduledTime: '15:00',
    duration: '2 hours',
    cleaner: 'Clean Pro Services',
    cleanerId: 'clean-pro-services',
    cost: 140,
    notes: 'Mid-stay cleaning for long-term guest. Guest requested extra attention to kitchen appliances and bathroom sanitization.\n\n[1/12/2024, 3:30:00 PM] Sarah Johnson: Kitchen appliances need extra attention due to guest cooking heavy meals.\n\n[1/12/2024, 4:15:00 PM] John Smith: Bathroom tiles have some stubborn stains that require special cleaning products.',
    createdAt: '2024-01-11T12:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-12T17:00:00.000Z',
    lastModifiedBy: 'Clean Pro Services',
    includesLaundry: true,
    laundryCount: 12,
    linenComments: 'Bed sheets and towels need special care due to guest allergies',
    comments: [
      {
        id: 1,
        author: 'Sarah Johnson (Clean Pro Services)',
        date: '2024-01-12T15:15:00.000Z',
        text: 'Started mid-stay cleaning. Kitchen appliances cleaned and sanitized.',
        type: 'cleaner'
      },
      {
        id: 2,
        author: 'Sarah Johnson (Clean Pro Services)',
        date: '2024-01-12T16:30:00.000Z',
        text: 'Bathroom cleaning completed. All surfaces sanitized and towels replaced.',
        type: 'cleaner'
      },
      {
        id: 3,
        author: 'Sarah Johnson (Clean Pro Services)',
        date: '2024-01-12T17:00:00.000Z',
        text: 'Mid-stay cleaning completed. Apartment ready for guest continuation.',
        type: 'completion'
      },
      {
        id: 4,
        author: 'John Smith (Inspector)',
        date: '2024-01-12T17:30:00.000Z',
        text: 'Quality inspection passed. Apartment meets all cleanliness standards.',
        type: 'inspection'
      }
    ],
    checklist: [
      { id: 1, item: 'Floors mopped', completed: true },
      { id: 2, item: 'Trash emptied', completed: true },
      { id: 3, item: 'Dust all surfaces', completed: true },
      { id: 4, item: 'Vacuum carpets', completed: true },
      { id: 5, item: 'Clean mirrors', completed: true }
    ],
    staticChecklist: [true, true, true, true, true, true]
  },
  {
    id: 7,
    unit: 'JLT Studio',
    unitId: 'jlt-studio',
    type: 'Regular Clean',
    status: 'Cancelled',
    scheduledDate: '2024-01-14',
    scheduledTime: '16:00',
    duration: '1.5 hours',
    cleaner: 'Sparkle Clean',
    cleanerId: 'sparkle-clean',
    cost: 90,
    notes: 'Cancelled due to guest request',
    createdAt: '2024-01-13T14:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-14T10:00:00.000Z',
    lastModifiedBy: 'System'
  },
  {
    id: 8,
    unit: 'Arabian Ranches Villa',
    unitId: 'arabian-ranches-villa',
    type: 'Deep Clean',
    status: 'Scheduled',
    scheduledDate: '2024-01-18',
    scheduledTime: '10:00',
    duration: '5 hours',
    cleaner: 'Professional Cleaners',
    cleanerId: 'professional-cleaners',
    cost: 300,
    notes: 'Deep cleaning for villa after long-term rental',
    createdAt: '2024-01-17T11:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-17T11:00:00.000Z',
    lastModifiedBy: 'System'
  }
];

// Function to save cleaning data
function saveCleaningData(tasks) {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'data', 'cleaning.json');
    fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error saving cleaning data:', error);
  }
}

// Function to load cleaning data
function loadCleaningData() {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'data', 'cleaning.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      mockCleaningTasks = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading cleaning data:', error);
  }
}

// Load cleaning data on startup
loadCleaningData();

// Function to save maintenance data
function saveMaintenanceData(tasks) {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'data', 'maintenance.json');
    fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2));
    console.log('✅ Maintenance data saved to file');
  } catch (error) {
    console.error('❌ Error saving maintenance data:', error);
  }
}

// Function to load maintenance data
function loadMaintenanceData() {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'data', 'maintenance.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      mockMaintenanceTasks = JSON.parse(data);
      console.log('📁 Initial maintenance data loaded from file');
    } else {
      saveMaintenanceData(mockMaintenanceTasks);
    }
  } catch (error) {
    console.error('❌ Error loading maintenance data:', error);
  }
}

// Load maintenance data on startup
loadMaintenanceData();

// GET /api/maintenance - Get all maintenance tasks
app.get('/api/maintenance', mockAuth, (req, res) => {
  console.log('🔧 GET /api/maintenance - Fetching maintenance tasks');
  
  const { 
    search, 
    status, 
    priority, 
    type, 
    scheduledDateFrom,
    scheduledDateTo,
    page = 1,
    limit = 50
  } = req.query;

  let filteredTasks = [...mockMaintenanceTasks];

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTasks = filteredTasks.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      task.unit.toLowerCase().includes(searchLower) ||
      task.technician.toLowerCase().includes(searchLower)
    );
  }

  if (status) {
    const statusArray = Array.isArray(status) ? status : [status];
    filteredTasks = filteredTasks.filter(task => statusArray.includes(task.status));
  }

  if (priority) {
    const priorityArray = Array.isArray(priority) ? priority : [priority];
    filteredTasks = filteredTasks.filter(task => priorityArray.includes(task.priority));
  }

  if (type) {
    const typeArray = Array.isArray(type) ? type : [type];
    filteredTasks = filteredTasks.filter(task => typeArray.includes(task.type));
  }


  if (scheduledDateFrom) {
    filteredTasks = filteredTasks.filter(task => task.scheduledDate >= scheduledDateFrom);
  }

  if (scheduledDateTo) {
    filteredTasks = filteredTasks.filter(task => task.scheduledDate <= scheduledDateTo);
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedTasks,
    total: filteredTasks.length,
    page: pageNum,
    limit: limitNum
  });
});

// GET /api/maintenance/stats - Get maintenance statistics
app.get('/api/maintenance/stats', mockAuth, (req, res) => {
  console.log('📊 GET /api/maintenance/stats - Fetching maintenance statistics');
  
  const totalTasks = mockMaintenanceTasks.length;
  const scheduledTasks = mockMaintenanceTasks.filter(task => task.status === 'Scheduled').length;
  const inProgressTasks = mockMaintenanceTasks.filter(task => task.status === 'In Progress').length;
  const completedTasks = mockMaintenanceTasks.filter(task => task.status === 'Completed').length;

  const stats = {
    totalTasks,
    scheduledTasks,
    inProgressTasks,
    completedTasks
  };

  res.json({
    success: true,
    data: stats
  });
});

// GET /api/maintenance/:id - Get maintenance task by ID
app.get('/api/maintenance/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`🔧 GET /api/maintenance/${id} - Fetching maintenance task by ID`);

  const task = mockMaintenanceTasks.find(t => t.id === parseInt(id));
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  res.json({
    success: true,
    data: task
  });
});

// POST /api/maintenance - Create new maintenance task
app.post('/api/maintenance', mockAuth, (req, res) => {
  console.log('🔧 POST /api/maintenance - Creating new maintenance task');
  const taskData = req.body;

  const newTask = {
    id: Math.max(...mockMaintenanceTasks.map(t => t.id)) + 1,
    ...taskData,
    status: taskData.status || 'Scheduled',
    createdAt: new Date().toISOString(),
    createdBy: 'Current User',
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  mockMaintenanceTasks.push(newTask);
  saveMaintenanceData(mockMaintenanceTasks);

  res.json({
    success: true,
    data: newTask,
    message: 'Maintenance task created successfully'
  });
});

// PUT /api/maintenance/:id - Update maintenance task
app.put('/api/maintenance/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`🔧 PUT /api/maintenance/${id} - Updating maintenance task`);

  const taskIndex = mockMaintenanceTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  mockMaintenanceTasks[taskIndex] = {
    ...mockMaintenanceTasks[taskIndex],
    ...updateData,
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  saveMaintenanceData(mockMaintenanceTasks);

  res.json({
    success: true,
    data: mockMaintenanceTasks[taskIndex],
    message: 'Maintenance task updated successfully'
  });
});

// DELETE /api/maintenance/:id - Delete maintenance task
app.delete('/api/maintenance/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`🔧 DELETE /api/maintenance/${id} - Deleting maintenance task`);

  const taskIndex = mockMaintenanceTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  mockMaintenanceTasks.splice(taskIndex, 1);
  saveMaintenanceData(mockMaintenanceTasks);

  res.json({
    success: true,
    message: 'Maintenance task deleted successfully'
  });
});

// ==================== MAINTENANCE COMMENTS API ====================

// GET /api/maintenance/:id/comments - Get comments for maintenance task
app.get('/api/maintenance/:id/comments', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`💬 GET /api/maintenance/${id}/comments - Fetching comments`);

  const task = mockMaintenanceTasks.find(t => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  res.json({
    success: true,
    data: task.comments || []
  });
});

// POST /api/maintenance/:id/comments - Add comment to maintenance task
app.post('/api/maintenance/:id/comments', mockAuth, (req, res) => {
  const { id } = req.params;
  const { text, type = 'user' } = req.body;
  console.log(`💬 POST /api/maintenance/${id}/comments - Adding comment`);

  const taskIndex = mockMaintenanceTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  const task = mockMaintenanceTasks[taskIndex];
  if (!task.comments) {
    task.comments = [];
  }

  const newComment = {
    id: Math.max(...task.comments.map(c => c.id), 0) + 1,
    author: 'Current User',
    date: new Date().toISOString(),
    text,
    type
  };

  task.comments.push(newComment);
  task.lastModifiedAt = new Date().toISOString();
  task.lastModifiedBy = 'Current User';

  saveMaintenanceData(mockMaintenanceTasks);

  res.json({
    success: true,
    data: newComment,
    message: 'Comment added successfully'
  });
});

// ==================== MAINTENANCE ATTACHMENTS API ====================

// GET /api/maintenance/:id/attachments - Get attachments for maintenance task
app.get('/api/maintenance/:id/attachments', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`📎 GET /api/maintenance/${id}/attachments - Fetching attachments`);

  const task = mockMaintenanceTasks.find(t => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  res.json({
    success: true,
    data: task.attachments || []
  });
});

// POST /api/maintenance/:id/attachments - Add attachment to maintenance task
app.post('/api/maintenance/:id/attachments', mockAuth, (req, res) => {
  const { id } = req.params;
  const { name, size, type, s3Key, s3Url } = req.body;
  console.log(`📎 POST /api/maintenance/${id}/attachments - Adding attachment`);

  const taskIndex = mockMaintenanceTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  const task = mockMaintenanceTasks[taskIndex];
  if (!task.attachments) {
    task.attachments = [];
  }

  const newAttachment = {
    id: Math.max(...task.attachments.map(a => a.id), 0) + 1,
    name,
    size,
    type,
    s3Key,
    s3Url
  };

  task.attachments.push(newAttachment);
  task.lastModifiedAt = new Date().toISOString();
  task.lastModifiedBy = 'Current User';

  saveMaintenanceData(mockMaintenanceTasks);

  res.json({
    success: true,
    data: newAttachment,
    message: 'Attachment added successfully'
  });
});

// ==================== MAINTENANCE PHOTOS API ====================

// GET /api/maintenance/:id/photos - Get photos for maintenance task
app.get('/api/maintenance/:id/photos', mockAuth, (req, res) => {
  const { id } = req.params;
  const { type } = req.query; // 'before' or 'after'
  console.log(`📸 GET /api/maintenance/${id}/photos - Fetching photos`);

  const task = mockMaintenanceTasks.find(t => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  let photos = [];
  if (type === 'before') {
    photos = task.beforePhotos || [];
  } else if (type === 'after') {
    photos = task.afterPhotos || [];
  } else {
    photos = [...(task.beforePhotos || []), ...(task.afterPhotos || [])];
  }

  res.json({
    success: true,
    data: photos
  });
});

// POST /api/maintenance/:id/photos - Add photo to maintenance task
app.post('/api/maintenance/:id/photos', mockAuth, (req, res) => {
  const { id } = req.params;
  const { name, size, type, s3Key, s3Url } = req.body; // type: 'before' or 'after'
  console.log(`📸 POST /api/maintenance/${id}/photos - Adding photo`);

  const taskIndex = mockMaintenanceTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance task not found'
    });
  }

  const task = mockMaintenanceTasks[taskIndex];
  const photoArray = type === 'before' ? 'beforePhotos' : 'afterPhotos';
  
  if (!task[photoArray]) {
    task[photoArray] = [];
  }

  const newPhoto = {
    id: Math.max(...task[photoArray].map(p => p.id), 0) + 1,
    name,
    size,
    s3Key,
    s3Url
  };

  task[photoArray].push(newPhoto);
  task.lastModifiedAt = new Date().toISOString();
  task.lastModifiedBy = 'Current User';

  saveMaintenanceData(mockMaintenanceTasks);

  res.json({
    success: true,
    data: newPhoto,
    message: 'Photo added successfully'
  });
});

// ==================== CLEANING TASKS API ====================

// GET /api/cleaning - Get all cleaning tasks with filters
app.get('/api/cleaning', mockAuth, (req, res) => {
  const { 
    search, 
    status, 
    type, 
    cleaner,
    page = 1, 
    limit = 50 
  } = req.query;
  
  console.log('🧹 GET /api/cleaning - Fetching cleaning tasks');

  let filteredTasks = [...mockCleaningTasks];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTasks = filteredTasks.filter(task => 
      task.unit.toLowerCase().includes(searchLower) ||
      task.type.toLowerCase().includes(searchLower) ||
      task.cleaner.toLowerCase().includes(searchLower) ||
      task.notes?.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (status) {
    const statusArray = Array.isArray(status) ? status : [status];
    filteredTasks = filteredTasks.filter(task => statusArray.includes(task.status));
  }

  // Apply type filter
  if (type) {
    const typeArray = Array.isArray(type) ? type : [type];
    filteredTasks = filteredTasks.filter(task => typeArray.includes(task.type));
  }

  // Apply cleaner filter
  if (cleaner) {
    const cleanerArray = Array.isArray(cleaner) ? cleaner : [cleaner];
    filteredTasks = filteredTasks.filter(task => cleanerArray.includes(task.cleaner));
  }

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedTasks,
    total: filteredTasks.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

// GET /api/cleaning/stats - Get cleaning statistics
app.get('/api/cleaning/stats', mockAuth, (req, res) => {
  console.log('📊 GET /api/cleaning/stats - Fetching cleaning statistics');

  const totalTasks = mockCleaningTasks.length;
  const scheduledTasks = mockCleaningTasks.filter(task => task.status === 'Scheduled').length;
  const completedTasks = mockCleaningTasks.filter(task => task.status === 'Completed').length;
  const cancelledTasks = mockCleaningTasks.filter(task => task.status === 'Cancelled').length;

  res.json({
    success: true,
    data: {
      totalTasks,
      scheduledTasks,
      completedTasks,
      cancelledTasks
    }
  });
});

// GET /api/cleaning/:id - Get single cleaning task
app.get('/api/cleaning/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`🧹 GET /api/cleaning/${id} - Fetching cleaning task`);

  const task = mockCleaningTasks.find(t => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }

  res.json({
    success: true,
    data: task
  });
});

// POST /api/cleaning - Create new cleaning task
app.post('/api/cleaning', mockAuth, (req, res) => {
  const taskData = req.body;
  console.log('🧹 POST /api/cleaning - Creating cleaning task');

  const newTask = {
    id: Math.max(...mockCleaningTasks.map(t => t.id), 0) + 1,
    ...taskData,
    createdAt: new Date().toISOString(),
    createdBy: 'Current User',
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  mockCleaningTasks.push(newTask);
  saveCleaningData(mockCleaningTasks);

  res.status(201).json({
    success: true,
    data: newTask,
    message: 'Cleaning task created successfully'
  });
});

// PUT /api/cleaning/:id - Update cleaning task
app.put('/api/cleaning/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`🧹 PUT /api/cleaning/${id} - Updating cleaning task`);

  const taskIndex = mockCleaningTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }

  mockCleaningTasks[taskIndex] = {
    ...mockCleaningTasks[taskIndex],
    ...updateData,
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  saveCleaningData(mockCleaningTasks);

  res.json({
    success: true,
    data: mockCleaningTasks[taskIndex],
    message: 'Cleaning task updated successfully'
  });
});

// DELETE /api/cleaning/:id - Delete cleaning task
app.delete('/api/cleaning/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`🧹 DELETE /api/cleaning/${id} - Deleting cleaning task`);

  const taskIndex = mockCleaningTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }

  mockCleaningTasks.splice(taskIndex, 1);
  saveCleaningData(mockCleaningTasks);

  res.json({
    success: true,
    message: 'Cleaning task deleted successfully'
  });
});

// ==================== CLEANING TASK DETAILS API ====================

// GET /api/cleaning/:id/comments - Get comments for a cleaning task
app.get('/api/cleaning/:id/comments', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`💬 GET /api/cleaning/${id}/comments - Fetching comments`);
  
  const task = mockCleaningTasks.find(t => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }
  
  res.json({
    success: true,
    data: task.comments || []
  });
});

// POST /api/cleaning/:id/comments - Add a comment to a cleaning task
app.post('/api/cleaning/:id/comments', mockAuth, (req, res) => {
  const { id } = req.params;
  const { text, type = 'user' } = req.body;
  console.log(`💬 POST /api/cleaning/${id}/comments - Adding comment`);
  
  const taskIndex = mockCleaningTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }
  
  const newComment = {
    id: Math.max(...(mockCleaningTasks[taskIndex].comments || []).map(c => c.id), 0) + 1,
    author: 'Current User',
    date: new Date().toISOString(),
    text,
    type
  };
  
  if (!mockCleaningTasks[taskIndex].comments) {
    mockCleaningTasks[taskIndex].comments = [];
  }
  mockCleaningTasks[taskIndex].comments.push(newComment);
  mockCleaningTasks[taskIndex].lastModifiedAt = new Date().toISOString();
  mockCleaningTasks[taskIndex].lastModifiedBy = 'Current User';
  
  saveCleaningData(mockCleaningTasks);
  
  res.json({
    success: true,
    data: newComment,
    message: 'Comment added successfully'
  });
});

// GET /api/cleaning/:id/checklist - Get checklist for a cleaning task
app.get('/api/cleaning/:id/checklist', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`✅ GET /api/cleaning/${id}/checklist - Fetching checklist`);
  
  const task = mockCleaningTasks.find(t => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      checklist: task.checklist || [],
      staticChecklist: task.staticChecklist || []
    }
  });
});

// POST /api/cleaning/:id/checklist - Add a checklist item to a cleaning task
app.post('/api/cleaning/:id/checklist', mockAuth, (req, res) => {
  const { id } = req.params;
  const { item } = req.body;
  console.log(`✅ POST /api/cleaning/${id}/checklist - Adding checklist item`);
  
  const taskIndex = mockCleaningTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }
  
  if (!mockCleaningTasks[taskIndex].checklist) {
    mockCleaningTasks[taskIndex].checklist = [];
  }
  
  // Check if item already exists
  const exists = mockCleaningTasks[taskIndex].checklist.some(item => item.item.toLowerCase() === item.toLowerCase());
  if (exists) {
    return res.status(400).json({
      success: false,
      message: 'Checklist item already exists'
    });
  }
  
  const newItem = {
    id: Math.max(...mockCleaningTasks[taskIndex].checklist.map(item => item.id), 0) + 1,
    item,
    completed: false
  };
  
  mockCleaningTasks[taskIndex].checklist.push(newItem);
  mockCleaningTasks[taskIndex].lastModifiedAt = new Date().toISOString();
  mockCleaningTasks[taskIndex].lastModifiedBy = 'Current User';
  
  saveCleaningData(mockCleaningTasks);
  
  res.json({
    success: true,
    data: newItem,
    message: 'Checklist item added successfully'
  });
});

// PUT /api/cleaning/:id/checklist/:itemId - Update a checklist item
app.put('/api/cleaning/:id/checklist/:itemId', mockAuth, (req, res) => {
  const { id, itemId } = req.params;
  const { completed } = req.body;
  console.log(`✅ PUT /api/cleaning/${id}/checklist/${itemId} - Updating checklist item`);
  
  const taskIndex = mockCleaningTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }
  
  if (!mockCleaningTasks[taskIndex].checklist) {
    return res.status(404).json({
      success: false,
      message: 'Checklist not found'
    });
  }
  
  const itemIndex = mockCleaningTasks[taskIndex].checklist.findIndex(item => item.id === parseInt(itemId));
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Checklist item not found'
    });
  }
  
  mockCleaningTasks[taskIndex].checklist[itemIndex].completed = completed;
  mockCleaningTasks[taskIndex].lastModifiedAt = new Date().toISOString();
  mockCleaningTasks[taskIndex].lastModifiedBy = 'Current User';
  
  saveCleaningData(mockCleaningTasks);
  
  res.json({
    success: true,
    data: mockCleaningTasks[taskIndex].checklist[itemIndex],
    message: 'Checklist item updated successfully'
  });
});

// DELETE /api/cleaning/:id/checklist/:itemId - Delete a checklist item
app.delete('/api/cleaning/:id/checklist/:itemId', mockAuth, (req, res) => {
  const { id, itemId } = req.params;
  console.log(`✅ DELETE /api/cleaning/${id}/checklist/${itemId} - Deleting checklist item`);
  
  const taskIndex = mockCleaningTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }
  
  if (!mockCleaningTasks[taskIndex].checklist) {
    return res.status(404).json({
      success: false,
      message: 'Checklist not found'
    });
  }
  
  const itemIndex = mockCleaningTasks[taskIndex].checklist.findIndex(item => item.id === parseInt(itemId));
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Checklist item not found'
    });
  }
  
  mockCleaningTasks[taskIndex].checklist.splice(itemIndex, 1);
  mockCleaningTasks[taskIndex].lastModifiedAt = new Date().toISOString();
  mockCleaningTasks[taskIndex].lastModifiedBy = 'Current User';
  
  saveCleaningData(mockCleaningTasks);
  
  res.json({
    success: true,
    message: 'Checklist item deleted successfully'
  });
});

// PUT /api/cleaning/:id/static-checklist - Update static checklist items
app.put('/api/cleaning/:id/static-checklist', mockAuth, (req, res) => {
  const { id } = req.params;
  const { staticChecklist } = req.body;
  console.log(`✅ PUT /api/cleaning/${id}/static-checklist - Updating static checklist`);
  
  const taskIndex = mockCleaningTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }
  
  mockCleaningTasks[taskIndex].staticChecklist = staticChecklist;
  mockCleaningTasks[taskIndex].lastModifiedAt = new Date().toISOString();
  mockCleaningTasks[taskIndex].lastModifiedBy = 'Current User';
  
  saveCleaningData(mockCleaningTasks);
  
  res.json({
    success: true,
    data: mockCleaningTasks[taskIndex].staticChecklist,
    message: 'Static checklist updated successfully'
  });
});

// PUT /api/cleaning/:id/notes - Update notes for a cleaning task
app.put('/api/cleaning/:id/notes', mockAuth, (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  console.log(`📝 PUT /api/cleaning/${id}/notes - Updating notes`);
  
  const taskIndex = mockCleaningTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cleaning task not found'
    });
  }
  
  mockCleaningTasks[taskIndex].notes = notes;
  mockCleaningTasks[taskIndex].lastModifiedAt = new Date().toISOString();
  mockCleaningTasks[taskIndex].lastModifiedBy = 'Current User';
  
  saveCleaningData(mockCleaningTasks);
  
  res.json({
    success: true,
    data: mockCleaningTasks[taskIndex],
    message: 'Notes updated successfully'
  });
});

// GET /api/properties - Get all properties
app.get('/api/properties', mockAuth, (req, res) => {
  console.log('🏠 GET /api/properties - Fetching properties');
  
  res.json({
    success: true,
    data: mockProperties,
    total: mockProperties.length
  });
});

// GET /api/properties/:id - Get property by ID
app.get('/api/properties/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`🏠 GET /api/properties/${id} - Fetching property by ID`);

  const property = mockProperties.find(p => p.id === id);
  
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  res.json({
    success: true,
    data: property
  });
});

// POST /api/properties - Create new property
app.post('/api/properties', mockAuth, (req, res) => {
  console.log('🏠 POST /api/properties - Creating new property');
  console.log('📝 Property data:', req.body);

  const propertyData = req.body;

  // Generate new property ID
  const newId = `prop_${mockProperties.length + 1}`;

  // Create new property object
  const newProperty = {
    id: newId,
    name: propertyData.name || 'Unnamed Property',
    type: propertyData.type || 'APARTMENT',
    address: propertyData.address || '',
    city: propertyData.city || 'Dubai',
    capacity: propertyData.capacity || 4,
    bedrooms: propertyData.bedrooms || 1,
    bathrooms: propertyData.bathrooms || 2,
    area: propertyData.area || 100,
    pricePerNight: propertyData.pricePerNight || 100,
    description: propertyData.description || '',
    amenities: propertyData.amenities || [],
    primaryImage: propertyData.primaryImage || '',
    agentId: propertyData.agentId || null,
    agentName: propertyData.agentName || null,
    status: propertyData.status || 'Active',
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString()
  };

  // Add to mockProperties array
  mockProperties.push(newProperty);

  // Save updated data
  savePropertiesData(mockProperties);

  console.log('✅ New property created:', newProperty);

  res.status(201).json({
    success: true,
    data: newProperty,
    message: 'Property created successfully'
  });
});

// PUT /api/properties/:id - Update property (including agent assignment)
app.put('/api/properties/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`🏠 PUT /api/properties/${id} - Updating property`);

  const propertyIndex = mockProperties.findIndex(p => p.id === id);
  if (propertyIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // If agentId is being updated, also update agentName
  if (updateData.agentId) {
    const agent = realAgents.find(a => a.id === updateData.agentId);
    if (agent) {
      updateData.agentName = agent.name;
    }
  }

  mockProperties[propertyIndex] = {
    ...mockProperties[propertyIndex],
    ...updateData,
    lastModifiedAt: new Date().toISOString()
  };

  savePropertiesData(mockProperties);

  res.json({
    success: true,
    data: mockProperties[propertyIndex],
    message: 'Property updated successfully'
  });
});

// DELETE /api/properties/:id - Delete property
app.delete('/api/properties/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ DELETE /api/properties/${id} - Deleting property`);

  const propertyIndex = mockProperties.findIndex(p => p.id === id);
  if (propertyIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Remove property from array
  const deletedProperty = mockProperties.splice(propertyIndex, 1)[0];
  
  // Save updated data
  savePropertiesData(mockProperties);

  res.json({
    success: true,
    data: deletedProperty,
    message: 'Property deleted successfully'
  });
});

app.get('/api/reservations/available-properties', mockAuth, (req, res) => {
  console.log('🏠 GET /api/reservations/available-properties - Fetching available properties');
  
  res.json({
    success: true,
    data: mockProperties,
    message: 'Available properties retrieved successfully'
  });
});

// PriceLab Integration Routes
// GET /api/pricing/pricelab/recommendations - Get price recommendations
app.get('/api/pricing/pricelab/recommendations', mockAuth, (req, res) => {
  const { propertyId, startDate, endDate } = req.query;
  console.log(`💰 GET /api/pricing/pricelab/recommendations - Property: ${propertyId}, Dates: ${startDate} to ${endDate}`);
  
  // Mock price recommendations data
  const mockRecommendations = [
    {
      id: 'rec_1',
      propertyId: propertyId,
      date: startDate || '2025-01-15',
      recommendedPrice: 450,
      currentPrice: 400,
      marketPrice: 480,
      confidence: 85,
      reason: 'High demand period with local events',
      factors: {
        demand: 85,
        seasonality: 90,
        events: 75,
        competition: 80
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rec_2',
      propertyId: propertyId,
      date: startDate || '2025-01-16',
      recommendedPrice: 420,
      currentPrice: 400,
      marketPrice: 440,
      confidence: 78,
      reason: 'Moderate demand with good weather forecast',
      factors: {
        demand: 70,
        seasonality: 85,
        events: 60,
        competition: 75
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: mockRecommendations,
    message: 'Price recommendations retrieved successfully'
  });
});

// GET /api/pricing/pricelab/market-data - Get market data
app.get('/api/pricing/pricelab/market-data', mockAuth, (req, res) => {
  const { location } = req.query;
  console.log(`📊 GET /api/pricing/pricelab/market-data - Location: ${location}`);
  
  const mockMarketData = {
    location: location || 'Dubai',
    averagePrice: 385,
    occupancyRate: 72,
    demandScore: 78,
    competitionLevel: 65,
    seasonalTrends: [
      { month: 1, averagePrice: 380, occupancy: 70 },
      { month: 2, averagePrice: 420, occupancy: 75 },
      { month: 3, averagePrice: 450, occupancy: 80 },
      { month: 4, averagePrice: 400, occupancy: 68 },
      { month: 5, averagePrice: 350, occupancy: 60 },
      { month: 6, averagePrice: 320, occupancy: 55 }
    ],
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockMarketData,
    message: 'Market data retrieved successfully'
  });
});

// POST /api/pricing/pricelab/apply - Apply price recommendations
app.post('/api/pricing/pricelab/apply', mockAuth, (req, res) => {
  const { propertyId, recommendationIds } = req.body;
  console.log(`✅ POST /api/pricing/pricelab/apply - Property: ${propertyId}, Recommendations: ${recommendationIds?.length || 0}`);
  
  res.json({
    success: true,
    message: `Successfully applied ${recommendationIds?.length || 0} price recommendations`,
    data: {
      propertyId,
      appliedRecommendations: recommendationIds,
      updatedAt: new Date().toISOString()
    }
  });
});

// POST /api/pricing/pricelab/sync - Sync property data
app.post('/api/pricing/pricelab/sync', mockAuth, (req, res) => {
  const { propertyId } = req.body;
  console.log(`🔄 POST /api/pricing/pricelab/sync - Property: ${propertyId}`);
  
  res.json({
    success: true,
    message: 'Property data synced successfully with PriceLab',
    data: {
      propertyId,
      syncedAt: new Date().toISOString()
    }
  });
});

// POST /api/pricing/pricelab/optimize - Optimize prices
app.post('/api/pricing/pricelab/optimize', mockAuth, (req, res) => {
  const { propertyId, strategy } = req.body;
  console.log(`🎯 POST /api/pricing/pricelab/optimize - Property: ${propertyId}, Strategy: ${strategy}`);
  
  const mockOptimizedPrices = {
    propertyId,
    strategy,
    recommendations: [
      {
        id: 'opt_1',
        date: '2025-01-15',
        recommendedPrice: 480,
        currentPrice: 400,
        confidence: 90
      }
    ],
    projectedRevenue: 12500,
    projectedOccupancy: 78,
    generatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockOptimizedPrices,
    message: 'Prices optimized successfully'
  });
});

// GET /api/pricing/pricelab/insights - Get market insights
app.get('/api/pricing/pricelab/insights', mockAuth, (req, res) => {
  const { propertyId } = req.query;
  console.log(`🔍 GET /api/pricing/pricelab/insights - Property: ${propertyId}`);
  
  const mockInsights = {
    propertyId,
    marketPosition: 'below',
    priceCompetitiveness: 85,
    demandTrend: 'increasing',
    recommendations: [
      'Consider increasing price by 10-15% during peak season',
      'Monitor competitor pricing in your area',
      'Optimize for weekend bookings'
    ],
    lastAnalyzed: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockInsights,
    message: 'Market insights retrieved successfully'
  });
});

// GET /api/pricing/pricelab/strategies - Get pricing strategies
app.get('/api/pricing/pricelab/strategies', mockAuth, (req, res) => {
  console.log('📋 GET /api/pricing/pricelab/strategies - Fetching pricing strategies');
  
  const mockStrategies = [
    {
      id: 'strategy_1',
      name: 'Revenue Maximization',
      description: 'Focus on maximizing total revenue with optimal pricing',
      rules: {
        minPrice: 200,
        maxPrice: 800,
        demandMultiplier: 1.2,
        seasonalityMultiplier: 1.5
      },
      isActive: true
    },
    {
      id: 'strategy_2',
      name: 'Occupancy Optimization',
      description: 'Focus on maintaining high occupancy rates',
      rules: {
        minPrice: 150,
        maxPrice: 600,
        demandMultiplier: 0.9,
        seasonalityMultiplier: 1.1
      },
      isActive: false
    }
  ];

  res.json({
    success: true,
    data: mockStrategies,
    message: 'Pricing strategies retrieved successfully'
  });
});

// PUT /api/pricing/pricelab/config - Update PriceLab configuration
app.put('/api/pricing/pricelab/config', mockAuth, (req, res) => {
  const config = req.body;
  console.log('⚙️ PUT /api/pricing/pricelab/config - Updating PriceLab configuration');
  
  // In real implementation, save to database
  res.json({
    success: true,
    message: 'PriceLab configuration updated successfully',
    data: {
      ...config,
      updatedAt: new Date().toISOString()
    }
  });
});

// GET /api/pricing/pricelab/config - Get PriceLab configuration
app.get('/api/pricing/pricelab/config', mockAuth, (req, res) => {
  console.log('⚙️ GET /api/pricing/pricelab/config - Fetching PriceLab configuration');
  
  // Load from settings file
  const settingsData = loadSettingsData();
  const pricelabConfig = settingsData?.platform?.pricelab || {
    enabled: false,
    apiKey: '',
    autoUpdate: false,
    syncFrequency: 'daily',
    defaultStrategy: ''
  };

  res.json({
    success: true,
    data: {
      ...pricelabConfig,
      syncFrequency: 'daily',
      defaultStrategy: 'strategy_1'
    },
    message: 'PriceLab configuration retrieved successfully'
  });
});

// GET /api/pricing/pricelab/test - Test API connection
app.get('/api/pricing/pricelab/test', mockAuth, (req, res) => {
  console.log('🔌 GET /api/pricing/pricelab/test - Testing PriceLab API connection');
  
  // Mock connection test
  const isConnected = Math.random() > 0.3; // 70% success rate for demo
  
  res.json({
    success: isConnected,
    message: isConnected ? 'PriceLab API connection successful' : 'PriceLab API connection failed',
    data: {
      connected: isConnected,
      testedAt: new Date().toISOString(),
      responseTime: Math.floor(Math.random() * 500) + 100
    }
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
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  // Update reservation
  realReservations[reservationIndex] = {
    ...realReservations[reservationIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: realReservations[reservationIndex],
    message: 'Reservation updated successfully'
  });
});

// Add note to reservation
app.post('/api/reservations/:id/notes', mockAuth, (req, res) => {
  const { id } = req.params;
  const { content, type = 'internal', priority = 'normal' } = req.body;
  console.log(`📝 POST /api/reservations/${id}/notes - Adding note`);
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
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
  
  if (!realReservations[reservationIndex].notesList) {
    realReservations[reservationIndex].notesList = [];
  }
  realReservations[reservationIndex].notesList.push(newNote);
  realReservations[reservationIndex].updatedAt = new Date().toISOString();
  
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
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = realReservations[reservationIndex];
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
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = realReservations[reservationIndex];
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
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
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
  
  if (!realReservations[reservationIndex].payments) {
    realReservations[reservationIndex].payments = [];
  }
  realReservations[reservationIndex].payments.push(newPayment);
  
  // Update payment amounts
  const reservation = realReservations[reservationIndex];
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
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
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
  
  if (!realReservations[reservationIndex].adjustments) {
    realReservations[reservationIndex].adjustments = [];
  }
  realReservations[reservationIndex].adjustments.push(newAdjustment);
  
  // Update total amount
  realReservations[reservationIndex].totalAmount += newAdjustment.amount;
  realReservations[reservationIndex].outstandingBalance += newAdjustment.amount;
  realReservations[reservationIndex].updatedAt = new Date().toISOString();
  
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
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = realReservations[reservationIndex];
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
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
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
  
  realReservations[reservationIndex].checkIn = checkIn;
  realReservations[reservationIndex].checkOut = checkOut;
  realReservations[reservationIndex].nights = nights;
  realReservations[reservationIndex].updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: realReservations[reservationIndex],
    message: 'Dates updated successfully'
  });
});

// Update reservation pricing
app.put('/api/reservations/:id/pricing', mockAuth, (req, res) => {
  const { id } = req.params;
  const { pricePerNight, totalAmount } = req.body;
  console.log(`💰 PUT /api/reservations/${id}/pricing - Updating pricing`);
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = realReservations[reservationIndex];
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
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
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
  
  if (!realReservations[reservationIndex].communicationHistory) {
    realReservations[reservationIndex].communicationHistory = [];
  }
  realReservations[reservationIndex].communicationHistory.push(newCommunication);
  realReservations[reservationIndex].updatedAt = new Date().toISOString();
  
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
  
  const reservationIndex = realReservations.findIndex(r => r.id === id);
  if (reservationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  const reservation = realReservations[reservationIndex];
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
  const guestReservations = realReservations.filter(r => r.guestName === guest.name);

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

  // Reservations created (from realReservations)
  const guestReservations = realReservations.filter(r => r.guestName === guest.name);
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
  const guestReservations = realReservations.filter(r => r.guestName === guest.name);
  
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

// Real owners data with detailed information
const defaultOwners = [
  {
    id: 'owner_1',
    firstName: 'Mohammed',
    lastName: 'Al-Maktoum',
    email: 'mohammed.almaktoum@roomy.com',
    phone: '+971 50 123 4567',
    nationality: 'Emirati',
    dateOfBirth: '1975-03-15',
    role: 'OWNER',
    isActive: true,
    properties: ['Burj Khalifa Penthouse', 'Palm Jumeirah Villa'],
    totalUnits: 2,
    comments: 'VIP owner with premium properties. Excellent payment history and responsive communication.',
    createdAt: '2023-01-15T10:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-09-01T14:30:00Z',
    lastModifiedBy: 'manager',
    documents: [
      {
        id: 1,
        name: 'Passport Copy.pdf',
        type: 'Passport',
        uploadedAt: '2023-01-15T10:00:00Z',
        size: '2.1 MB',
        s3Key: 'documents/owner_1/passport.pdf',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/owner_1/passport.pdf'
      },
      {
        id: 2,
        name: 'Property Deed.pdf',
        type: 'Legal Document',
        uploadedAt: '2023-01-15T10:05:00Z',
        size: '1.8 MB',
        s3Key: 'documents/owner_1/property_deed.pdf',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/owner_1/property_deed.pdf'
      }
    ],
    bankDetails: [
      {
        id: 1,
        bankName: 'Emirates NBD',
        accountHolderName: 'Mohammed Al-Maktoum',
        accountNumber: '1234567890123456',
        iban: 'AE070331234567890123456',
        swiftCode: 'EBILAEAD',
        bankAddress: 'Sheikh Zayed Road, Dubai, UAE',
        isPrimary: true,
        addedDate: '2023-01-15T10:00:00Z',
        addedBy: 'admin',
        addedByEmail: 'admin@roomy.com'
      }
    ],
    transactions: [
      {
        id: 1,
        type: 'payment',
        amount: 45000,
        currency: 'AED',
        description: 'Monthly rental income - Burj Khalifa Penthouse',
        bankDetailId: 1,
        status: 'completed',
        date: '2024-09-01T10:00:00Z',
        processedBy: 'Manager',
        processedByEmail: 'manager@roomy.com',
        reference: 'PAY-2024-001',
        title: 'Monthly Rental Income',
        responsible: 'Sarah Johnson'
      },
      {
        id: 2,
        type: 'payment',
        amount: 32000,
        currency: 'AED',
        description: 'Monthly rental income - Palm Jumeirah Villa',
        bankDetailId: 1,
        status: 'completed',
        date: '2024-09-01T10:00:00Z',
        processedBy: 'Manager',
        processedByEmail: 'manager@roomy.com',
        reference: 'PAY-2024-002',
        title: 'Monthly Rental Income',
        responsible: 'Sarah Johnson'
      }
    ],
    activityLog: [
      {
        id: 1,
        action: 'Property Added',
        description: 'Burj Khalifa Penthouse added to portfolio',
        date: '2023-01-15T10:00:00Z',
        performedBy: 'admin'
      },
      {
        id: 2,
        action: 'Payment Received',
        description: 'Monthly payment of AED 77,000 received',
        date: '2024-09-01T10:00:00Z',
        performedBy: 'manager'
      }
    ]
  },
  {
    id: 'owner_2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@roomy.com',
    phone: '+1 555 234 5678',
    nationality: 'American',
    dateOfBirth: '1982-07-20',
    role: 'OWNER',
    isActive: true,
    properties: ['Marina Apartment Complex'],
    totalUnits: 1,
    comments: 'Reliable owner with excellent payment history. Prefers email communication and quarterly reports.',
    createdAt: '2023-03-20T11:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-08-15T09:20:00Z',
    lastModifiedBy: 'admin',
    documents: [
      {
        id: 3,
        name: 'US Passport.pdf',
        type: 'Passport',
        uploadedAt: '2023-03-20T11:00:00Z',
        size: '1.9 MB',
        s3Key: 'documents/owner_2/passport.pdf',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/owner_2/passport.pdf'
      }
    ],
    bankDetails: [
      {
        id: 2,
        bankName: 'Chase Bank',
        accountHolderName: 'Sarah Johnson',
        accountNumber: '9876543210987654',
        iban: 'US64SVBKUS6S3300958879',
        swiftCode: 'CHASUS33',
        bankAddress: '270 Park Avenue, New York, NY 10017',
        isPrimary: true,
        addedDate: '2023-03-20T11:00:00Z',
        addedBy: 'admin',
        addedByEmail: 'admin@roomy.com'
      }
    ],
    transactions: [
      {
        id: 3,
        type: 'payment',
        amount: 18500,
        currency: 'USD',
        description: 'Monthly rental income - Marina Apartment Complex',
        bankDetailId: 2,
        status: 'completed',
        date: '2024-08-01T10:00:00Z',
        processedBy: 'Manager',
        processedByEmail: 'manager@roomy.com',
        reference: 'PAY-2024-003',
        title: 'Monthly Rental Income',
        responsible: 'Mike Chen'
      }
    ],
    activityLog: [
      {
        id: 3,
        action: 'Property Added',
        description: 'Marina Apartment Complex added to portfolio',
        date: '2023-03-20T11:00:00Z',
        performedBy: 'admin'
      },
      {
        id: 4,
        action: 'Payment Received',
        description: 'Monthly payment of USD 18,500 received',
        date: '2024-08-01T10:00:00Z',
        performedBy: 'manager'
      }
    ]
  },
  {
    id: 'owner_3',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    email: 'ahmed.rashid@roomy.com',
    phone: '+971 55 987 6543',
    nationality: 'Emirati',
    dateOfBirth: '1988-11-10',
    role: 'OWNER',
    isActive: true,
    properties: ['Downtown Loft', 'Business Bay Studio'],
    totalUnits: 2,
    comments: 'New owner with growing portfolio. Very responsive and interested in expanding investments.',
    createdAt: '2024-01-10T12:00:00Z',
    createdBy: 'manager',
    lastModifiedAt: '2024-09-20T16:45:00Z',
    lastModifiedBy: 'manager',
    documents: [
      {
        id: 4,
        name: 'Emirates ID.pdf',
        type: 'Identification',
        uploadedAt: '2024-01-10T12:00:00Z',
        size: '1.5 MB',
        s3Key: 'documents/owner_3/emirates_id.pdf',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/owner_3/emirates_id.pdf'
      }
    ],
    bankDetails: [
      {
        id: 3,
        bankName: 'ADCB',
        accountHolderName: 'Ahmed Al-Rashid',
        accountNumber: '4567890123456789',
        iban: 'AE030331234567890123457',
        swiftCode: 'ADCBAEAA',
        bankAddress: 'Sheikh Zayed Road, Abu Dhabi, UAE',
        isPrimary: true,
        addedDate: '2024-01-10T12:00:00Z',
        addedBy: 'manager',
        addedByEmail: 'manager@roomy.com'
      }
    ],
    transactions: [
      {
        id: 4,
        type: 'payment',
        amount: 28000,
        currency: 'AED',
        description: 'Monthly rental income - Downtown Loft',
        bankDetailId: 3,
        status: 'completed',
        date: '2024-09-01T10:00:00Z',
        processedBy: 'Manager',
        processedByEmail: 'manager@roomy.com',
        reference: 'PAY-2024-004',
        title: 'Monthly Rental Income',
        responsible: 'Fatima Al-Zahra'
      },
      {
        id: 5,
        type: 'payment',
        amount: 18000,
        currency: 'AED',
        description: 'Monthly rental income - Business Bay Studio',
        bankDetailId: 3,
        status: 'completed',
        date: '2024-09-01T10:00:00Z',
        processedBy: 'Manager',
        processedByEmail: 'manager@roomy.com',
        reference: 'PAY-2024-005',
        title: 'Monthly Rental Income',
        responsible: 'Fatima Al-Zahra'
      }
    ],
    activityLog: [
      {
        id: 5,
        action: 'Property Added',
        description: 'Downtown Loft added to portfolio',
        date: '2024-01-10T12:00:00Z',
        performedBy: 'manager'
      },
      {
        id: 6,
        action: 'Property Added',
        description: 'Business Bay Studio added to portfolio',
        date: '2024-02-15T14:00:00Z',
        performedBy: 'manager'
      }
    ]
  },
  {
    id: 'owner_4',
    firstName: 'Elena',
    lastName: 'Petrova',
    email: 'elena.petrova@roomy.com',
    phone: '+7 915 123 4567',
    nationality: 'Russian',
    dateOfBirth: '1979-05-25',
    role: 'OWNER',
    isActive: false,
    properties: ['Skyline Penthouse'],
    totalUnits: 1,
    comments: 'Inactive owner - properties sold in June 2024. Maintained excellent relationship during active period.',
    createdAt: '2022-11-05T09:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-06-01T10:00:00Z',
    lastModifiedBy: 'admin',
    documents: [
      {
        id: 5,
        name: 'Russian Passport.pdf',
        type: 'Passport',
        uploadedAt: '2022-11-05T09:00:00Z',
        size: '2.0 MB',
        s3Key: 'documents/owner_4/passport.pdf',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/owner_4/passport.pdf'
      }
    ],
    bankDetails: [
      {
        id: 4,
        bankName: 'Sberbank',
        accountHolderName: 'Elena Petrova',
        accountNumber: '1234567890123456',
        iban: 'RU02044525600407028141',
        swiftCode: 'SABRRUMM',
        bankAddress: 'Moscow, Russia',
        isPrimary: true,
        addedDate: '2022-11-05T09:00:00Z',
        addedBy: 'admin',
        addedByEmail: 'admin@roomy.com'
      }
    ],
    transactions: [
      {
        id: 6,
        type: 'payment',
        amount: 35000,
        currency: 'AED',
        description: 'Final payment - Skyline Penthouse (sold)',
        bankDetailId: 4,
        status: 'completed',
        date: '2024-06-01T10:00:00Z',
        processedBy: 'Manager',
        processedByEmail: 'manager@roomy.com',
        reference: 'PAY-2024-006',
        title: 'Final Payment - Property Sale',
        responsible: 'Sarah Johnson'
      }
    ],
    activityLog: [
      {
        id: 7,
        action: 'Property Added',
        description: 'Skyline Penthouse added to portfolio',
        date: '2022-11-05T09:00:00Z',
        performedBy: 'admin'
      },
      {
        id: 8,
        action: 'Property Sold',
        description: 'Skyline Penthouse sold - owner deactivated',
        date: '2024-06-01T10:00:00Z',
        performedBy: 'manager'
      }
    ]
  },
  {
    id: 'owner_5',
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.anderson@roomy.com',
    phone: '+44 20 7123 4567',
    nationality: 'British',
    dateOfBirth: '1985-09-12',
    role: 'OWNER',
    isActive: true,
    properties: ['Beach Villa JBR', 'City Apartment DIFC'],
    totalUnits: 2,
    comments: 'International investor with diversified portfolio. Prefers quarterly reports and detailed analytics.',
    createdAt: '2023-06-18T14:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-09-25T11:10:00Z',
    lastModifiedBy: 'manager',
    documents: [
      {
        id: 6,
        name: 'UK Passport.pdf',
        type: 'Passport',
        uploadedAt: '2023-06-18T14:00:00Z',
        size: '1.8 MB',
        s3Key: 'documents/owner_5/passport.pdf',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/owner_5/passport.pdf'
      },
      {
        id: 7,
        name: 'Investment Agreement.pdf',
        type: 'Legal Document',
        uploadedAt: '2023-06-18T14:05:00Z',
        size: '3.2 MB',
        s3Key: 'documents/owner_5/investment_agreement.pdf',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/owner_5/investment_agreement.pdf'
      }
    ],
    bankDetails: [
      {
        id: 5,
        bankName: 'HSBC UK',
        accountHolderName: 'James Anderson',
        accountNumber: '9876543210987654',
        iban: 'GB29NWBK60161331926819',
        swiftCode: 'HBUKGB4B',
        bankAddress: '1 Centenary Square, Birmingham, UK',
        isPrimary: true,
        addedDate: '2023-06-18T14:00:00Z',
        addedBy: 'admin',
        addedByEmail: 'admin@roomy.com'
      }
    ],
    transactions: [
      {
        id: 7,
        type: 'payment',
        amount: 42000,
        currency: 'AED',
        description: 'Monthly rental income - Beach Villa JBR',
        bankDetailId: 5,
        status: 'completed',
        date: '2024-09-01T10:00:00Z',
        processedBy: 'Manager',
        processedByEmail: 'manager@roomy.com',
        reference: 'PAY-2024-007',
        title: 'Monthly Rental Income',
        responsible: 'Ahmed Al-Mansouri'
      },
      {
        id: 8,
        type: 'payment',
        amount: 38000,
        currency: 'AED',
        description: 'Monthly rental income - City Apartment DIFC',
        bankDetailId: 5,
        status: 'completed',
        date: '2024-09-01T10:00:00Z',
        processedBy: 'Manager',
        processedByEmail: 'manager@roomy.com',
        reference: 'PAY-2024-008',
        title: 'Monthly Rental Income',
        responsible: 'Ahmed Al-Mansouri'
      }
    ],
    activityLog: [
      {
        id: 9,
        action: 'Property Added',
        description: 'Beach Villa JBR added to portfolio',
        date: '2023-06-18T14:00:00Z',
        performedBy: 'admin'
      },
      {
        id: 10,
        action: 'Property Added',
        description: 'City Apartment DIFC added to portfolio',
        date: '2023-08-10T16:00:00Z',
        performedBy: 'manager'
      }
    ]
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

// Real agents data with detailed information
let realAgents = [
  {
    id: 1,
    name: 'Ahmed Al-Mansouri',
    email: 'ahmed.almansouri@roomy.com',
    phone: '+971 50 123 4567',
    nationality: 'United Arab Emirates',
    birthday: '1985-03-15',
    unitsAttracted: 2,
    totalPayouts: 45000,
    lastPayoutDate: '2024-01-15',
    status: 'Active',
    joinDate: '2023-03-15',
    comments: 'Senior property consultant specializing in luxury Downtown Dubai properties. Excellent track record with high-value clients.',
    createdAt: '2023-03-15T00:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-15T00:00:00.000Z',
    lastModifiedBy: 'System',
    // Detailed units data
    units: [
      {
        id: 1,
        name: 'Luxury Apartment Downtown Dubai',
        location: 'Downtown Dubai',
        referralDate: '2023-04-10',
        revenue: 85000,
        commission: 8,
        status: 'Active',
        propertyId: 'prop_1'
      },
      {
        id: 2,
        name: 'Beach Villa Palm Jumeirah',
        location: 'Palm Jumeirah',
        referralDate: '2023-05-15',
        revenue: 65000,
        commission: 10,
        status: 'Active',
        propertyId: 'prop_2'
      }
    ],
    // Detailed payouts data
    payouts: [
      {
        id: 1,
        date: '2024-01-15',
        amount: 8500,
        units: ['Luxury Apartment Downtown Dubai', 'Beach Villa Palm Jumeirah'],
        status: 'Completed',
        description: 'Monthly commission payout',
        paymentMethod: 'Bank Transfer'
      },
      {
        id: 2,
        date: '2023-12-15',
        amount: 7200,
        units: ['Luxury Apartment Downtown Dubai'],
        status: 'Completed',
        description: 'Monthly commission payout',
        paymentMethod: 'Bank Transfer'
      }
    ],
    // Documents data
    documents: [
      {
        id: 1,
        name: 'Agent Contract.pdf',
        type: 'Contract',
        uploadDate: '2023-03-15',
        size: '2.4 MB',
        s3Key: 'documents/agent_1/contract.pdf',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/agent_1/contract.pdf',
        filename: 'Agent Contract.pdf'
      },
      {
        id: 2,
        name: 'Commission Agreement.pdf',
        type: 'Agreement',
        uploadDate: '2023-03-20',
        size: '1.8 MB',
        s3Key: 'documents/agent_1/commission_agreement.pdf',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/agent_1/commission_agreement.pdf',
        filename: 'Commission Agreement.pdf'
      },
      {
        id: 3,
        name: 'ID Copy.jpg',
        type: 'Identification',
        uploadDate: '2023-03-15',
        size: '1.2 MB',
        s3Key: 'documents/agent_1/id_copy.jpg',
        s3Url: 'https://roomy-ae.s3.eu-west-3.amazonaws.com/documents/agent_1/id_copy.jpg',
        filename: 'ID Copy.jpg'
      }
    ]
  },
  {
    id: 2,
    name: 'Fatima Al-Zahra',
    email: 'fatima.alzahra@roomy.com',
    phone: '+971 50 987 6543',
    nationality: 'United Arab Emirates',
    birthday: '1990-12-05',
    unitsAttracted: 0,
    totalPayouts: 0,
    lastPayoutDate: null,
    status: 'Active',
    joinDate: '2024-01-01',
    comments: 'New agent specializing in residential properties. Currently building client portfolio.',
    createdAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'System',
    lastModifiedAt: '2024-01-01T00:00:00.000Z',
    lastModifiedBy: 'System',
    units: [],
    payouts: [],
    documents: []
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
      realAgents = JSON.parse(data);
      console.log('📁 Initial agents data loaded from file');
    } else {
      saveAgentsData(realAgents);
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

  let filtered = [...realAgents];

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
  
  const totalAgents = realAgents.length;
  const activeAgents = realAgents.filter(agent => agent.status === 'Active').length;
  
  // Calculate total units from properties assigned to agents
  const totalUnits = mockProperties.filter(p => p.agentId).length;
  
  // Calculate total payouts from agent payouts
  const totalPayouts = realAgents.reduce((sum, agent) => {
    if (agent.payouts) {
      return sum + agent.payouts.reduce((payoutSum, payout) => payoutSum + payout.amount, 0);
    }
    return sum + (agent.totalPayouts || 0);
  }, 0);

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

  const agent = realAgents.find(a => a.id === parseInt(id));
  
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Calculate unitsAttracted from properties
  const agentProperties = mockProperties.filter(p => p.agentId === parseInt(id));
  const agentWithCalculatedStats = {
    ...agent,
    unitsAttracted: agentProperties.length
  };

  res.json({
    success: true,
    data: agentWithCalculatedStats
  });
});

// POST /api/agents - Create new agent
app.post('/api/agents', mockAuth, (req, res) => {
  console.log('👥 POST /api/agents - Creating new agent');
  const agentData = req.body;

  const newAgent = {
    id: Math.max(...realAgents.map(a => a.id)) + 1,
    ...agentData,
    status: agentData.status || 'Active',
    createdAt: new Date().toISOString(),
    createdBy: 'Current User',
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  realAgents.push(newAgent);
  saveAgentsData(realAgents);

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

  const agentIndex = realAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  realAgents[agentIndex] = {
    ...realAgents[agentIndex],
    ...updateData,
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'Current User'
  };

  saveAgentsData(realAgents);

  res.json({
    success: true,
    data: realAgents[agentIndex],
    message: 'Agent updated successfully'
  });
});

// DELETE /api/agents/:id - Delete agent
app.delete('/api/agents/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`👥 DELETE /api/agents/${id} - Deleting agent`);

  const agentIndex = realAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  realAgents.splice(agentIndex, 1);
  saveAgentsData(realAgents);

  res.json({
    success: true,
    message: 'Agent deleted successfully'
  });
});

// ==================== AGENT UNITS API ====================

// GET /api/agents/:id/units - Get agent units
app.get('/api/agents/:id/units', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`🏠 GET /api/agents/${id}/units - Fetching agent units`);

  const agent = realAgents.find(a => a.id === parseInt(id));
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Get properties assigned to this agent
  const agentProperties = mockProperties.filter(p => p.agentId === parseInt(id));
  
  // Convert properties to units format
  const units = agentProperties.map(prop => ({
    id: prop.id,
    name: prop.name,
    location: prop.address,
    referralDate: prop.createdAt,
    revenue: prop.pricePerNight * 30, // Monthly revenue estimate
    commission: 8, // Default commission
    status: prop.status,
    propertyId: prop.id
  }));

  res.json({
    success: true,
    data: units
  });
});

// POST /api/agents/:id/units - Add unit to agent (creates property)
app.post('/api/agents/:id/units', mockAuth, (req, res) => {
  const { id } = req.params;
  const unitData = req.body;
  console.log(`🏠 POST /api/agents/${id}/units - Adding unit to agent`);

  const agentIndex = realAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  const agent = realAgents[agentIndex];

  // Create new property
  const newProperty = {
    id: `prop_${Date.now()}`,
    name: unitData.name,
    type: 'APARTMENT',
    address: unitData.location,
    city: 'Dubai',
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: Math.round(unitData.revenue / 30), // Convert monthly revenue to daily
    primaryImage: 'https://example.com/default.jpg',
    agentId: parseInt(id),
    agentName: agent.name,
    status: unitData.status || 'Active',
    createdAt: unitData.referralDate || new Date().toISOString(),
    lastModifiedAt: new Date().toISOString()
  };

  // Add property to mockProperties
  mockProperties.push(newProperty);
  savePropertiesData(mockProperties);

  // Convert property to unit format for response
  const newUnit = {
    id: newProperty.id,
    name: newProperty.name,
    location: newProperty.address,
    referralDate: newProperty.createdAt,
    revenue: unitData.revenue,
    commission: unitData.commission,
    status: newProperty.status,
    propertyId: newProperty.id
  };

  res.json({
    success: true,
    data: newUnit,
    message: 'Unit added successfully'
  });
});

// DELETE /api/agents/:id/units/:unitId - Remove unit from agent (removes property)
app.delete('/api/agents/:id/units/:unitId', mockAuth, (req, res) => {
  const { id, unitId } = req.params;
  console.log(`🏠 DELETE /api/agents/${id}/units/${unitId} - Removing unit from agent`);

  const agentIndex = realAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Find and remove property
  const propertyIndex = mockProperties.findIndex(p => p.id === unitId && p.agentId === parseInt(id));
  if (propertyIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Unit not found'
    });
  }

  // Remove property from mockProperties
  mockProperties.splice(propertyIndex, 1);
  savePropertiesData(mockProperties);

  res.json({
    success: true,
    message: 'Unit removed successfully'
  });
});

// ==================== AGENT PAYOUTS API ====================

// GET /api/agents/:id/payouts - Get agent payouts
app.get('/api/agents/:id/payouts', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`💰 GET /api/agents/${id}/payouts - Fetching agent payouts`);

  const agent = realAgents.find(a => a.id === parseInt(id));
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  res.json({
    success: true,
    data: agent.payouts || []
  });
});

// POST /api/agents/:id/payouts - Add payout to agent
app.post('/api/agents/:id/payouts', mockAuth, (req, res) => {
  const { id } = req.params;
  const payoutData = req.body;
  console.log(`💰 POST /api/agents/${id}/payouts - Adding payout to agent`);

  const agentIndex = realAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  const newPayout = {
    id: Date.now(), // Simple ID generation
    ...payoutData,
    date: payoutData.date || new Date().toISOString().split('T')[0],
    status: payoutData.status || 'Completed',
    paymentMethod: payoutData.paymentMethod || 'Bank Transfer'
  };

  if (!realAgents[agentIndex].payouts) {
    realAgents[agentIndex].payouts = [];
  }
  realAgents[agentIndex].payouts.push(newPayout);
  
  // Update agent stats
  realAgents[agentIndex].totalPayouts = (realAgents[agentIndex].totalPayouts || 0) + newPayout.amount;
  realAgents[agentIndex].lastPayoutDate = newPayout.date;
  realAgents[agentIndex].lastModifiedAt = new Date().toISOString();
  realAgents[agentIndex].lastModifiedBy = 'Current User';

  saveAgentsData(realAgents);

  res.json({
    success: true,
    data: newPayout,
    message: 'Payout added successfully'
  });
});

// DELETE /api/agents/:id/payouts/:payoutId - Remove payout from agent
app.delete('/api/agents/:id/payouts/:payoutId', mockAuth, (req, res) => {
  const { id, payoutId } = req.params;
  console.log(`💰 DELETE /api/agents/${id}/payouts/${payoutId} - Removing payout from agent`);

  const agentIndex = realAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  if (!realAgents[agentIndex].payouts) {
    return res.status(404).json({
      success: false,
      message: 'Payout not found'
    });
  }

  const payoutIndex = realAgents[agentIndex].payouts.findIndex(p => p.id === parseInt(payoutId));
  if (payoutIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Payout not found'
    });
  }

  const payout = realAgents[agentIndex].payouts[payoutIndex];
  realAgents[agentIndex].payouts.splice(payoutIndex, 1);
  
  // Update agent stats
  realAgents[agentIndex].totalPayouts = Math.max(0, (realAgents[agentIndex].totalPayouts || 0) - payout.amount);
  
  // Update last payout date
  if (realAgents[agentIndex].payouts.length > 0) {
    const sortedPayouts = realAgents[agentIndex].payouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    realAgents[agentIndex].lastPayoutDate = sortedPayouts[0].date;
  } else {
    realAgents[agentIndex].lastPayoutDate = null;
  }
  
  realAgents[agentIndex].lastModifiedAt = new Date().toISOString();
  realAgents[agentIndex].lastModifiedBy = 'Current User';

  saveAgentsData(realAgents);

  res.json({
    success: true,
    message: 'Payout removed successfully'
  });
});

// ==================== AGENT DOCUMENTS API ====================

// GET /api/agents/:id/documents - Get agent documents
app.get('/api/agents/:id/documents', mockAuth, (req, res) => {
  const { id } = req.params;
  console.log(`📄 GET /api/agents/${id}/documents - Fetching agent documents`);

  const agent = realAgents.find(a => a.id === parseInt(id));
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  res.json({
    success: true,
    data: agent.documents || []
  });
});

// POST /api/agents/:id/documents - Add document to agent
app.post('/api/agents/:id/documents', mockAuth, (req, res) => {
  const { id } = req.params;
  const documentData = req.body;
  console.log(`📄 POST /api/agents/${id}/documents - Adding document to agent`);

  const agentIndex = realAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  const newDocument = {
    id: Date.now(), // Simple ID generation
    ...documentData,
    uploadDate: documentData.uploadDate || new Date().toISOString().split('T')[0]
  };

  if (!realAgents[agentIndex].documents) {
    realAgents[agentIndex].documents = [];
  }
  realAgents[agentIndex].documents.push(newDocument);
  
  realAgents[agentIndex].lastModifiedAt = new Date().toISOString();
  realAgents[agentIndex].lastModifiedBy = 'Current User';

  saveAgentsData(realAgents);

  res.json({
    success: true,
    data: newDocument,
    message: 'Document added successfully'
  });
});

// DELETE /api/agents/:id/documents/:documentId - Remove document from agent
app.delete('/api/agents/:id/documents/:documentId', mockAuth, (req, res) => {
  const { id, documentId } = req.params;
  console.log(`📄 DELETE /api/agents/${id}/documents/${documentId} - Removing document from agent`);

  const agentIndex = realAgents.findIndex(a => a.id === parseInt(id));
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  if (!realAgents[agentIndex].documents) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  const documentIndex = realAgents[agentIndex].documents.findIndex(d => d.id === parseInt(documentId));
  if (documentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  realAgents[agentIndex].documents.splice(documentIndex, 1);
  
  realAgents[agentIndex].lastModifiedAt = new Date().toISOString();
  realAgents[agentIndex].lastModifiedBy = 'Current User';

  saveAgentsData(realAgents);

  res.json({
    success: true,
    message: 'Document removed successfully'
  });
});

// ==================== FINANCES API ====================

// Mock financial transactions data
let mockFinancialTransactions = [
  {
    id: 1,
    transactionId: 'TXN-2024-001',
    guestName: 'John Smith',
    property: 'Apartment Burj Khalifa 2',
    reservationId: 'RES-001',
    paymentStatus: 'Completed',
    paymentMethod: 'Credit Card',
    amount: 2450,
    currency: 'AED',
    date: '2024-01-15',
    time: '14:30',
    type: 'Payment',
    platform: 'Airbnb',
    platformFee: 73.5,
    transactionFee: 0,
    adminUser: 'Sarah Johnson',
    remarks: 'Full payment received on time',
    paymentCount: 1,
    paymentCategory: 'Reservation Payment',
    guestEmail: 'john.smith@email.com',
    guestPhone: '+971 50 123 4567',
    netAmount: 2376.5,
    createdAt: '2024-01-15T14:30:00.000Z',
    createdBy: 'Sarah Johnson',
    lastModifiedAt: '2024-01-15T14:30:00.000Z',
    lastModifiedBy: 'Sarah Johnson'
  },
  {
    id: 2,
    transactionId: 'TXN-2024-002',
    guestName: 'Maria Garcia',
    property: 'Marina View Studio',
    reservationId: 'RES-002',
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer',
    amount: 1800,
    currency: 'AED',
    date: '2024-01-14',
    time: '10:15',
    type: 'Payment',
    platform: 'Direct',
    platformFee: 0,
    transactionFee: 0,
    adminUser: 'Mike Wilson',
    remarks: 'Awaiting bank confirmation',
    paymentCount: 1,
    paymentCategory: 'Deposit',
    guestEmail: 'maria.garcia@email.com',
    guestPhone: '+971 50 234 5678',
    netAmount: 1800,
    createdAt: '2024-01-14T10:15:00.000Z',
    createdBy: 'Mike Wilson',
    lastModifiedAt: '2024-01-14T10:15:00.000Z',
    lastModifiedBy: 'Mike Wilson'
  },
  {
    id: 3,
    transactionId: 'TXN-2024-003',
    guestName: 'Ahmed Hassan',
    property: 'Downtown Loft 2BR',
    reservationId: 'RES-003',
    paymentStatus: 'Completed',
    paymentMethod: 'Credit Card',
    amount: 3200,
    currency: 'AED',
    date: '2024-01-13',
    time: '16:45',
    type: 'Payment',
    platform: 'Booking.com',
    platformFee: 96,
    transactionFee: 0,
    adminUser: 'Lisa Brown',
    remarks: 'Deposit payment - balance due on arrival',
    paymentCount: 1,
    paymentCategory: 'Deposit',
    guestEmail: 'ahmed.hassan@email.com',
    guestPhone: '+971 50 345 6789',
    netAmount: 3104,
    createdAt: '2024-01-13T16:45:00.000Z',
    createdBy: 'Lisa Brown',
    lastModifiedAt: '2024-01-13T16:45:00.000Z',
    lastModifiedBy: 'Lisa Brown'
  },
  {
    id: 4,
    transactionId: 'TXN-2024-004',
    guestName: 'Emma Davis',
    property: 'JBR Beach Apartment',
    reservationId: 'RES-004',
    paymentStatus: 'Failed',
    paymentMethod: 'Credit Card',
    amount: 2100,
    currency: 'AED',
    date: '2024-01-12',
    time: '09:20',
    type: 'Payment',
    platform: 'Airbnb',
    platformFee: 63,
    transactionFee: 0,
    adminUser: 'David Lee',
    remarks: 'Card declined - insufficient funds',
    paymentCount: 1,
    paymentCategory: 'Reservation Payment',
    guestEmail: 'emma.davis@email.com',
    guestPhone: '+971 50 456 7890',
    netAmount: 2037,
    createdAt: '2024-01-12T09:20:00.000Z',
    createdBy: 'David Lee',
    lastModifiedAt: '2024-01-12T09:20:00.000Z',
    lastModifiedBy: 'David Lee'
  },
  {
    id: 5,
    transactionId: 'TXN-2024-005',
    guestName: 'Tom Anderson',
    property: 'Business Bay Office',
    reservationId: 'RES-005',
    paymentStatus: 'Completed',
    paymentMethod: 'PayPal',
    amount: -1500,
    currency: 'AED',
    date: '2024-01-11',
    time: '11:30',
    type: 'Refund',
    platform: 'Direct',
    platformFee: 0,
    transactionFee: 0,
    adminUser: 'Anna Taylor',
    remarks: 'Partial refund due to early checkout',
    paymentCount: 1,
    paymentCategory: 'Refund',
    guestEmail: 'tom.anderson@email.com',
    guestPhone: '+971 50 567 8901',
    netAmount: -1500,
    createdAt: '2024-01-11T11:30:00.000Z',
    createdBy: 'Anna Taylor',
    lastModifiedAt: '2024-01-11T11:30:00.000Z',
    lastModifiedBy: 'Anna Taylor'
  },
  {
    id: 6,
    transactionId: 'TXN-2024-006',
    guestName: 'Clean Pro Services',
    property: 'Apartment Burj Khalifa 2',
    reservationId: 'RES-001',
    paymentStatus: 'Completed',
    paymentMethod: 'Bank Transfer',
    amount: -450,
    currency: 'AED',
    date: '2024-01-15',
    time: '18:00',
    type: 'Expense',
    platform: 'Direct',
    platformFee: 0,
    transactionFee: 0,
    adminUser: 'Sarah Johnson',
    remarks: 'Post-checkout cleaning service',
    paymentCount: 1,
    paymentCategory: 'Cleaning Fee',
    guestEmail: 'info@cleanpro.ae',
    guestPhone: '+971 4 123 4567',
    netAmount: -450,
    createdAt: '2024-01-15T18:00:00.000Z',
    createdBy: 'Sarah Johnson',
    lastModifiedAt: '2024-01-15T18:00:00.000Z',
    lastModifiedBy: 'Sarah Johnson'
  },
  {
    id: 7,
    transactionId: 'TXN-2024-007',
    guestName: 'Dubai Plumbing Co.',
    property: 'Marina View Studio',
    reservationId: 'N/A',
    paymentStatus: 'Completed',
    paymentMethod: 'Bank Transfer',
    amount: -320,
    currency: 'AED',
    date: '2024-01-14',
    time: '14:15',
    type: 'Expense',
    platform: 'Direct',
    platformFee: 0,
    transactionFee: 0,
    adminUser: 'Mike Wilson',
    remarks: 'Kitchen sink repair',
    paymentCount: 1,
    paymentCategory: 'Maintenance Fee',
    guestEmail: 'service@dubaiplumbing.ae',
    guestPhone: '+971 4 234 5678',
    netAmount: -320,
    createdAt: '2024-01-14T14:15:00.000Z',
    createdBy: 'Mike Wilson',
    lastModifiedAt: '2024-01-14T14:15:00.000Z',
    lastModifiedBy: 'Mike Wilson'
  },
  {
    id: 8,
    transactionId: 'TXN-2024-008',
    guestName: 'Sophie Martin',
    property: 'DIFC Penthouse',
    reservationId: 'RES-006',
    paymentStatus: 'Completed',
    paymentMethod: 'Credit Card',
    amount: 5200,
    currency: 'AED',
    date: '2024-01-10',
    time: '13:45',
    type: 'Payment',
    platform: 'Airbnb',
    platformFee: 156,
    transactionFee: 0,
    adminUser: 'John Smith',
    remarks: 'Full payment - premium property',
    paymentCount: 1,
    paymentCategory: 'Reservation Payment',
    guestEmail: 'sophie.martin@email.com',
    guestPhone: '+971 50 678 9012',
    netAmount: 5044,
    createdAt: '2024-01-10T13:45:00.000Z',
    createdBy: 'John Smith',
    lastModifiedAt: '2024-01-10T13:45:00.000Z',
    lastModifiedBy: 'John Smith'
  }
];

// Data persistence functions
const FINANCES_FILE = path.join(DATA_DIR, 'finances.json');

function loadFinancesData() {
  try {
    if (fs.existsSync(FINANCES_FILE)) {
      const data = fs.readFileSync(FINANCES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading finances data:', error);
  }
  return mockFinancialTransactions;
}

function saveFinancesData() {
  try {
    fs.writeFileSync(FINANCES_FILE, JSON.stringify(mockFinancialTransactions, null, 2));
  } catch (error) {
    console.error('Error saving finances data:', error);
  }
}

// Load data on startup
mockFinancialTransactions = loadFinancesData();

// GET /api/finances - Get all financial transactions with filtering
app.get('/api/finances', (req, res) => {
  try {
    const {
      search,
      paymentStatus,
      paymentMethod,
      transactionType,
      paymentCategory,
      platform,
      property,
      guest,
      amountMin,
      amountMax,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50
    } = req.query;

    let filteredTransactions = [...mockFinancialTransactions];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(transaction =>
        transaction.guestName.toLowerCase().includes(searchLower) ||
        transaction.property.toLowerCase().includes(searchLower) ||
        transaction.transactionId.toLowerCase().includes(searchLower) ||
        transaction.reservationId.toLowerCase().includes(searchLower) ||
        transaction.paymentMethod.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (paymentStatus) {
      const statuses = Array.isArray(paymentStatus) ? paymentStatus : [paymentStatus];
      filteredTransactions = filteredTransactions.filter(transaction =>
        statuses.includes(transaction.paymentStatus)
      );
    }

    // Payment method filter
    if (paymentMethod) {
      const methods = Array.isArray(paymentMethod) ? paymentMethod : [paymentMethod];
      filteredTransactions = filteredTransactions.filter(transaction =>
        methods.includes(transaction.paymentMethod)
      );
    }

    // Transaction type filter
    if (transactionType) {
      const types = Array.isArray(transactionType) ? transactionType : [transactionType];
      filteredTransactions = filteredTransactions.filter(transaction =>
        types.includes(transaction.type)
      );
    }

    // Payment category filter
    if (paymentCategory) {
      const categories = Array.isArray(paymentCategory) ? paymentCategory : [paymentCategory];
      filteredTransactions = filteredTransactions.filter(transaction =>
        categories.includes(transaction.paymentCategory)
      );
    }

    // Platform filter
    if (platform) {
      const platforms = Array.isArray(platform) ? platform : [platform];
      filteredTransactions = filteredTransactions.filter(transaction =>
        platforms.includes(transaction.platform)
      );
    }

    // Property filter
    if (property) {
      const properties = Array.isArray(property) ? property : [property];
      filteredTransactions = filteredTransactions.filter(transaction =>
        properties.includes(transaction.property)
      );
    }

    // Guest filter
    if (guest) {
      filteredTransactions = filteredTransactions.filter(transaction =>
        transaction.guestName.toLowerCase().includes(guest.toLowerCase())
      );
    }

    // Amount range filter
    if (amountMin) {
      filteredTransactions = filteredTransactions.filter(transaction =>
        transaction.amount >= parseFloat(amountMin)
      );
    }
    if (amountMax) {
      filteredTransactions = filteredTransactions.filter(transaction =>
        transaction.amount <= parseFloat(amountMax)
      );
    }

    // Date range filter
    if (dateFrom) {
      filteredTransactions = filteredTransactions.filter(transaction =>
        new Date(transaction.date) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filteredTransactions = filteredTransactions.filter(transaction =>
        new Date(transaction.date) <= new Date(dateTo)
      );
    }

    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedTransactions,
      total: filteredTransactions.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching financial transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial transactions'
    });
  }
});

// GET /api/finances/stats - Get financial statistics
app.get('/api/finances/stats', (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let filteredTransactions = [...mockFinancialTransactions];
    
    // Apply date filters if provided
    if (dateFrom) {
      filteredTransactions = filteredTransactions.filter(transaction =>
        new Date(transaction.date) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filteredTransactions = filteredTransactions.filter(transaction =>
        new Date(transaction.date) <= new Date(dateTo)
      );
    }

    // Calculate statistics
    const totalRevenue = filteredTransactions
      .filter(t => t.type === 'Payment' && t.paymentStatus === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingPayments = filteredTransactions
      .filter(t => t.type === 'Payment' && t.paymentStatus === 'Pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(filteredTransactions
      .filter(t => t.type === 'Expense' && t.paymentStatus === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0));

    const refundsAmount = Math.abs(filteredTransactions
      .filter(t => t.type === 'Refund' && t.paymentStatus === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0));

    const platformFees = filteredTransactions
      .filter(t => t.paymentStatus === 'Completed')
      .reduce((sum, t) => sum + (t.platformFee || 0), 0);

    const netIncome = totalRevenue - totalExpenses - refundsAmount - platformFees;

    const transactionsCount = filteredTransactions.length;
    const averageTransaction = transactionsCount > 0 ? totalRevenue / transactionsCount : 0;

    const stats = {
      totalRevenue,
      pendingPayments,
      totalExpenses,
      netIncome,
      transactionsCount,
      averageTransaction,
      refundsAmount,
      platformFees
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial statistics'
    });
  }
});

// GET /api/finances/:id - Get single financial transaction
app.get('/api/finances/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const transaction = mockFinancialTransactions.find(t => t.id === id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Financial transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching financial transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial transaction'
    });
  }
});

// POST /api/finances - Create new financial transaction
app.post('/api/finances', (req, res) => {
  try {
    const {
      guestName,
      property,
      reservationId,
      paymentStatus,
      paymentMethod,
      amount,
      currency,
      date,
      time,
      type,
      platform,
      platformFee,
      transactionFee,
      paymentCategory,
      guestEmail,
      guestPhone,
      remarks,
      adminUser
    } = req.body;

    // Generate new transaction ID
    const newId = Math.max(...mockFinancialTransactions.map(t => t.id)) + 1;
    const transactionId = `TXN-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`;

    const newTransaction = {
      id: newId,
      transactionId,
      guestName,
      property,
      reservationId: reservationId || 'N/A',
      paymentStatus,
      paymentMethod,
      amount: parseFloat(amount),
      currency,
      date,
      time: time || new Date().toTimeString().slice(0, 5),
      type,
      platform,
      platformFee: parseFloat(platformFee) || 0,
      transactionFee: parseFloat(transactionFee) || 0,
      adminUser: adminUser || 'Current User',
      remarks: remarks || '',
      paymentCount: 1,
      paymentCategory,
      guestEmail: guestEmail || '',
      guestPhone: guestPhone || '',
      netAmount: parseFloat(amount) - (parseFloat(platformFee) || 0) - (parseFloat(transactionFee) || 0),
      createdAt: new Date().toISOString(),
      createdBy: adminUser || 'Current User',
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: adminUser || 'Current User'
    };

    mockFinancialTransactions.unshift(newTransaction);
    saveFinancesData();

    res.status(201).json({
      success: true,
      data: newTransaction
    });
  } catch (error) {
    console.error('Error creating financial transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating financial transaction'
    });
  }
});

// PUT /api/finances/:id - Update financial transaction
app.put('/api/finances/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const transactionIndex = mockFinancialTransactions.findIndex(t => t.id === id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Financial transaction not found'
      });
    }

    const updateData = req.body;
    const updatedTransaction = {
      ...mockFinancialTransactions[transactionIndex],
      ...updateData,
      id, // Ensure ID doesn't change
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: updateData.adminUser || 'Current User'
    };

    // Recalculate net amount if amount or fees changed
    if (updateData.amount || updateData.platformFee || updateData.transactionFee) {
      updatedTransaction.netAmount = updatedTransaction.amount - 
        (updatedTransaction.platformFee || 0) - 
        (updatedTransaction.transactionFee || 0);
    }

    mockFinancialTransactions[transactionIndex] = updatedTransaction;
    saveFinancesData();

    res.json({
      success: true,
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating financial transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating financial transaction'
    });
  }
});

// DELETE /api/finances/:id - Delete financial transaction
app.delete('/api/finances/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const transactionIndex = mockFinancialTransactions.findIndex(t => t.id === id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Financial transaction not found'
      });
    }

    mockFinancialTransactions.splice(transactionIndex, 1);
    saveFinancesData();

    res.json({
      success: true,
      message: 'Financial transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting financial transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting financial transaction'
    });
  }
});

// POST /api/finances/bulk/mark-paid - Mark multiple transactions as paid
app.post('/api/finances/bulk/mark-paid', (req, res) => {
  try {
    const { transactionIds } = req.body;
    
    if (!Array.isArray(transactionIds)) {
      return res.status(400).json({
        success: false,
        message: 'transactionIds must be an array'
      });
    }

    let updatedCount = 0;
    transactionIds.forEach(id => {
      const transaction = mockFinancialTransactions.find(t => t.id === id);
      if (transaction && transaction.paymentStatus === 'Pending') {
        transaction.paymentStatus = 'Completed';
        transaction.lastModifiedAt = new Date().toISOString();
        transaction.lastModifiedBy = 'Current User';
        updatedCount++;
      }
    });

    saveFinancesData();

    res.json({
      success: true,
      message: `${updatedCount} transactions marked as paid`
    });
  } catch (error) {
    console.error('Error marking transactions as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking transactions as paid'
    });
  }
});

// POST /api/finances/export - Export transactions
app.post('/api/finances/export', (req, res) => {
  try {
    const { transactionIds, format = 'csv' } = req.body;
    
    let transactionsToExport = mockFinancialTransactions;
    if (transactionIds && Array.isArray(transactionIds)) {
      transactionsToExport = mockFinancialTransactions.filter(t => 
        transactionIds.includes(t.id)
      );
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Transaction ID', 'Guest Name', 'Property', 'Reservation ID',
        'Payment Status', 'Payment Method', 'Amount', 'Currency',
        'Date', 'Type', 'Platform', 'Platform Fee', 'Category', 'Remarks'
      ];
      
      const csvRows = [headers.join(',')];
      transactionsToExport.forEach(transaction => {
        const row = [
          transaction.transactionId,
          `"${transaction.guestName}"`,
          `"${transaction.property}"`,
          transaction.reservationId,
          transaction.paymentStatus,
          transaction.paymentMethod,
          transaction.amount,
          transaction.currency,
          transaction.date,
          transaction.type,
          transaction.platform,
          transaction.platformFee || 0,
          `"${transaction.paymentCategory}"`,
          `"${transaction.remarks || ''}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="financial_transactions.csv"');
      res.send(csvContent);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting transactions'
    });
  }
});

// POST /api/finances/generate-invoices - Generate invoices for transactions
app.post('/api/finances/generate-invoices', (req, res) => {
  try {
    const { transactionIds } = req.body;
    
    if (!Array.isArray(transactionIds)) {
      return res.status(400).json({
        success: false,
        message: 'transactionIds must be an array'
      });
    }

    const transactions = mockFinancialTransactions.filter(t => 
      transactionIds.includes(t.id)
    );

    // Mock invoice generation
    const invoiceIds = transactions.map(t => t.id + 1000); // Simple mock invoice ID

    res.json({
      success: true,
      message: `${transactions.length} invoices generated successfully`,
      invoiceIds
    });
  } catch (error) {
    console.error('Error generating invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoices'
    });
  }
});

// ===========================
// ANALYTICS API ENDPOINTS
// ===========================

// Mock analytics data
const mockAnalyticsData = {
  overview: {
    totalRevenue: 125400,
    totalExpenses: 18700,
    netProfit: 106700,
    occupancyRate: 78.5,
    totalUnits: 12,
    activeReservations: 47,
    averageStayDuration: 4.2,
    revenueGrowth: 12.5,
    expenseGrowth: -3.2,
    profitGrowth: 15.8,
    occupancyGrowth: 8.3
  },
  financials: {
    revenue: {
      total: 125400,
      byUnit: [
        { unit: 'Apartment Burj Khalifa 2', revenue: 24500, percentage: 19.5 },
        { unit: 'Marina View Studio', revenue: 18900, percentage: 15.1 },
        { unit: 'Downtown Loft 2BR', revenue: 22100, percentage: 17.6 },
        { unit: 'JBR Beach Apartment', revenue: 19800, percentage: 15.8 },
        { unit: 'Business Bay Office', revenue: 15600, percentage: 12.4 },
        { unit: 'DIFC Penthouse', revenue: 24500, percentage: 19.5 }
      ],
      bySource: [
        { source: 'Airbnb', revenue: 50200, percentage: 40.0 },
        { source: 'Booking.com', revenue: 37650, percentage: 30.0 },
        { source: 'Direct', revenue: 25100, percentage: 20.0 },
        { source: 'Expedia', revenue: 12450, percentage: 10.0 }
      ],
      trends: [
        { month: 'Jan', revenue: 11200 },
        { month: 'Feb', revenue: 12800 },
        { month: 'Mar', revenue: 14500 },
        { month: 'Apr', revenue: 13200 },
        { month: 'May', revenue: 15800 },
        { month: 'Jun', revenue: 14200 },
        { month: 'Jul', revenue: 16800 },
        { month: 'Aug', revenue: 17500 }
      ]
    },
    expenses: {
      total: 18700,
      categories: [
        { category: 'Cleaning', amount: 5600, percentage: 29.9 },
        { category: 'Maintenance', amount: 4200, percentage: 22.5 },
        { category: 'Platform Fees', amount: 3762, percentage: 20.1 },
        { category: 'Utilities', amount: 2800, percentage: 15.0 },
        { category: 'Insurance', amount: 1800, percentage: 9.6 },
        { category: 'Other', amount: 538, percentage: 2.9 }
      ],
      byUnit: [
        { unit: 'Apartment Burj Khalifa 2', expenses: 3200 },
        { unit: 'Marina View Studio', expenses: 2800 },
        { unit: 'Downtown Loft 2BR', expenses: 3100 },
        { unit: 'JBR Beach Apartment', expenses: 2900 },
        { unit: 'Business Bay Office', expenses: 2500 },
        { unit: 'DIFC Penthouse', expenses: 4200 }
      ]
    },
    profit: {
      net: 106700,
      byUnit: [
        { unit: 'Apartment Burj Khalifa 2', profit: 21300, margin: 86.9 },
        { unit: 'Marina View Studio', profit: 16100, margin: 85.2 },
        { unit: 'Downtown Loft 2BR', profit: 19000, margin: 86.0 },
        { unit: 'JBR Beach Apartment', profit: 16900, margin: 85.4 },
        { unit: 'Business Bay Office', profit: 13100, margin: 84.0 },
        { unit: 'DIFC Penthouse', profit: 20300, margin: 82.9 }
      ]
    }
  },
  units: {
    performance: [
      {
        unit: 'Apartment Burj Khalifa 2',
        revenue: 24500,
        expenses: 3200,
        profit: 21300,
        occupancyRate: 85.2,
        revenuePerNight: 320,
        totalNights: 76,
        avgStayDuration: 4.1
      },
      {
        unit: 'Marina View Studio',
        revenue: 18900,
        expenses: 2800,
        profit: 16100,
        occupancyRate: 78.5,
        revenuePerNight: 280,
        totalNights: 68,
        avgStayDuration: 3.8
      },
      {
        unit: 'Downtown Loft 2BR',
        revenue: 22100,
        expenses: 3100,
        profit: 19000,
        occupancyRate: 82.1,
        revenuePerNight: 310,
        totalNights: 71,
        avgStayDuration: 4.3
      },
      {
        unit: 'JBR Beach Apartment',
        revenue: 19800,
        expenses: 2900,
        profit: 16900,
        occupancyRate: 75.8,
        revenuePerNight: 290,
        totalNights: 68,
        avgStayDuration: 3.9
      },
      {
        unit: 'Business Bay Office',
        revenue: 15600,
        expenses: 2500,
        profit: 13100,
        occupancyRate: 72.3,
        revenuePerNight: 260,
        totalNights: 60,
        avgStayDuration: 3.5
      },
      {
        unit: 'DIFC Penthouse',
        revenue: 24500,
        expenses: 4200,
        profit: 20300,
        occupancyRate: 88.7,
        revenuePerNight: 380,
        totalNights: 64,
        avgStayDuration: 4.6
      }
    ]
  },
  owners: {
    profitability: [
      {
        owner: 'Ahmed Al-Rashid',
        units: ['Apartment Burj Khalifa 2', 'Marina View Studio'],
        totalRevenue: 43400,
        totalExpenses: 6000,
        netProfit: 37400,
        profitMargin: 86.2,
        unitsCount: 2,
        avgRevenuePerUnit: 21700
      },
      {
        owner: 'Sarah Johnson',
        units: ['Downtown Loft 2BR', 'JBR Beach Apartment'],
        totalRevenue: 41900,
        totalExpenses: 6000,
        netProfit: 35900,
        profitMargin: 85.7,
        unitsCount: 2,
        avgRevenuePerUnit: 20950
      },
      {
        owner: 'Mohammed Hassan',
        units: ['Business Bay Office'],
        totalRevenue: 15600,
        totalExpenses: 2500,
        netProfit: 13100,
        profitMargin: 84.0,
        unitsCount: 1,
        avgRevenuePerUnit: 15600
      },
      {
        owner: 'Emma Davis',
        units: ['DIFC Penthouse'],
        totalRevenue: 24500,
        totalExpenses: 4200,
        netProfit: 20300,
        profitMargin: 82.9,
        unitsCount: 1,
        avgRevenuePerUnit: 24500
      }
    ]
  },
  reservations: {
    trends: {
      monthly: [
        { month: 'Jan', reservations: 12, cancellations: 2, net: 10 },
        { month: 'Feb', reservations: 15, cancellations: 1, net: 14 },
        { month: 'Mar', reservations: 18, cancellations: 3, net: 15 },
        { month: 'Apr', reservations: 16, cancellations: 2, net: 14 },
        { month: 'May', reservations: 22, cancellations: 1, net: 21 },
        { month: 'Jun', reservations: 25, cancellations: 4, net: 21 },
        { month: 'Jul', reservations: 28, cancellations: 2, net: 26 },
        { month: 'Aug', reservations: 30, cancellations: 3, net: 27 }
      ]
    },
    status: {
      confirmed: 89,
      pending: 12,
      cancelled: 8,
      completed: 76,
      total: 109,
      cancellationRate: 7.3,
      confirmationRate: 81.7
    }
  },
  agents: {
    performance: [
      {
        agent: 'Sarah Wilson',
        unitsReferred: 3,
        totalRevenue: 45600,
        totalPayouts: 13680,
        commissionRate: 30,
        avgRevenuePerUnit: 15200,
        lastReferral: '2024-01-10',
        status: 'Active'
      },
      {
        agent: 'Mike Johnson',
        unitsReferred: 2,
        totalRevenue: 32100,
        totalPayouts: 9630,
        commissionRate: 30,
        avgRevenuePerUnit: 16050,
        lastReferral: '2024-01-05',
        status: 'Active'
      },
      {
        agent: 'Lisa Brown',
        unitsReferred: 2,
        totalRevenue: 28900,
        totalPayouts: 8670,
        commissionRate: 30,
        avgRevenuePerUnit: 14450,
        lastReferral: '2023-12-28',
        status: 'Active'
      },
      {
        agent: 'David Lee',
        unitsReferred: 1,
        totalRevenue: 18800,
        totalPayouts: 5640,
        commissionRate: 30,
        avgRevenuePerUnit: 18800,
        lastReferral: '2023-12-15',
        status: 'Inactive'
      }
    ]
  }
};

// GET /api/analytics/overview - Get analytics overview
app.get('/api/analytics/overview', (req, res) => {
  try {
    const { period, dateFrom, dateTo } = req.query;
    
    // Apply period filtering logic here if needed
    let overview = { ...mockAnalyticsData.overview };
    
    // Mock period-based adjustments
    if (period === 'week') {
      overview.totalRevenue = Math.round(overview.totalRevenue * 0.25);
      overview.totalExpenses = Math.round(overview.totalExpenses * 0.25);
      overview.netProfit = Math.round(overview.netProfit * 0.25);
      overview.activeReservations = Math.round(overview.activeReservations * 0.25);
    } else if (period === 'quarter') {
      overview.totalRevenue = Math.round(overview.totalRevenue * 3);
      overview.totalExpenses = Math.round(overview.totalExpenses * 3);
      overview.netProfit = Math.round(overview.netProfit * 3);
      overview.activeReservations = Math.round(overview.activeReservations * 3);
    } else if (period === 'year') {
      overview.totalRevenue = Math.round(overview.totalRevenue * 12);
      overview.totalExpenses = Math.round(overview.totalExpenses * 12);
      overview.netProfit = Math.round(overview.netProfit * 12);
      overview.activeReservations = Math.round(overview.activeReservations * 12);
    }

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics overview'
    });
  }
});

// GET /api/analytics/financials - Get financial analytics
app.get('/api/analytics/financials', (req, res) => {
  try {
    const { period, dateFrom, dateTo, viewMode } = req.query;
    
    // Apply period filtering logic here if needed
    let financials = { ...mockAnalyticsData.financials };
    
    // Mock period-based adjustments
    if (period === 'week') {
      financials.revenue.total = Math.round(financials.revenue.total * 0.25);
      financials.expenses.total = Math.round(financials.expenses.total * 0.25);
      financials.profit.net = Math.round(financials.profit.net * 0.25);
      
      financials.revenue.byUnit.forEach(item => {
        item.revenue = Math.round(item.revenue * 0.25);
      });
      financials.revenue.bySource.forEach(item => {
        item.revenue = Math.round(item.revenue * 0.25);
      });
      financials.expenses.categories.forEach(item => {
        item.amount = Math.round(item.amount * 0.25);
      });
      financials.expenses.byUnit.forEach(item => {
        item.expenses = Math.round(item.expenses * 0.25);
      });
      financials.profit.byUnit.forEach(item => {
        item.profit = Math.round(item.profit * 0.25);
      });
    }

    res.json({
      success: true,
      data: financials
    });
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial analytics'
    });
  }
});

// GET /api/analytics/units - Get units analytics
app.get('/api/analytics/units', (req, res) => {
  try {
    const { period, dateFrom, dateTo, viewMode } = req.query;
    
    // Apply period filtering logic here if needed
    let units = { ...mockAnalyticsData.units };
    
    // Mock period-based adjustments
    if (period === 'week') {
      units.performance.forEach(unit => {
        unit.revenue = Math.round(unit.revenue * 0.25);
        unit.expenses = Math.round(unit.expenses * 0.25);
        unit.profit = Math.round(unit.profit * 0.25);
      });
    }

    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('Error fetching units analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching units analytics'
    });
  }
});

// GET /api/analytics/owners - Get owners analytics
app.get('/api/analytics/owners', (req, res) => {
  try {
    const { period, dateFrom, dateTo, viewMode } = req.query;
    
    // Apply period filtering logic here if needed
    let owners = { ...mockAnalyticsData.owners };
    
    // Mock period-based adjustments
    if (period === 'week') {
      owners.profitability.forEach(owner => {
        owner.totalRevenue = Math.round(owner.totalRevenue * 0.25);
        owner.totalExpenses = Math.round(owner.totalExpenses * 0.25);
        owner.netProfit = Math.round(owner.netProfit * 0.25);
        owner.avgRevenuePerUnit = Math.round(owner.avgRevenuePerUnit * 0.25);
      });
    }

    res.json({
      success: true,
      data: owners
    });
  } catch (error) {
    console.error('Error fetching owners analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching owners analytics'
    });
  }
});

// GET /api/analytics/reservations - Get reservations analytics
app.get('/api/analytics/reservations', (req, res) => {
  try {
    const { period, dateFrom, dateTo, viewMode } = req.query;
    
    // Apply period filtering logic here if needed
    let reservations = { ...mockAnalyticsData.reservations };
    
    // Mock period-based adjustments
    if (period === 'week') {
      reservations.trends.monthly.forEach(trend => {
        trend.reservations = Math.round(trend.reservations * 0.25);
        trend.cancellations = Math.round(trend.cancellations * 0.25);
        trend.net = Math.round(trend.net * 0.25);
      });
    }

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Error fetching reservations analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations analytics'
    });
  }
});

// GET /api/analytics/agents - Get agents analytics
app.get('/api/analytics/agents', (req, res) => {
  try {
    const { period, dateFrom, dateTo, viewMode } = req.query;
    
    // Apply period filtering logic here if needed
    let agents = { ...mockAnalyticsData.agents };
    
    // Mock period-based adjustments
    if (period === 'week') {
      agents.performance.forEach(agent => {
        agent.totalRevenue = Math.round(agent.totalRevenue * 0.25);
        agent.totalPayouts = Math.round(agent.totalPayouts * 0.25);
        agent.avgRevenuePerUnit = Math.round(agent.avgRevenuePerUnit * 0.25);
      });
    }

    res.json({
      success: true,
      data: agents
    });
  } catch (error) {
    console.error('Error fetching agents analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agents analytics'
    });
  }
});

// GET /api/analytics/reports - Get available reports
app.get('/api/analytics/reports', (req, res) => {
  try {
    const reports = [
      {
        id: 1,
        name: 'Monthly Financial Summary',
        description: 'Complete financial overview with revenue, expenses, and profit analysis',
        type: 'Financial',
        lastGenerated: '2024-01-15',
        frequency: 'Monthly',
        recipients: ['admin@roomy.com', 'finance@roomy.com']
      },
      {
        id: 2,
        name: 'Unit Performance Report',
        description: 'Detailed analysis of unit occupancy, revenue, and maintenance costs',
        type: 'Units',
        lastGenerated: '2024-01-14',
        frequency: 'Weekly',
        recipients: ['operations@roomy.com']
      },
      {
        id: 3,
        name: 'Owner Payout Summary',
        description: 'Owner revenue, expenses, and payout calculations',
        type: 'Owners',
        lastGenerated: '2024-01-12',
        frequency: 'Monthly',
        recipients: ['owners@roomy.com']
      }
    ];

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
});

// POST /api/analytics/reports/generate - Generate custom report
app.post('/api/analytics/reports/generate', (req, res) => {
  try {
    const { reportName, reportType, dateRange, filters, chartType, exportFormat } = req.body;
    
    // Mock report generation
    const report = {
      id: Date.now(),
      name: reportName || 'Custom Report',
      type: reportType || 'Custom',
      generatedAt: new Date().toISOString(),
      format: exportFormat || 'PDF',
      status: 'completed',
      downloadUrl: `/api/analytics/reports/download/${Date.now()}`
    };

    res.json({
      success: true,
      data: report,
      message: 'Report generated successfully'
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
});

// POST /api/analytics/export - Export analytics data
app.post('/api/analytics/export', (req, res) => {
  try {
    const { dataType, format, period, filters } = req.body;
    
    if (format === 'csv') {
      // Mock CSV export
      const csvContent = 'Type,Value\nRevenue,125400\nExpenses,18700\nProfit,106700';
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics_export.csv"');
      res.send(csvContent);
    } else if (format === 'pdf') {
      // Mock PDF export
      res.json({
        success: true,
        data: {
          downloadUrl: '/api/analytics/export/download/report.pdf'
        },
        message: 'PDF export completed'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting analytics'
    });
  }
});

// ===========================
// SETTINGS API ENDPOINTS
// ===========================

// Mock settings data
const mockSettingsData = {
  automation: {
    autoConfirmReservations: true,
    autoSendWelcomeEmail: true,
    autoSendCheckoutReminder: true,
    autoCreateCleaningTask: true,
    autoCreateMaintenanceTask: false,
    autoUpdatePricing: false,
    autoSyncWithExternalPlatforms: true
  },
  platform: {
    airbnb: {
      enabled: true,
      apiKey: 'airbnb_api_key_123',
      apiSecret: 'airbnb_secret_456',
      autoSync: true
    },
    booking: {
      enabled: false,
      apiKey: '',
      apiSecret: '',
      autoSync: false
    },
    pricelab: {
      enabled: false,
      apiKey: '',
      autoUpdate: false
    }
  },
  invoice: {
    companyName: 'Roomy Property Management',
    companyAddress: '123 Business Bay, Dubai, UAE',
    companyPhone: '+971 4 123 4567',
    companyEmail: 'info@roomy.com',
    taxNumber: '100123456789003',
    logoUrl: 'https://roomy.com/logo.png',
    defaultCurrency: 'AED',
    paymentTerms: '30 days',
    footerText: 'Thank you for choosing Roomy Property Management'
  },
  autoSender: {
    email: {
      enabled: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@roomy.com',
      smtpPassword: 'encrypted_password',
      fromEmail: 'noreply@roomy.com',
      fromName: 'Roomy Property Management'
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      apiKey: '',
      apiSecret: '',
      fromNumber: ''
    }
  },
  reminder: {
    checkInReminder: {
      enabled: true,
      hoursBefore: 24,
      message: 'Welcome! Your check-in is tomorrow. We look forward to hosting you.'
    },
    checkOutReminder: {
      enabled: true,
      hoursBefore: 2,
      message: 'Your checkout is in 2 hours. Please ensure all belongings are packed.'
    },
    paymentReminder: {
      enabled: true,
      daysAfter: 3,
      message: 'Payment is overdue. Please settle your balance to avoid service interruption.'
    },
    maintenanceReminder: {
      enabled: true,
      daysBefore: 7,
      message: 'Scheduled maintenance is approaching. Please prepare for potential service interruption.'
    }
  },
  general: {
    timezone: 'Asia/Dubai',
    dateFormat: 'DD/MM/YYYY',
    currency: 'AED',
    language: 'en',
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    sessionTimeout: 3600, // 1 hour
    twoFactorAuth: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    }
  }
};

// Helper functions for settings persistence
function loadSettingsData() {
  try {
    const settingsFile = path.join(DATA_DIR, 'settings.json');
    if (fs.existsSync(settingsFile)) {
      const data = fs.readFileSync(settingsFile, 'utf8');
      return { ...mockSettingsData, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error loading settings data:', error);
  }
  return mockSettingsData;
}

function saveSettingsData(settings) {
  try {
    const settingsFile = path.join(DATA_DIR, 'settings.json');
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    console.log('✅ Settings data saved to file');
  } catch (error) {
    console.error('Error saving settings data:', error);
  }
}

// GET /api/settings - Get all settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = loadSettingsData();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching all settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings'
    });
  }
});

// GET /api/settings/automation - Get automation settings
app.get('/api/settings/automation', (req, res) => {
  try {
    const settings = loadSettingsData();
    res.json({
      success: true,
      data: settings.automation
    });
  } catch (error) {
    console.error('Error fetching automation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching automation settings'
    });
  }
});

// PUT /api/settings/automation - Update automation settings
app.put('/api/settings/automation', (req, res) => {
  try {
    const updates = req.body;
    const settings = loadSettingsData();
    
    // Update automation settings
    settings.automation = {
      ...settings.automation,
      ...updates
    };
    
    saveSettingsData(settings);
    
    res.json({
      success: true,
      data: settings.automation,
      message: 'Automation settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating automation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating automation settings'
    });
  }
});

// GET /api/settings/platform-connections - Get platform connection settings
app.get('/api/settings/platform-connections', (req, res) => {
  try {
    const settings = loadSettingsData();
    res.json({
      success: true,
      data: settings.platform
    });
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform settings'
    });
  }
});

// PUT /api/settings/platform-connections - Update platform connection settings
app.put('/api/settings/platform-connections', (req, res) => {
  try {
    const updates = req.body;
    const settings = loadSettingsData();
    
    // Update platform settings
    settings.platform = {
      ...settings.platform,
      ...updates
    };
    
    saveSettingsData(settings);
    
    res.json({
      success: true,
      data: settings.platform,
      message: 'Platform settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating platform settings'
    });
  }
});

// GET /api/settings/invoices - Get invoice settings
app.get('/api/settings/invoices', (req, res) => {
  try {
    const settings = loadSettingsData();
    res.json({
      success: true,
      data: settings.invoice
    });
  } catch (error) {
    console.error('Error fetching invoice settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice settings'
    });
  }
});

// PUT /api/settings/invoices - Update invoice settings
app.put('/api/settings/invoices', (req, res) => {
  try {
    const updates = req.body;
    const settings = loadSettingsData();
    
    // Update invoice settings
    settings.invoice = {
      ...settings.invoice,
      ...updates
    };
    
    saveSettingsData(settings);
    
    res.json({
      success: true,
      data: settings.invoice,
      message: 'Invoice settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice settings'
    });
  }
});

// GET /api/settings/auto-senders - Get auto-sender settings
app.get('/api/settings/auto-senders', (req, res) => {
  try {
    const settings = loadSettingsData();
    res.json({
      success: true,
      data: settings.autoSender
    });
  } catch (error) {
    console.error('Error fetching auto-sender settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching auto-sender settings'
    });
  }
});

// PUT /api/settings/auto-senders - Update auto-sender settings
app.put('/api/settings/auto-senders', (req, res) => {
  try {
    const updates = req.body;
    const settings = loadSettingsData();
    
    // Update auto-sender settings
    settings.autoSender = {
      ...settings.autoSender,
      ...updates
    };
    
    saveSettingsData(settings);
    
    res.json({
      success: true,
      data: settings.autoSender,
      message: 'Auto-sender settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating auto-sender settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating auto-sender settings'
    });
  }
});

// GET /api/settings/reminders - Get reminder settings
app.get('/api/settings/reminders', (req, res) => {
  try {
    const settings = loadSettingsData();
    res.json({
      success: true,
      data: settings.reminder
    });
  } catch (error) {
    console.error('Error fetching reminder settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reminder settings'
    });
  }
});

// PUT /api/settings/reminders - Update reminder settings
app.put('/api/settings/reminders', (req, res) => {
  try {
    const updates = req.body;
    const settings = loadSettingsData();
    
    // Update reminder settings
    settings.reminder = {
      ...settings.reminder,
      ...updates
    };
    
    saveSettingsData(settings);
    
    res.json({
      success: true,
      data: settings.reminder,
      message: 'Reminder settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating reminder settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reminder settings'
    });
  }
});

// GET /api/settings/general - Get general settings
app.get('/api/settings/general', (req, res) => {
  try {
    const settings = loadSettingsData();
    res.json({
      success: true,
      data: settings.general
    });
  } catch (error) {
    console.error('Error fetching general settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching general settings'
    });
  }
});

// PUT /api/settings/general - Update general settings
app.put('/api/settings/general', (req, res) => {
  try {
    const updates = req.body;
    const settings = loadSettingsData();
    
    // Update general settings
    settings.general = {
      ...settings.general,
      ...updates
    };
    
    saveSettingsData(settings);
    
    res.json({
      success: true,
      data: settings.general,
      message: 'General settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating general settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating general settings'
    });
  }
});

// POST /api/settings/test-email - Test email connection
app.post('/api/settings/test-email', (req, res) => {
  try {
    const emailSettings = req.body;
    
    // Mock email test - in real implementation, test SMTP connection
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Email connection test successful'
      });
    }, 2000);
  } catch (error) {
    console.error('Error testing email connection:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing email connection'
    });
  }
});

// POST /api/settings/test-sms - Test SMS connection
app.post('/api/settings/test-sms', (req, res) => {
  try {
    const smsSettings = req.body;
    
    // Mock SMS test - in real implementation, test SMS provider connection
    setTimeout(() => {
      res.json({
        success: true,
        message: 'SMS connection test successful'
      });
    }, 2000);
  } catch (error) {
    console.error('Error testing SMS connection:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing SMS connection'
    });
  }
});

// POST /api/settings/test-platform/:platform - Test platform connection
app.post('/api/settings/test-platform/:platform', (req, res) => {
  try {
    const platform = req.params.platform;
    const platformSettings = req.body;
    
    // Mock platform test - in real implementation, test platform API connection
    setTimeout(() => {
      res.json({
        success: true,
        message: `${platform} connection test successful`
      });
    }, 2000);
  } catch (error) {
    console.error('Error testing platform connection:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing platform connection'
    });
  }
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
