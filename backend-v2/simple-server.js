const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'admin@roomy.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    status: 'ACTIVE',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'owner@roomy.com',
    firstName: 'Property',
    lastName: 'Owner',
    role: 'OWNER',
    status: 'ACTIVE',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Routes
app.get('/api/v2', (req, res) => {
  res.json({
    message: 'Roomy Backend V2 API',
    version: '2.0.0',
    status: 'Active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/v2/auth',
      users: '/api/v2/users',
    },
  });
});

// Auth routes
app.post('/api/v2/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@roomy.com' && password === 'admin123') {
    const user = mockUsers.find(u => u.email === email);
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({
      success: true,
      data: {
        user,
        token,
        expiresIn: '7d'
      },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }
});

app.get('/api/v2/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authorization header with Bearer token is required'
    });
  }
  
  const token = authHeader.substring(7);
  
  if (token.startsWith('mock-jwt-token-')) {
    const user = mockUsers[0]; // Return admin user
    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
});

// Users routes
app.get('/api/v2/users', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authorization header with Bearer token is required'
    });
  }
  
  const { role, page = 1, limit = 10 } = req.query;
  
  let filteredUsers = mockUsers;
  if (role) {
    filteredUsers = mockUsers.filter(user => user.role === role);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      data: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasNextPage: endIndex < filteredUsers.length,
        hasPreviousPage: page > 1
      }
    },
    message: 'Users retrieved successfully'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock Backend V2 server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/v2`);
});
