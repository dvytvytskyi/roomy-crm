import { Request } from "express";
import { User } from "@prisma/client";
export interface AuthRequest extends Request {
    user?: User;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
}
export interface FilterParams {
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export declare enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    AGENT = "AGENT",
    OWNER = "OWNER",
    GUEST = "GUEST",
    CLEANER = "CLEANER",
    MAINTENANCE = "MAINTENANCE"
}
export interface Reservation {
    id: string;
    propertyId: string;
    propertyName: string;
    propertyType: string;
    propertyAddress: string;
    propertyCity: string;
    guestId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
    status: ReservationStatus;
    paymentStatus: PaymentStatus;
    guestStatus: GuestStatus;
    totalAmount: number;
    paidAmount: number;
    outstandingBalance: number;
    guestCount: number;
    nights: number;
    specialRequests?: string;
    source: ReservationSource;
    externalId?: string;
    adjustments: ReservationAdjustment[];
    transactions: Transaction[];
    createdAt: string;
    updatedAt: string;
}
export interface ReservationAdjustment {
    id: string;
    type: AdjustmentType;
    amount: number;
    description: string;
    reason?: string;
    createdAt: string;
    createdBy: string;
}
export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    description?: string;
    createdAt: string;
}
export interface CreateReservationRequest {
    propertyId: string;
    guestId: string;
    checkIn: string;
    checkOut: string;
    guestCount?: number;
    status?: ReservationStatus;
    paymentStatus?: PaymentStatus;
    guestStatus?: GuestStatus;
    specialRequests?: string;
    source?: ReservationSource;
    externalId?: string;
    paidAmount?: number;
}
export interface UpdateReservationRequest {
    checkIn?: string;
    checkOut?: string;
    guestCount?: number;
    status?: ReservationStatus;
    paymentStatus?: PaymentStatus;
    guestStatus?: GuestStatus;
    specialRequests?: string;
    paidAmount?: number;
}
export interface ReservationStatusUpdate {
    status?: ReservationStatus;
    paymentStatus?: PaymentStatus;
    guestStatus?: GuestStatus;
}
export interface ReservationFilters {
    dateRange?: {
        from: string;
        to: string;
    };
    status?: string[];
    source?: string[];
    property?: string[];
    amountRange?: {
        min: string;
        max: string;
    };
    guestName?: string;
    checkInFrom?: string;
    checkInTo?: string;
    minAmount?: string;
    maxAmount?: string;
    page?: number;
    limit?: number;
}
export interface ReservationStats {
    totalReservations: number;
    confirmedReservations: number;
    pendingReservations: number;
    cancelledReservations: number;
    completedReservations: number;
    totalRevenue: number;
    averageStay: number;
    occupancyRate: number;
}
export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    propertyId: string;
    propertyName: string;
    status: ReservationStatus;
    guestStatus: GuestStatus;
    totalAmount: number;
    guestCount: number;
}
export interface AvailableProperty {
    id: string;
    name: string;
    type: string;
    address: string;
    city: string;
    capacity: number;
    bedrooms: number;
    bathrooms: number;
    pricePerNight: number;
    primaryImage?: string;
}
export declare enum ReservationStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
    NO_SHOW = "NO_SHOW",
    MODIFIED = "MODIFIED"
}
export declare enum PaymentStatus {
    UNPAID = "UNPAID",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    FULLY_PAID = "FULLY_PAID",
    REFUNDED = "REFUNDED",
    PENDING_REFUND = "PENDING_REFUND"
}
export declare enum GuestStatus {
    UPCOMING = "UPCOMING",
    CHECKED_IN = "CHECKED_IN",
    CHECKED_OUT = "CHECKED_OUT",
    NO_SHOW = "NO_SHOW",
    CANCELLED = "CANCELLED"
}
export declare enum ReservationSource {
    DIRECT = "DIRECT",
    AIRBNB = "AIRBNB",
    BOOKING_COM = "BOOKING_COM",
    VRBO = "VRBO",
    OTHER = "OTHER"
}
export declare enum AdjustmentType {
    DISCOUNT = "DISCOUNT",
    FEE = "FEE",
    REFUND = "REFUND",
    DAMAGE = "DAMAGE",
    OTHER = "OTHER"
}
export declare enum TransactionType {
    PAYMENT = "PAYMENT",
    REFUND = "REFUND",
    CHARGE = "CHARGE",
    WITHDRAWAL = "WITHDRAWAL",
    COMMISSION = "COMMISSION",
    FEE = "FEE"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
//# sourceMappingURL=types.d.ts.map