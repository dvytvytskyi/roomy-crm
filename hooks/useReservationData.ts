import { useState, useEffect } from 'react';
import { userServiceV2 } from '@/lib/api/services/userService-v2';
import { propertyServiceV2 } from '@/lib/api/services/propertyService-v2';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  name: string; // Computed field
}

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  pricePerNight: number;
}

export function useReservationData() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load guests and properties in parallel
      const [guestsResponse, propertiesResponse] = await Promise.all([
        userServiceV2.getGuests({ limit: 100 }),
        propertyServiceV2.getAll({ limit: 100, status: 'ACTIVE' })
      ]);

      if (guestsResponse.success && guestsResponse.data && Array.isArray(guestsResponse.data.data)) {
        const guestsData = guestsResponse.data.data.map(guest => ({
          ...guest,
          name: `${guest.firstName} ${guest.lastName}`.trim()
        }));
        setGuests(guestsData);
      } else {
        console.warn('Guests response not in expected format:', guestsResponse);
        setGuests([]);
      }

      if (propertiesResponse.success && propertiesResponse.data && Array.isArray(propertiesResponse.data.data)) {
        const propertiesData = propertiesResponse.data.data.map(property => ({
          id: property.id,
          name: property.name,
          address: property.address,
          city: property.city,
          capacity: property.capacity,
          pricePerNight: property.pricePerNight
        }));
        setProperties(propertiesData);
      } else {
        console.warn('Properties response not in expected format:', propertiesResponse);
        setProperties([]);
      }
    } catch (err: any) {
      console.error('Error loading reservation data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = () => {
    loadData();
  };

  return {
    guests,
    properties,
    loading,
    error,
    refreshData
  };
}
