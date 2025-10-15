import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export class PublicController {
  /**
   * Get all active properties for public listing (SAFE DATA ONLY)
   * Only returns data safe for public consumption
   */
  public static async getPublicProperties(req: Request, res: Response): Promise<void> {
    const prisma = new PrismaClient();
    try {
      const {
        page = 1,
        limit = 45,
        checkIn,
        checkOut,
        minOccupancy,
        search,
        type,
        location
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build filter conditions - only active and published properties
      const where: any = {
        is_active: true,
        is_published: true,
      };

      // Об'єднуємо search та location фільтри
      const searchFilters = [];
      
      if (search) {
        searchFilters.push(
          { name: { contains: search as string, mode: 'insensitive' } },
          { address: { contains: search as string, mode: 'insensitive' } },
          { city: { contains: search as string, mode: 'insensitive' } }
        );
      }

      if (location) {
        searchFilters.push(
          { city: { contains: location as string, mode: 'insensitive' } },
          { address: { contains: location as string, mode: 'insensitive' } },
          { name: { contains: location as string, mode: 'insensitive' } }
        );
      }

      if (searchFilters.length > 0) {
        where.OR = searchFilters;
      }

      if (type) {
        where.type = type;
      }

      if (minOccupancy) {
        where.capacity = { gte: parseInt(minOccupancy as string) };
      }

      // Fetch properties with SAFE fields only
      const [properties, total] = await Promise.all([
        prisma.properties.findMany({
          where,
          skip,
          take: limitNum,
          select: {
            // SAFE FIELDS ONLY - no confidential data
            id: true,
            name: true,
            address: true,
            city: true,
            country: true,
            type: true,
            bedrooms: true,
            bathrooms: true,
            capacity: true,
            price_per_night: true,
            amenities: true,
            primary_image: true,
            description: true,
            latitude: true,
            longitude: true,
            // Marketing fields (safe for public)
            summary: true,
            the_space: true,
            guest_access: true,
            // Booking rules (safe for public)
            min_stay: true,
            max_stay: true,
            check_in_time: true,
            check_out_time: true,
            allows_pets: true,
            property_photos: {
              select: {
                url: true,
                is_cover: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        }),
        prisma.properties.count({ where }),
      ]);

      // Format response to match expected structure (same as before)
      const results = properties.map((property) => ({
        _id: property.id,
        title: property.name,
        address: {
          full: property.address,
          city: property.city,
          country: property.country,
        },
        picture: {
          large: property.primary_image || 
                 property.property_photos.find(p => p.is_cover)?.url ||
                 property.property_photos[0]?.url ||
                 '/placeholder-image.svg',
        },
        pictures: property.property_photos.map(p => ({
          large: p.url,
          medium: p.url,
          thumbnail: p.url,
        })),
        beds: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        accommodates: property.capacity || 1,
        prices: {
          currency: 'AED',
          basePrice: property.price_per_night || 0,
        },
        amenities: property.amenities || [],
        publicDescription: {
          summary: property.description || property.summary || '',
          theSpace: property.the_space || '',
          guestAccess: property.guest_access || '',
        },
        propertyType: property.type,
        coordinates: {
          lat: property.latitude,
          lng: property.longitude,
        },
        bookingRules: {
          minNights: property.min_stay,
          maxNights: property.max_stay,
          checkInTime: property.check_in_time,
          checkOutTime: property.check_out_time,
          allowsPets: property.allows_pets,
        },
      }));

      res.status(200).json({
        success: true,
        results,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error in getPublicProperties:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch properties',
        timestamp: new Date().toISOString(),
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Get property details by ID (SAFE DATA ONLY)
   * Only returns data safe for public consumption
   */
  public static async getPropertyDetails(req: Request, res: Response): Promise<void> {
    const prisma = new PrismaClient();
    try {
      const { id } = req.params;

      const property = await prisma.properties.findUnique({
        where: { id },
        select: {
          // SAFE FIELDS ONLY - no confidential data
          id: true,
          name: true,
          address: true,
          city: true,
          country: true,
          type: true,
          bedrooms: true,
          bathrooms: true,
          capacity: true,
          price_per_night: true,
          amenities: true,
          primary_image: true,
          description: true,
          latitude: true,
          longitude: true,
          // Marketing fields (safe for public)
          summary: true,
          the_space: true,
          guest_access: true,
          other_things: true,
          // Booking rules (safe for public)
          min_stay: true,
          max_stay: true,
          check_in_time: true,
          check_out_time: true,
          allows_pets: true,
          property_photos: {
            select: {
              url: true,
              is_cover: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          // Safety check
          is_active: true,
          is_published: true,
        },
      });

      if (!property || !property.is_active || !property.is_published) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Property not found or not available',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Format response
      const result = {
        _id: property.id,
        title: property.name,
        address: {
          full: property.address,
          city: property.city,
          country: property.country,
        },
        picture: {
          large: property.primary_image || 
                 property.property_photos.find(p => p.is_cover)?.url ||
                 property.property_photos[0]?.url ||
                 '/placeholder-image.svg',
        },
        pictures: property.property_photos.map(p => ({
          large: p.url,
          medium: p.url,
          thumbnail: p.url,
        })),
        beds: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        accommodates: property.capacity || 1,
        prices: {
          currency: 'AED',
          basePrice: property.price_per_night || 0,
        },
        amenities: property.amenities || [],
        publicDescription: {
          summary: property.description || property.summary || '',
          theSpace: property.the_space || '',
          guestAccess: property.guest_access || '',
          otherThings: property.other_things || '',
        },
        propertyType: property.type,
        coordinates: {
          lat: property.latitude,
          lng: property.longitude,
        },
        bookingRules: {
          minNights: property.min_stay,
          maxNights: property.max_stay,
          checkInTime: property.check_in_time,
          checkOutTime: property.check_out_time,
          allowsPets: property.allows_pets,
        },
      };

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error in getPropertyDetails:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch property details',
        timestamp: new Date().toISOString(),
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Get property availability calendar (SAFE DATA ONLY)
   * Only returns blocked dates, no reservation details
   */
  public static async getPropertyAvailability(req: Request, res: Response): Promise<void> {
    const prisma = new PrismaClient();
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      // Check if property exists and is published
      const property = await prisma.properties.findUnique({
        where: { id },
        select: { id: true, is_active: true, is_published: true },
      });

      if (!property || !property.is_active || !property.is_published) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Property not found or not available',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Fetch reservations for this property in the date range
      const reservations = await prisma.reservations.findMany({
        where: {
          property_id: id,
          status: {
            in: ['CONFIRMED', 'PENDING', 'CHECKED_IN'],
          },
          OR: [
            {
              AND: [
                { check_in: { lte: endDate ? new Date(endDate as string) : undefined } },
                { check_out: { gte: startDate ? new Date(startDate as string) : undefined } },
              ],
            },
          ],
        },
        select: {
          check_in: true,
          check_out: true,
          status: true,
          // NO guest information - privacy protection
        },
      });

      // Format availability data (only dates, no personal info)
      const blockedDates = reservations.map((reservation) => ({
        start: reservation.check_in.toISOString().split('T')[0],
        end: reservation.check_out.toISOString().split('T')[0],
        status: reservation.status,
      }));

      res.status(200).json({
        success: true,
        data: {
          propertyId: id,
          blockedDates,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error in getPropertyAvailability:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch property availability',
        timestamp: new Date().toISOString(),
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Check availability for specific dates (SAFE)
   * Returns only availability status, no personal data
   */
  public static async checkAvailability(req: Request, res: Response): Promise<void> {
    const prisma = new PrismaClient();
    try {
      const { propertyId, checkIn, checkOut } = req.body;

      if (!propertyId || !checkIn || !checkOut) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'propertyId, checkIn, and checkOut are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if property exists and is published
      const property = await prisma.properties.findUnique({
        where: { id: propertyId },
        select: { id: true, is_active: true, is_published: true },
      });

      if (!property || !property.is_active || !property.is_published) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Property not found or not available',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Check for overlapping reservations
      const conflictingReservations = await prisma.reservations.count({
        where: {
          property_id: propertyId,
          status: {
            in: ['CONFIRMED', 'PENDING', 'CHECKED_IN'],
          },
          OR: [
            {
              AND: [
                { check_in: { lte: checkOutDate } },
                { check_out: { gte: checkInDate } },
              ],
            },
          ],
        },
      });

      const isAvailable = conflictingReservations === 0;

      res.status(200).json({
        success: true,
        data: {
          available: isAvailable,
          propertyId,
          checkIn,
          checkOut,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error in checkAvailability:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to check availability',
        timestamp: new Date().toISOString(),
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Create a new reservation (booking request)
   * Creates guest user if needed and reservation
   */
  public static async createReservation(req: Request, res: Response): Promise<void> {
    const prisma = new PrismaClient();
    try {
      const {
        propertyId,
        checkIn,
        checkOut,
        guestInfo,
        numberOfGuests,
        totalPrice,
        notes,
      } = req.body;

      if (!propertyId || !checkIn || !checkOut || !guestInfo) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'propertyId, checkIn, checkOut, and guestInfo are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if property exists and is published
      const property = await prisma.properties.findUnique({
        where: { id: propertyId },
        select: { id: true, is_active: true, is_published: true },
      });

      if (!property || !property.is_active || !property.is_published) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Property not found or not available',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check availability first
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const conflictingReservations = await prisma.reservations.count({
        where: {
          property_id: propertyId,
          status: {
            in: ['CONFIRMED', 'PENDING', 'CHECKED_IN'],
          },
          OR: [
            {
              AND: [
                { check_in: { lte: checkOutDate } },
                { check_out: { gte: checkInDate } },
              ],
            },
          ],
        },
      });

      if (conflictingReservations > 0) {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'Property is not available for selected dates',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create or find guest user
      let guestUser = await prisma.users.findUnique({
        where: { email: guestInfo.email },
      });

      if (!guestUser) {
        // Create new guest user
        guestUser = await prisma.users.create({
          data: {
            email: guestInfo.email,
            password: 'GUEST_USER', // Guest users don't need real passwords
            first_name: guestInfo.firstName || 'Guest',
            last_name: guestInfo.lastName || '',
            phone: guestInfo.phone || '',
            role: 'GUEST',
            is_active: true,
          },
        });
      }

      // Create reservation
      const reservation = await prisma.reservations.create({
        data: {
          reservation_id: `WEB-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          property_id: propertyId,
          guest_id: guestUser.id,
          check_in: checkInDate,
          check_out: checkOutDate,
          guests: numberOfGuests || 1,
          status: 'PENDING', // All public bookings start as PENDING
          total_amount: totalPrice || 0,
          paid_amount: 0,
          outstanding_balance: totalPrice || 0,
          source: 'WEBSITE',
          notes: notes || '',
          updated_at: new Date(),
        },
        include: {
          property: {
            select: {
              name: true,
              address: true,
            },
          },
          guest: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      logger.info(`New public reservation created: ${reservation.id}`);

      res.status(201).json({
        success: true,
        data: {
          reservationId: reservation.id,
          status: reservation.status,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          property: reservation.property,
          guest: reservation.guest,
        },
        message: 'Booking request submitted successfully. You will receive a confirmation email shortly.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error in createReservation:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create reservation',
        timestamp: new Date().toISOString(),
      });
    } finally {
      await prisma.$disconnect();
    }
  }
}
