# Financial Calculations Documentation

## Overview
This document describes how financial data is calculated and which database tables are used for each metric.

## Database Tables Used

### 1. Properties Table
**Fields:**
- `agency_fee_percentage` (Float, default: 25.0) - Agency commission percentage
- `income_distribution` (JSON) - Additional income distribution settings

**Used for:**
- Calculating agency fee
- Determining owner payout percentage

### 2. Reservations Table
**Fields:**
- `total_amount` (Float) - Total booking amount
- `status` (Enum) - Reservation status (CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED)
- `check_in`, `check_out` (DateTime) - Booking dates

**Used for:**
- Total Revenue calculation
- ADR (Average Daily Rate)
- RevPAR (Revenue per Available Room)
- Total Bookings count
- Cancellation Rate

### 3. Expenses Table
**Fields:**
- `amount` (Float) - Expense amount
- `category` (String) - Expense category (Utilities, Maintenance, Cleaning, etc.)
- `date` (DateTime) - Expense date

**Used for:**
- Total Expenses
- Expenses by Category
- Gross/Net Profit calculations

### 4. Transactions Table
**Fields:**
- `amount` (Float) - Transaction amount
- `type` (Enum) - PAYMENT, REVENUE, EXPENSE, FEE
- `status` (Enum) - PENDING, COMPLETED, FAILED
- `platform_fee` (Float) - Platform commission

**Used for:**
- Gross Revenue
- Platform Fees
- Net Revenue

## Financial Metrics Calculations

### Revenue Metrics

#### Total Revenue
```sql
SELECT SUM(total_amount) 
FROM reservations 
WHERE property_id = ? 
  AND status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
  AND check_in BETWEEN ? AND ?
```

#### ADR (Average Daily Rate)
```sql
SELECT AVG(total_amount) 
FROM reservations 
WHERE property_id = ? 
  AND status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
```

#### RevPAR (Revenue per Available Room)
```typescript
revpar = totalRevenue / totalAvailableDays
```

### Expense Metrics

#### Total Expenses
```sql
SELECT SUM(amount) 
FROM expenses 
WHERE property_id = ? 
  AND date BETWEEN ? AND ?
```

#### Expenses by Category
```sql
SELECT category, SUM(amount) as total
FROM expenses 
WHERE property_id = ? 
  AND date BETWEEN ? AND ?
GROUP BY category
ORDER BY total DESC
```

### Financial Distribution

#### Agency Fee
```typescript
agencyFee = totalRevenue * (property.agency_fee_percentage / 100)
// Default: 25% of revenue
```

#### Platform Fees
```typescript
platformFees = totalRevenue * 0.03
// Fixed: 3% of revenue
```

#### Owner Payout
```typescript
ownerPayout = totalRevenue - agencyFee - platformFees
// Typically: 72% of revenue (with 25% agency fee)
```

### Profit Calculations

#### Gross Profit
```typescript
grossProfit = totalRevenue - totalExpenses
```

#### Net Revenue
```typescript
netRevenue = grossRevenue - platformFees
```

#### Net Profit
```typescript
netProfit = netRevenue - totalExpenses
```

#### Profit Margin
```typescript
profitMargin = (netProfit / totalRevenue) * 100
```

### Performance Metrics

#### Occupancy Rate
```typescript
occupancyRate = (bookedNights / totalAvailableNights) * 100
// Currently placeholder: 75%
// TODO: Implement real calculation based on property calendar
```

#### Cancellation Rate
```typescript
const totalBookings = confirmedCount + cancelledCount
cancellationRate = (cancelledCount / totalBookings) * 100
```

## API Endpoint

### GET /api/v2/financials/property/:propertyId

**Query Parameters:**
- `dateFrom` (ISO 8601) - Start date for filtering (default: start of current month)
- `dateTo` (ISO 8601) - End date for filtering (default: end of current month)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 3200,
    "grossRevenue": 0,
    "netRevenue": 3104,
    "totalExpenses": 902.75,
    "expensesByCategory": {
      "Maintenance": 387.5,
      "Marketing": 200,
      "Utilities": 150
    },
    "grossProfit": 2297.25,
    "netProfit": 2201.25,
    "profitMargin": 68.79,
    "ownerPayout": 2304,
    "agencyFee": 800,
    "platformFees": 96,
    "occupancyRate": 75,
    "adr": 1600,
    "revpar": 106.67,
    "totalBookings": 2,
    "cancellationRate": 0,
    "period": {
      "from": "2025-10-01T00:00:00.000Z",
      "to": "2025-10-31T23:59:59.000Z",
      "type": "month"
    },
    "recentReservations": [...],
    "recentTransactions": [...]
  }
}
```

## Frontend Integration

### Component: FinancialTab.tsx
**Location:** `/app/properties/[id]/components/tabs/FinancialTab.tsx`

**State:**
- `financialData` - Full financial data from API
- `expenses` - Local expenses list
- `loading` - Loading state for expenses
- `financialLoading` - Loading state for financial data

**Data Flow:**
1. Component mounts → `loadFinancialData()` + `loadExpenses()`
2. `loadFinancialData()` → Calls `/api/v2/financials/property/:id`
3. API → Fetches from reservations, expenses, transactions tables
4. API → Calculates all metrics
5. API → Returns aggregated data
6. Component → Updates UI with formatted data

### Service: FinancialService.ts
**Location:** `/lib/api/services/financialService.ts`

**Methods:**
- `getPropertyFinancialData()` - Fetch property financial data
- `getDateRange()` - Get date range for periods
- `formatCurrency()` - Format amounts as currency
- `formatPercentage()` - Format values as percentages
- `getCategoryColor()` - Get color for expense categories

## Example Calculation

**Given:**
- Property with `agency_fee_percentage = 25%`
- 2 reservations: 1,200 AED + 2,000 AED = 3,200 AED
- 6 expenses totaling: 902.75 AED

**Calculations:**
```
Total Revenue = 3,200 AED
Agency Fee (25%) = 800 AED
Platform Fees (3%) = 96 AED
Owner Payout = 3,200 - 800 - 96 = 2,304 AED

Total Expenses = 902.75 AED
Gross Profit = 3,200 - 902.75 = 2,297.25 AED
Net Revenue = 3,200 - 96 = 3,104 AED
Net Profit = 3,104 - 902.75 = 2,201.25 AED
Profit Margin = (2,201.25 / 3,200) * 100 = 68.79%

ADR = 3,200 / 2 = 1,600 AED
RevPAR = 3,200 / 30 = 106.67 AED/day
```

## Future Enhancements

### 1. Real Occupancy Rate Calculation
**Required:**
- Property calendar integration
- Blocked/unavailable dates tracking
- Real-time availability calculation

### 2. Multi-Currency Support
**Required:**
- Currency conversion rates
- Base currency setting per property
- Exchange rate history

### 3. Tax Integration
**Required:**
- VAT/Tax rates per country
- Tax calculation rules
- Tax reporting endpoints

### 4. Budget Tracking
**Required:**
- Monthly budget settings
- Budget vs. actual comparison
- Variance analysis

### 5. Financial Forecasting
**Required:**
- Historical data analysis
- Seasonal trends
- Predictive algorithms

