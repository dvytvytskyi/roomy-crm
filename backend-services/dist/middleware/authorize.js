"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const loggerService_1 = require("../services/loggerService");
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            if (!allowedRoles.includes(req.user.role)) {
                loggerService_1.loggerService.warn('Authorization failed', {
                    userId: req.user.id,
                    userRole: req.user.role,
                    allowedRoles,
                    path: req.path,
                    method: req.method
                });
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
            next();
        }
        catch (error) {
            loggerService_1.loggerService.error('Authorization error', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization failed'
            });
        }
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authorize.js.map