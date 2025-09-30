"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerService = void 0;
const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};
class LoggerService {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    }
    log(level, message, meta) {
        const formattedMessage = this.formatMessage(level, message, meta);
        switch (level) {
            case LOG_LEVELS.ERROR:
                console.error(formattedMessage);
                break;
            case LOG_LEVELS.WARN:
                console.warn(formattedMessage);
                break;
            case LOG_LEVELS.INFO:
                console.info(formattedMessage);
                break;
            case LOG_LEVELS.DEBUG:
                if (this.isDevelopment) {
                    console.debug(formattedMessage);
                }
                break;
            default:
                console.log(formattedMessage);
        }
    }
    error(message, meta) {
        this.log(LOG_LEVELS.ERROR, message, meta);
    }
    warn(message, meta) {
        this.log(LOG_LEVELS.WARN, message, meta);
    }
    info(message, meta) {
        this.log(LOG_LEVELS.INFO, message, meta);
    }
    debug(message, meta) {
        this.log(LOG_LEVELS.DEBUG, message, meta);
    }
}
exports.loggerService = new LoggerService();
//# sourceMappingURL=loggerService.js.map