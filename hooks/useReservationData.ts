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

      // Handle guests response - check both formats
      let guestsData = [];
      if (guestsResponse.success && guestsResponse.data) {
        if (Array.isArray(guestsResponse.data)) {
          guestsData = guestsResponse.data;
        } else if (guestsResponse.data.data && Array.isArray(guestsResponse.data.data)) {
          guestsData = guestsResponse.data.data;
        }
        
        const transformedGuests = guestsData.map(guest => ({
          ...guest,
          name: `${guest.firstName} ${guest.lastName}`.trim()
        }));
        setGuests(transformedGuests);
      } else {
        console.warn('Guests response not in expected format:', guestsResponse);
        setGuests([]);
      }

      // Handle properties response - check both formats
      let propertiesData = [];
      if (propertiesResponse.success && propertiesResponse.data) {
        if (Array.isArray(propertiesResponse.data)) {
          propertiesData = propertiesResponse.data;
        } else if (propertiesResponse.data.data && Array.isArray(propertiesResponse.data.data)) {
          propertiesData = propertiesResponse.data.data;
        }
        
        const transformedProperties = propertiesData.map(property => ({
          id: property.id,
          name: property.name,
          address: property.address,
          city: property.city,
          capacity: property.capacity,
          pricePerNight: property.pricePerNight
        }));
        setProperties(transformedProperties);
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
