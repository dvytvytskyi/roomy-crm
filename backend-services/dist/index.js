"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middleware/errorHandler");
const loggerService_1 = require("./services/loggerService");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const reservationRoutes_1 = require("./routes/reservationRoutes");
const transactionRoutes_1 = require("./routes/transactionRoutes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
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
app.use((0, morgan_1.default)("combined"));
app.use((0, compression_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/properties", propertyRoutes_1.default);
app.use("/api/reservations", reservationRoutes_1.reservationRoutes);
app.use("/api/transactions", transactionRoutes_1.transactionRoutes);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const server = app.listen(PORT, () => {
    loggerService_1.loggerService.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
    });
});
process.on("SIGTERM", () => {
    loggerService_1.loggerService.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
        loggerService_1.loggerService.info("Process terminated");
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    loggerService_1.loggerService.info("SIGINT received, shutting down gracefully");
    server.close(() => {
        loggerService_1.loggerService.info("Process terminated");
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map