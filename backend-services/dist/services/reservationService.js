"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationService = exports.ReservationService = void 0;
const client_1 = require("@prisma/client");
const loggerService_1 = require("./loggerService");
const prisma = new client_1.PrismaClient();
class ReservationService {
    async getReservations(filters) {
        try {
            const { dateRange, status, source, property, amountRange, guestName, checkInFrom, checkInTo, minAmount, maxAmount, page = 1, limit = 50 } = filters;
            const skip = (page - 1) * limit;
            const where = {};
            if (dateRange?.from || checkInFrom) {
                where.checkIn = {
                    gte: new Date(dateRange?.from || checkInFrom)
                };
            }
            if (dateRange?.to || checkInTo) {
                where.checkIn = {
                    ...where.checkIn,
                    lte: new Date(dateRange?.to || checkInTo)
                };
            }
            if (status && status.length > 0) {
                where.status = {
                    in: status
                };
            }
            if (source && source.length > 0) {
                where.source = {
                    in: source
                };
            }
            if (property && property.length > 0) {
                where.propertyId = {
                    in: property
                };
            }
            if (amountRange?.min || minAmount) {
                where.totalAmount = {
                    gte: parseFloat(amountRange?.min || minAmount)
                };
            }
            if (amountRange?.max || maxAmount) {
                where.totalAmount = {
                    ...where.totalAmount,
                    lte: parseFloat(amountRange?.max || maxAmount)
                };
            }
            if (guestName) {
                where.guest = {
                    OR: [
                        { firstName: { contains: guestName, mode: 'insensitive' } },
                        { lastName: { contains: guestName, mode: 'insensitive' } },
                        { email: { contains: guestName, mode: 'insensitive' } }
                    ]
                };
            }
            loggerService_1.loggerService.info('Fetching reservations with filters', { where, skip, limit });
            const [reservations, total] = await Promise.all([
                prisma.reservation.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        property: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                                address: true,
                                city: true
                            }
                        },
                        guest: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true
                            }
                        },
                        adjustments: {
                            select: {
                                id: true,
                                type: true,
                                amount: true,
                                description: true,
                                reason: true,
                                createdAt: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                prisma.reservation.count({ where })
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                reservations: reservations.map(this.mapReservationToResponse),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        }
        catch (error) {
            loggerService_1.loggerService.error('Error fetching reservations', error);
            throw new Error('Failed to fetch reservations');
        }
    }
    async getReservationById(id, userId) {
        try {
            const reservation = await prisma.reservation.findUnique({
                where: { id },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true,
                            city: true,
                            country: true,
                            capacity: true,
                            bedrooms: true,
                            bathrooms: true,
                            pricePerNight: true,
                            amenities: {
                                include: {
                                    amenity: {
                                        select: {
                                            id: true,
                                            name: true,
                                            category: true,
                                            icon: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    guest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            avatar: true
                        }
                    },
                    adjustments: {
                        select: {
                            id: true,
                            type: true,
                            amount: true,
                            description: true,
                            reason: true,
                            createdAt: true,
                            createdBy: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    },
                    transactions: {
                        select: {
                            id: true,
                            type: true,
                            amount: true,
                            currency: true,
                            status: true,
                            description: true,
                            createdAt: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            if (userId) {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { role: true }
                });
                if (user?.role === 'OWNER' && reservation.property.ownerId !== userId) {
                    throw new Error('Access denied');
                }
            }
            return this.mapReservationToResponse(reservation);
        }
        catch (error) {
            loggerService_1.loggerService.error('Error fetching reservation by ID', error);
            throw error;
        }
    }
    async createReservation(data, userId) {
        try {
            const property = await prisma.property.findUnique({
                where: { id: data.propertyId },
                include: {
                    availability: {
                        where: {
                            date: {
                                gte: new Date(data.checkIn),
                                lte: new Date(data.checkOut)
                            },
                            status: 'BOOKED'
                        }
                    }
                }
            });
            if (!property) {
                throw new Error('Property not found');
            }
            if (property.availability.length > 0) {
                throw new Error('Property is not available for the selected dates');
            }
            const guest = await prisma.user.findUnique({
                where: { id: data.guestId }
            });
            if (!guest) {
                throw new Error('Guest not found');
            }
            const checkInDate = new Date(data.checkIn);
            const checkOutDate = new Date(data.checkOut);
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            const totalAmount = nights * property.pricePerNight;
            const reservation = await prisma.reservation.create({
                data: {
                    propertyId: data.propertyId,
                    guestId: data.guestId,
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    status: data.status || 'PENDING',
                    paymentStatus: data.paymentStatus || 'UNPAID',
                    guestStatus: data.guestStatus || 'UPCOMING',
                    totalAmount,
                    paidAmount: data.paidAmount || 0,
                    guestCount: data.guestCount || 1,
                    specialRequests: data.specialRequests,
                    source: data.source || 'DIRECT',
                    externalId: data.externalId
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true,
                            city: true
                        }
                    },
                    guest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
            await this.updateAvailability(data.propertyId, data.checkIn, data.checkOut, 'BOOKED');
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: 'CREATE_RESERVATION',
                    entity: 'RESERVATION',
                    entityId: reservation.id,
                    newData: reservation
                }
            });
            loggerService_1.loggerService.info('Reservation created successfully', {
                reservationId: reservation.id,
                userId
            });
            return this.mapReservationToResponse(reservation);
        }
        catch (error) {
            loggerService_1.loggerService.error('Error creating reservation', error);
            throw error;
        }
    }
    async updateReservation(id, data, userId) {
        try {
            const existingReservation = await prisma.reservation.findUnique({
                where: { id }
            });
            if (!existingReservation) {
                throw new Error('Reservation not found');
            }
            if (data.checkIn || data.checkOut) {
                const newCheckIn = data.checkIn ? new Date(data.checkIn) : existingReservation.checkIn;
                const newCheckOut = data.checkOut ? new Date(data.checkOut) : existingReservation.checkOut;
                const conflictingReservations = await prisma.reservation.findMany({
                    where: {
                        propertyId: existingReservation.propertyId,
                        id: { not: id },
                        OR: [
                            {
                                checkIn: { lt: newCheckOut },
                                checkOut: { gt: newCheckIn }
                            }
                        ]
                    }
                });
                if (conflictingReservations.length > 0) {
                    throw new Error('Property is not available for the new dates');
                }
            }
            let totalAmount = existingReservation.totalAmount;
            if (data.checkIn || data.checkOut || data.propertyId) {
                const propertyId = data.propertyId || existingReservation.propertyId;
                const checkIn = data.checkIn ? new Date(data.checkIn) : existingReservation.checkIn;
                const checkOut = data.checkOut ? new Date(data.checkOut) : existingReservation.checkOut;
                const property = await prisma.property.findUnique({
                    where: { id: propertyId }
                });
                if (property) {
                    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                    totalAmount = nights * property.pricePerNight;
                }
            }
            const updatedReservation = await prisma.reservation.update({
                where: { id },
                data: {
                    ...data,
                    totalAmount,
                    updatedAt: new Date()
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true,
                            city: true
                        }
                    },
                    guest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: 'UPDATE_RESERVATION',
                    entity: 'RESERVATION',
                    entityId: id,
                    oldData: existingReservation,
                    newData: updatedReservation
                }
            });
            loggerService_1.loggerService.info('Reservation updated successfully', {
                reservationId: id,
                userId
            });
            return this.mapReservationToResponse(updatedReservation);
        }
        catch (error) {
            loggerService_1.loggerService.error('Error updating reservation', error);
            throw error;
        }
    }
    async deleteReservation(id, userId) {
        try {
            const reservation = await prisma.reservation.findUnique({
                where: { id }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            await this.updateAvailability(reservation.propertyId, reservation.checkIn.toISOString(), reservation.checkOut.toISOString(), 'AVAILABLE');
            await prisma.reservation.delete({
                where: { id }
            });
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: 'DELETE_RESERVATION',
                    entity: 'RESERVATION',
                    entityId: id,
                    oldData: reservation
                }
            });
            loggerService_1.loggerService.info('Reservation deleted successfully', {
                reservationId: id,
                userId
            });
        }
        catch (error) {
            loggerService_1.loggerService.error('Error deleting reservation', error);
            throw error;
        }
    }
    async updateReservationStatus(id, data, userId) {
        try {
            const reservation = await prisma.reservation.findUnique({
                where: { id }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            const updatedReservation = await prisma.reservation.update({
                where: { id },
                data: {
                    status: data.status,
                    paymentStatus: data.paymentStatus,
                    guestStatus: data.guestStatus,
                    updatedAt: new Date()
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true,
                            city: true
                        }
                    },
                    guest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: 'UPDATE_RESERVATION_STATUS',
                    entity: 'RESERVATION',
                    entityId: id,
                    oldData: reservation,
                    newData: updatedReservation
                }
            });
            loggerService_1.loggerService.info('Reservation status updated successfully', {
                reservationId: id,
                userId,
                newStatus: data.status
            });
            return this.mapReservationToResponse(updatedReservation);
        }
        catch (error) {
            loggerService_1.loggerService.error('Error updating reservation status', error);
            throw error;
        }
    }
    async checkInGuest(id, userId) {
        try {
            const reservation = await prisma.reservation.findUnique({
                where: { id }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            if (reservation.status !== 'CONFIRMED') {
                throw new Error('Reservation must be confirmed before check-in');
            }
            const updatedReservation = await prisma.reservation.update({
                where: { id },
                data: {
                    guestStatus: 'CHECKED_IN',
                    updatedAt: new Date()
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true,
                            city: true
                        }
                    },
                    guest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: 'CHECK_IN_GUEST',
                    entity: 'RESERVATION',
                    entityId: id,
                    oldData: reservation,
                    newData: updatedReservation
                }
            });
            loggerService_1.loggerService.info('Guest checked in successfully', {
                reservationId: id,
                userId
            });
            return this.mapReservationToResponse(updatedReservation);
        }
        catch (error) {
            loggerService_1.loggerService.error('Error checking in guest', error);
            throw error;
        }
    }
    async checkOutGuest(id, userId) {
        try {
            const reservation = await prisma.reservation.findUnique({
                where: { id }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            if (reservation.guestStatus !== 'CHECKED_IN') {
                throw new Error('Guest must be checked in before check-out');
            }
            const updatedReservation = await prisma.reservation.update({
                where: { id },
                data: {
                    guestStatus: 'CHECKED_OUT',
                    status: 'COMPLETED',
                    updatedAt: new Date()
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true,
                            city: true
                        }
                    },
                    guest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
            await this.updateAvailability(reservation.propertyId, reservation.checkIn.toISOString(), reservation.checkOut.toISOString(), 'AVAILABLE');
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: 'CHECK_OUT_GUEST',
                    entity: 'RESERVATION',
                    entityId: id,
                    oldData: reservation,
                    newData: updatedReservation
                }
            });
            loggerService_1.loggerService.info('Guest checked out successfully', {
                reservationId: id,
                userId
            });
            return this.mapReservationToResponse(updatedReservation);
        }
        catch (error) {
            loggerService_1.loggerService.error('Error checking out guest', error);
            throw error;
        }
    }
    async markAsNoShow(id, userId) {
        try {
            const reservation = await prisma.reservation.findUnique({
                where: { id }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            const updatedReservation = await prisma.reservation.update({
                where: { id },
                data: {
                    guestStatus: 'NO_SHOW',
                    status: 'NO_SHOW',
                    updatedAt: new Date()
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true,
                            city: true
                        }
                    },
                    guest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
            await this.updateAvailability(reservation.propertyId, reservation.checkIn.toISOString(), reservation.checkOut.toISOString(), 'AVAILABLE');
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: 'MARK_NO_SHOW',
                    entity: 'RESERVATION',
                    entityId: id,
                    oldData: reservation,
                    newData: updatedReservation
                }
            });
            loggerService_1.loggerService.info('Reservation marked as no-show', {
                reservationId: id,
                userId
            });
            return this.mapReservationToResponse(updatedReservation);
        }
        catch (error) {
            loggerService_1.loggerService.error('Error marking reservation as no-show', error);
            throw error;
        }
    }
    async getReservationCalendar(propertyId, startDate, endDate, userId) {
        try {
            const where = {};
            if (propertyId) {
                where.propertyId = propertyId;
            }
            if (startDate && endDate) {
                where.OR = [
                    {
                        checkIn: {
                            gte: new Date(startDate),
                            lte: new Date(endDate)
                        }
                    },
                    {
                        checkOut: {
                            gte: new Date(startDate),
                            lte: new Date(endDate)
                        }
                    },
                    {
                        AND: [
                            { checkIn: { lte: new Date(startDate) } },
                            { checkOut: { gte: new Date(endDate) } }
                        ]
                    }
                ];
            }
            const reservations = await prisma.reservation.findMany({
                where,
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    guest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: {
                    checkIn: 'asc'
                }
            });
            const calendar = reservations.map(reservation => ({
                id: reservation.id,
                title: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
                start: reservation.checkIn.toISOString(),
                end: reservation.checkOut.toISOString(),
                propertyId: reservation.propertyId,
                propertyName: reservation.property.name,
                status: reservation.status,
                guestStatus: reservation.guestStatus,
                totalAmount: reservation.totalAmount,
                guestCount: reservation.guestCount
            }));
            return calendar;
        }
        catch (error) {
            loggerService_1.loggerService.error('Error fetching reservation calendar', error);
            throw error;
        }
    }
    async getReservationStats(propertyId, startDate, endDate, userId) {
        try {
            const where = {};
            if (propertyId) {
                where.propertyId = propertyId;
            }
            if (startDate && endDate) {
                where.checkIn = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }
            const [totalReservations, confirmedReservations, pendingReservations, cancelledReservations, completedReservations, totalRevenue, averageStay] = await Promise.all([
                prisma.reservation.count({ where }),
                prisma.reservation.count({ where: { ...where, status: 'CONFIRMED' } }),
                prisma.reservation.count({ where: { ...where, status: 'PENDING' } }),
                prisma.reservation.count({ where: { ...where, status: 'CANCELLED' } }),
                prisma.reservation.count({ where: { ...where, status: 'COMPLETED' } }),
                prisma.reservation.aggregate({
                    where: { ...where, status: { in: ['CONFIRMED', 'COMPLETED'] } },
                    _sum: { totalAmount: true }
                }),
                prisma.reservation.aggregate({
                    where: { ...where, status: { in: ['CONFIRMED', 'COMPLETED'] } },
                    _avg: {
                        totalAmount: true
                    }
                })
            ]);
            const stats = {
                totalReservations,
                confirmedReservations,
                pendingReservations,
                cancelledReservations,
                completedReservations,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                averageStay: averageStay._avg.totalAmount || 0,
                occupancyRate: totalReservations > 0 ? (confirmedReservations + completedReservations) / totalReservations * 100 : 0
            };
            return stats;
        }
        catch (error) {
            loggerService_1.loggerService.error('Error fetching reservation statistics', error);
            throw error;
        }
    }
    async getReservationSources() {
        try {
            const sources = await prisma.reservation.groupBy({
                by: ['source'],
                _count: {
                    source: true
                },
                orderBy: {
                    _count: {
                        source: 'desc'
                    }
                }
            });
            return sources.map(source => ({
                source: source.source,
                count: source._count.source
            }));
        }
        catch (error) {
            loggerService_1.loggerService.error('Error fetching reservation sources', error);
            throw error;
        }
    }
    async getAvailableProperties(startDate, endDate, guests, userId) {
        try {
            const where = {
                isActive: true,
                isPublished: true
            };
            if (guests) {
                where.capacity = {
                    gte: guests
                };
            }
            const properties = await prisma.property.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    type: true,
                    address: true,
                    city: true,
                    capacity: true,
                    bedrooms: true,
                    bathrooms: true,
                    pricePerNight: true,
                    images: {
                        where: { isPrimary: true },
                        select: { url: true }
                    }
                }
            });
            if (startDate && endDate) {
                const availableProperties = [];
                for (const property of properties) {
                    const conflictingReservations = await prisma.reservation.findMany({
                        where: {
                            propertyId: property.id,
                            OR: [
                                {
                                    checkIn: { lt: new Date(endDate) },
                                    checkOut: { gt: new Date(startDate) }
                                }
                            ],
                            status: { in: ['CONFIRMED', 'PENDING'] }
                        }
                    });
                    if (conflictingReservations.length === 0) {
                        availableProperties.push({
                            ...property,
                            primaryImage: property.images[0]?.url || null
                        });
                    }
                }
                return availableProperties;
            }
            return properties.map(property => ({
                ...property,
                primaryImage: property.images[0]?.url || null
            }));
        }
        catch (error) {
            loggerService_1.loggerService.error('Error fetching available properties', error);
            throw error;
        }
    }
    async updateAvailability(propertyId, startDate, endDate, status) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const dates = [];
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d));
            }
            await Promise.all(dates.map(date => prisma.availability.upsert({
                where: {
                    propertyId_date: {
                        propertyId,
                        date
                    }
                },
                update: {
                    status: status,
                    updatedAt: new Date()
                },
                create: {
                    propertyId,
                    date,
                    status: status
                }
            })));
        }
        catch (error) {
            loggerService_1.loggerService.error('Error updating availability', error);
            throw error;
        }
    }
    mapReservationToResponse(reservation) {
        return {
            id: reservation.id,
            propertyId: reservation.propertyId,
            propertyName: reservation.property?.name || '',
            propertyType: reservation.property?.type || '',
            propertyAddress: reservation.property?.address || '',
            propertyCity: reservation.property?.city || '',
            guestId: reservation.guestId,
            guestName: reservation.guest ? `${reservation.guest.firstName} ${reservation.guest.lastName}` : '',
            guestEmail: reservation.guest?.email || '',
            guestPhone: reservation.guest?.phone || '',
            checkIn: reservation.checkIn.toISOString(),
            checkOut: reservation.checkOut.toISOString(),
            status: reservation.status,
            paymentStatus: reservation.paymentStatus,
            guestStatus: reservation.guestStatus,
            totalAmount: reservation.totalAmount,
            paidAmount: reservation.paidAmount,
            outstandingBalance: reservation.totalAmount - reservation.paidAmount,
            guestCount: reservation.guestCount,
            nights: Math.ceil((new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
            specialRequests: reservation.specialRequests,
            source: reservation.source,
            externalId: reservation.externalId,
            adjustments: reservation.adjustments || [],
            transactions: reservation.transactions || [],
            createdAt: reservation.createdAt.toISOString(),
            updatedAt: reservation.updatedAt.toISOString()
        };
    }
}
exports.ReservationService = ReservationService;
exports.reservationService = new ReservationService();
//# sourceMappingURL=reservationService.js.map