# Analytics API

The Analytics API provides various endpoints for retrieving performance and statistical data.

## Dashboard Overview

Retrieves key metrics for the dashboard overview.

- **URL**: `/api/analytics/overview`
- **Method**: `GET`
- **Authentication Required**: Yes

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| from | string | Start date (YYYY-MM-DD) |
| to | string | End date (YYYY-MM-DD) |

### Success Response

```json
{
  "totalRevenue": 1000,
  "revenueGrowth": 25,
  "conversionRate": 65.5,
  "conversionRateChange": 5.2,
  "activeAffiliates": 15,
  "affiliatesGrowth": 10,
  "averageCommission": 12.5,
  "averageCommissionChange": 2.3
}
```

## Revenue Data

Retrieves revenue data over time.

- **URL**: `/api/analytics/revenue`
- **Method**: `GET`
- **Authentication Required**: Yes

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| from | string | Start date (YYYY-MM-DD) |
| to | string | End date (YYYY-MM-DD) |

### Success Response

```json
[
  {
    "date": "2023-01-01",
    "orderAmount": 200,
    "commissionAmount": 20,
    "count": 2
  },
  {
    "date": "2023-01-02",
    "orderAmount": 150,
    "commissionAmount": 15,
    "count": 1
  }
]
```

## Conversion Rate

Retrieves conversion rate data over time.

- **URL**: `/api/analytics/conversion-rate`
- **Method**: `GET`
- **Authentication Required**: Yes

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| from | string | Start date (YYYY-MM-DD) |
| to | string | End date (YYYY-MM-DD) |

### Success Response

```json
[
  {
    "date": "2023-01-01",
    "rate": 75.5,
    "total": 4,
    "approved": 3
  },
  {
    "date": "2023-01-02",
    "rate": 66.7,
    "total": 3,
    "approved": 2
  }
]
```

## Commission Breakdown

Retrieves commission breakdown by payment method.

- **URL**: `/api/analytics/commission-breakdown`
- **Method**: `GET`
- **Authentication Required**: Yes

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| from | string | Start date (YYYY-MM-DD) |
| to | string | End date (YYYY-MM-DD) |

### Success Response

```json
[
  {
    "name": "TEST_RAILS Commissions",
    "value": 250
  },
  {
    "name": "Approved",
    "value": 150
  },
  {
    "name": "Paid",
    "value": 100
  }
]
```

## Top Affiliates

Retrieves top-performing affiliates.

- **URL**: `/api/analytics/top-affiliates`
- **Method**: `GET`
- **Authentication Required**: Yes

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| from | string | Start date (YYYY-MM-DD) |
| to | string | End date (YYYY-MM-DD) |
| limit | number | Maximum number of results (default: 10) |

### Success Response

```json
[
  {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "revenue": 500,
    "commissionsEarned": 50,
    "conversionCount": 5
  },
  {
    "id": "60d21b4667d0d8992e610c86",
    "name": "Jane Smith",
    "revenue": 300,
    "commissionsEarned": 45,
    "conversionCount": 3
  }
]
```

## Dashboard Stats

Retrieves aggregated statistics for the dashboard.

- **URL**: `/api/stats/dashboard`
- **Method**: `GET`
- **Authentication Required**: Yes

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| dateFrom | string | Start date (YYYY-MM-DD) |
| dateTo | string | End date (YYYY-MM-DD) |

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
