import { apiClientV2 } from '../client-v2';

export interface SchedulerReservation {
  id: string;
  reservation_id: string;
  property_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  source: string;
  guests: number;
  total_amount: number;
  property?: {
    id: string;
    name: string;
  };
}

export interface SchedulerProperty {
  id: string;
  name: string;
  address?: string;
}

export interface SchedulerData {
  properties: SchedulerProperty[];
  reservations: SchedulerReservation[];
}

// Get all properties for scheduler
export async function getSchedulerProperties(): Promise<SchedulerProperty[]> {
  try {
    const response = await apiClientV2.get('/properties?limit=100&active=true');
    console.log('🔍 Properties API response:', response.data);
    
    // Handle different response structures
    const properties = response.data.data || response.data || [];
    console.log('📊 Properties array:', properties);
    
    return properties.map((prop: any) => ({
      id: prop.id,
      name: prop.name,
      address: prop.address
    }));
  } catch (error) {
    console.error('Error fetching scheduler properties:', error);
    return [];
  }
}

// Get all reservations for scheduler
export async function getSchedulerReservations(): Promise<SchedulerReservation[]> {
  try {
    const response = await apiClientV2.get('/reservations?limit=1000');
    console.log('🔍 Reservations API response:', response.data);
    
    // Handle different response structures
    const reservations = response.data.data || response.data || [];
    console.log('📊 Reservations array:', reservations);
    
    return reservations.map((res: any) => ({
      id: res.id,
      reservation_id: res.reservation_id,
      property_id: res.property_id,
      guest_name: res.guest_name,
      check_in: res.check_in,
      check_out: res.check_out,
      status: res.status,
      source: res.source,
      guests: res.guests,
      total_amount: res.total_amount,
      property: res.properties ? {
        id: res.properties.id,
        name: res.properties.name
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching scheduler reservations:', error);
    return [];
  }
}

// Get complete scheduler data
export async function getSchedulerData(): Promise<SchedulerData> {
  try {
    const [properties, reservations] = await Promise.all([
      getSchedulerProperties(),
      getSchedulerReservations()
    ]);

    return {
      properties,
      reservations
    };
  } catch (error) {
    console.error('Error fetching scheduler data:', error);
    return {
      properties: [],
      reservations: []
    };
  }
}

// Convert scheduler data to Gantt format
export function convertToGanttData(schedulerData: SchedulerData) {
  console.log('🔄 Converting scheduler data to Gantt format...');
  console.log('📊 Properties count:', schedulerData.properties.length);
  console.log('📊 Reservations count:', schedulerData.reservations.length);
  
  const ganttTasks: any[] = [];
  const ganttLinks: any[] = [];

  // Add properties as parent tasks
  schedulerData.properties.forEach(property => {
    console.log('🏠 Adding property:', property.name, 'ID:', property.id);
    ganttTasks.push({
      id: property.id,
      text: property.name,
      type: "project",
      render: "split",
      start_date: "01-10-2025",
      duration: 365,
      progress: 0,
      open: true,
      parent: 0,
    });
  });

  // Add reservations as child tasks
  schedulerData.reservations.forEach(reservation => {
    console.log('📅 Processing reservation:', reservation.guest_name, 'Property:', reservation.property_id);
    console.log('📅 Check-in:', reservation.check_in, 'Check-out:', reservation.check_out);
    
    const startDate = new Date(reservation.check_in);
    const endDate = new Date(reservation.check_out);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Format date for Gantt (DD-MM-YYYY)
    const formattedStartDate = startDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    console.log('📅 Formatted start date:', formattedStartDate, 'Duration:', duration);

    ganttTasks.push({
      id: reservation.id,
      text: reservation.guest_name,
      start_date: formattedStartDate,
      duration: duration,
      parent: reservation.property_id,
      progress: 1,
      status: reservation.status.toLowerCase(),
      source: reservation.source,
      guest_amount: reservation.guests,
      total_amount: reservation.total_amount
    });
  });

  console.log('✅ Gantt conversion complete. Total tasks:', ganttTasks.length);
  return {
    data: ganttTasks,
    links: ganttLinks
  };
}
