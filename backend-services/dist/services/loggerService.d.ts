declare class LoggerService {
    private isDevelopment;
    private formatMessage;
    private log;
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}
export declare const loggerService: LoggerService;
export {};
//# sourceMappingURL=loggerService.d.ts.map