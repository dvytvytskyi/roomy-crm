import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { loggerService } from "./services/loggerService";
import userRoutes from "../../backend-modifications/userRoutes";
import authRoutes from "../../backend-modifications/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import { reservationRoutes } from "./routes/reservationRoutes";
import { transactionRoutes } from "./routes/transactionRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Logging middleware
app.use(morgan("combined"));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

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

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/transactions", transactionRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  loggerService.info(`Server running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  loggerService.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    loggerService.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  loggerService.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    loggerService.info("Process terminated");
    process.exit(0);
  });
});

export default app;
