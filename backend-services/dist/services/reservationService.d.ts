import { CreateReservationRequest, UpdateReservationRequest, ReservationFilters, ReservationStatusUpdate, Reservation, ReservationStats, CalendarEvent } from '../types';
export declare class ReservationService {
    getReservations(filters: ReservationFilters): Promise<{
        reservations: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getReservationById(id: string, userId?: string): Promise<Reservation>;
    createReservation(data: CreateReservationRequest, userId: string): Promise<Reservation>;
    updateReservation(id: string, data: UpdateReservationRequest, userId: string): Promise<Reservation>;
    deleteReservation(id: string, userId: string): Promise<void>;
    updateReservationStatus(id: string, data: ReservationStatusUpdate, userId: string): Promise<Reservation>;
    checkInGuest(id: string, userId: string): Promise<Reservation>;
    checkOutGuest(id: string, userId: string): Promise<Reservation>;
    markAsNoShow(id: string, userId: string): Promise<Reservation>;
    getReservationCalendar(propertyId?: string, startDate?: string, endDate?: string, userId?: string): Promise<CalendarEvent[]>;
    getReservationStats(propertyId?: string, startDate?: string, endDate?: string, userId?: string): Promise<ReservationStats>;
    getReservationSources(): Promise<any>;
    getAvailableProperties(startDate?: string, endDate?: string, guests?: number, userId?: string): Promise<any>;
    private updateAvailability;
    private mapReservationToResponse;
}
export declare const reservationService: ReservationService;
//# sourceMappingURL=reservationService.d.ts.map