import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { loggerService } from "./services/loggerService";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import { reservationRoutes } from "./routes/reservationRoutes";
import { transactionRoutes } from "./routes/transactionRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// Logging middleware
app.use(morgan("combined"));

// Compression middleware
app.use(compression());

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
