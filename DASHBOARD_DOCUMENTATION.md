# Dashboard Documentation

## Overview
The Dashboard provides live information and statistics for property management operations. It displays real-time data about occupancy, operations, birthdays, and alerts.

## Features

### Live Statistics
- **Check-ins Today**: Number of guests checking in today
- **Check-outs Today**: Number of guests checking out today  
- **Maintenance in Progress**: Number of active maintenance tasks
- **Total Units**: Total number of properties in the system
- **Empty Units**: Properties available for more than 7 nights
- **Occupancy Rate**: Percentage of occupied properties

### Birthdays
- **Today**: Staff, guests, and owners with birthdays today
- **Within 7 Days**: Staff, guests, and owners with birthdays this week
- Shows role badges (Staff, Guest, Owner) with color coding

### Alerts & Reminders
- **DTCM Permits Expiring**: Properties with permits expiring within 7 days
- **Utilities Payment Reminders**: Pending utility payments

### Auto-refresh
- Dashboard automatically refreshes every 5 minutes
- Manual refresh button available
- Shows last updated timestamp

## API Endpoints

### GET /api/v2/dashboard/stats
Returns dashboard statistics including:
- Occupancy data (total units, empty units, occupancy rate)
- Operations data (check-ins, check-outs, maintenance)
- Birthday information (today and this week)
- Alert counts (DTCM permits, utilities)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "occupancy": {
      "totalUnits": 25,
      "emptyUnits": 3,
      "occupancyRate": 88
    },
    "operations": {
      "checkInsToday": 5,
      "checkOutsToday": 3,
      "maintenanceInProgress": 2
    },
    "birthdays": {
      "today": {
        "count": 1,
        "details": [...]
      },
      "thisWeek": {
        "count": 4,
        "details": [...]
      }
    },
    "alerts": {
      "dtcmPermitsExpiring": 0,
      "utilitiesReminders": 0
    }
  },
  "timestamp": "2025-10-14T18:47:17.971Z"
}
```

## Components

### DashboardStats
Full dashboard component with all statistics, birthdays, and alerts.

**Props:**
- `className?: string` - Additional CSS classes
- `showRefresh?: boolean` - Show refresh button (default: true)
- `autoRefresh?: boolean` - Auto-refresh every 5 minutes (default: true)
- `refreshInterval?: number` - Refresh interval in milliseconds (default: 300000)

### QuickStats
Compact statistics component for use in other pages.

**Props:**
- `className?: string` - Additional CSS classes
- `showLabels?: boolean` - Show labels for statistics (default: true)
- `compact?: boolean` - Compact horizontal layout (default: false)

## Usage Examples

### Full Dashboard Page
```tsx
import DashboardPage from '@/app/dashboard/page'

// Already implemented as a full page
```

### Dashboard Stats Component
```tsx
import { DashboardStats } from '@/components/dashboard'

<DashboardStats 
  className="my-4"
  showRefresh={true}
  autoRefresh={true}
  refreshInterval={300000}
/>
```

### Quick Stats Component
```tsx
import { QuickStats } from '@/components/dashboard'

// Compact horizontal layout
<QuickStats compact={true} showLabels={false} />

// Grid layout with labels
<QuickStats showLabels={true} className="mb-6" />
```

## Database Queries

The dashboard performs several optimized database queries:

1. **Occupancy Stats**: Counts total active properties and empty properties (no reservations for 7+ nights)
2. **Operations**: Counts today's check-ins and check-outs, plus active maintenance tasks
3. **Birthdays**: Finds users with birthdays today and within 7 days, filtered by role
4. **Alerts**: Counts DTCM permits and utilities reminders (currently mock data)

## Performance Considerations

- Uses parallel database queries for optimal performance
- Auto-refresh limited to 5 minutes to reduce server load
- Efficient date calculations for birthday matching
- Optimized Prisma queries with proper indexing

## Future Enhancements

1. **Real DTCM Data**: Integrate with actual DTCM permit system
2. **Utilities Integration**: Connect with utility providers for real payment data
3. **Advanced Filtering**: Add date range filters for statistics
4. **Export Functionality**: Export dashboard data to PDF/Excel
5. **Customizable Widgets**: Allow users to customize dashboard layout
6. **Historical Data**: Show trends and historical comparisons
7. **Push Notifications**: Real-time alerts for critical events

## Security

- All dashboard endpoints require JWT authentication
- Role-based access control (ADMIN, MANAGER, AGENT)
- Input validation and sanitization
- Rate limiting on API endpoints

## Error Handling

- Graceful fallback for API failures
- Loading states for better UX
- Retry mechanisms for failed requests
- Error boundaries for component failures
