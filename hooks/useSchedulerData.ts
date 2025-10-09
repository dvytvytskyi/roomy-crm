import { useState, useEffect } from 'react';
import { propertyServiceV2 } from '@/lib/api/services/propertyService-v2';
import { reservationServiceAdapted } from '@/lib/api/adapters/apiAdapter';

interface GanttTask {
  id: string | number;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  type?: 'project' | 'task' | 'milestone';
  parent?: string | number;
  open?: boolean;
  color?: string;
  status?: string;
}

export function useSchedulerData() {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load properties and reservations in parallel
        const [propertiesResponse, reservationsResponse] = await Promise.all([
          propertyServiceV2.getAll({ limit: 100 }),
          reservationServiceAdapted.getAll({ limit: 200 })
        ]);

        if (!propertiesResponse.success || !reservationsResponse.success) {
          throw new Error('Failed to load data');
        }

        // Handle different API response formats
        const properties = Array.isArray(propertiesResponse.data?.data) 
          ? propertiesResponse.data.data 
          : Array.isArray(propertiesResponse.data) 
            ? propertiesResponse.data 
            : [];
            
        const reservations = Array.isArray(reservationsResponse.data?.data)
          ? reservationsResponse.data.data
          : Array.isArray(reservationsResponse.data)
            ? reservationsResponse.data
            : [];

        console.log('📊 Scheduler Data:', {
          propertiesCount: properties.length,
          reservationsCount: reservations.length
        });

        // Transform data to Gantt format
        const ganttTasks: GanttTask[] = [];

        // Add properties as project-level tasks
        properties.forEach((property: any) => {
          // Get reservations for this property
          const propertyReservations = reservations.filter(
            (res: any) => res.propertyId === property.id && res.status !== 'CANCELLED'
          );

          // Calculate property date range from its reservations
          let minDate = new Date();
          let maxDate = new Date();
          
          if (propertyReservations.length > 0) {
            const dates = propertyReservations.flatMap((res: any) => [
              new Date(res.checkIn),
              new Date(res.checkOut)
            ]);
            minDate = new Date(Math.min(...dates.map(d => d.getTime())));
            maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          } else {
            // If no reservations, show for next 30 days
            maxDate = new Date(minDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          }

          const propertyDuration = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

          ganttTasks.push({
            id: `property-${property.id}`,
            text: `🏠 ${property.name || 'Unnamed Property'}`,
            start_date: minDate.toISOString().split('T')[0],
            duration: propertyDuration || 30,
            progress: 0,
            type: 'project',
            open: true,
            color: '#3b82f6'
          });

          // Add reservations as child tasks
          propertyReservations.forEach((reservation: any) => {
            const checkIn = new Date(reservation.checkIn);
            const checkOut = new Date(reservation.checkOut);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

            // Determine progress based on status
            let progress = 0;
            let color = '#10b981'; // Green for confirmed
            
            switch (reservation.status) {
              case 'PENDING':
                progress = 0.25;
                color = '#f59e0b'; // Orange
                break;
              case 'CONFIRMED':
                progress = 0.5;
                color = '#10b981'; // Green
                break;
              case 'CHECKED_IN':
                progress = 0.75;
                color = '#3b82f6'; // Blue
                break;
              case 'CHECKED_OUT':
                progress = 1;
                color = '#6b7280'; // Gray
                break;
              case 'CANCELLED':
                progress = 0;
                color = '#ef4444'; // Red
                break;
            }

            ganttTasks.push({
              id: `reservation-${reservation.id}`,
              text: `${reservation.guestName} - ${reservation.status}`,
              start_date: checkIn.toISOString().split('T')[0],
              duration: nights || 1,
              progress: progress,
              parent: `property-${property.id}`,
              color: color,
              status: reservation.status
            });
          });
        });

        console.log('📊 Gantt Tasks Generated:', ganttTasks.length);
        setTasks(ganttTasks);
      } catch (err: any) {
        console.error('Error loading scheduler data:', err);
        setError(err.message || 'Failed to load scheduler data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    // Trigger reload by forcing re-render
    window.location.reload();
  };

  return {
    tasks,
    loading,
    error,
    refreshData
  };
}
