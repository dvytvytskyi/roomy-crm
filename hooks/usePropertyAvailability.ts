import { useState, useEffect } from 'react';
import { apiClientV2 } from '@/lib/api/client-v2';

interface AvailabilityCheck {
  isAvailable: boolean;
  conflictingReservations?: any[];
}

interface UsePropertyAvailabilityOptions {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

export function usePropertyAvailability({
  propertyId,
  startDate,
  endDate,
  enabled = true
}: UsePropertyAvailabilityOptions) {
  const [availability, setAvailability] = useState<AvailabilityCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!enabled || !propertyId || !startDate || !endDate) {
        setAvailability(null);
        return;
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        setAvailability(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await apiClientV2.get(
          `/api/v2/properties/${propertyId}/availability`,
          {
            startDate,
            endDate
          }
        );

        if (response.success) {
          setAvailability(response.data);
        } else {
          setError(response.message || 'Failed to check availability');
        }
      } catch (err: any) {
        console.error('Availability check error:', err);
        setError(err.message || 'Failed to check availability');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [propertyId, startDate, endDate, enabled]);

  return {
    availability,
    loading,
    error,
    isAvailable: availability?.isAvailable ?? null
  };
}
