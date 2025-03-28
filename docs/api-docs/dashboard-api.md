# Dashboard API

The Dashboard API provides endpoints for retrieving aggregated data used in the dashboard displays.

## Dashboard Statistics

Retrieves key statistics needed for the dashboard overview.

- **URL**: `/api/stats/dashboard`
- **Method**: `GET`
- **Authentication Required**: Yes

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| dateFrom | string | Start date (YYYY-MM-DD) for filtering data |
| dateTo | string | End date (YYYY-MM-DD) for filtering data |

### Success Response

```json
{
  "totalAffiliates": 25,
  "activeAffiliates": 18,
  "totalConversions": 150,
  "pendingConversions": 30,
  "totalRevenue": 15000,
  "totalCommissions": 1500,
  "pendingPayouts": 500,
  "conversionRate": 10
}
```

| Field | Description |
|-------|-------------|
| totalAffiliates | Total number of affiliates registered in the system |
| activeAffiliates | Number of affiliates with "active" status |
| totalConversions | Total number of conversions in the specified date range |
| pendingConversions | Number of conversions with "pending" status |
| totalRevenue | Sum of all orderAmount values from conversions |
| totalCommissions | Sum of all commissionAmount values from conversions |
| pendingPayouts | Total amount pending to be paid out |
| conversionRate | Percentage ratio of commissions to revenue |

### Error Response

```json
{
  "error": "Failed to fetch dashboard stats"
}
```

## Implementation Notes

- The dashboard statistics endpoint performs multiple database queries to calculate the various metrics
- When date filters are applied, all metrics except `totalAffiliates` and `activeAffiliates` are filtered to the specified date range
- The `conversionRate` value represents the percentage of revenue that was paid out as commissions
- In a typical implementation, this would represent the percentage of orders that used affiliate promotional codes
