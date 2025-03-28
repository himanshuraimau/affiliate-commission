# Conversions API

The Conversions API allows for tracking and management of sales attributed to affiliates.

## Get Conversions

Retrieves a list of conversions with optional filtering.

- **URL**: `/api/conversions`
- **Method**: `GET`
- **Authentication Required**: Yes

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status ("pending", "approved", "rejected", "paid") |
| dateFrom | string | Filter by date from (YYYY-MM-DD) |
| dateTo | string | Filter by date to (YYYY-MM-DD) |
| affiliateId | string | Filter by affiliate ID |

### Success Response

```json
[
  {
    "_id": "60d21b4667d0d8992e610c87",
    "affiliateId": "60d21b4667d0d8992e610c85",
    "orderId": "ORD-12345",
    "orderAmount": 100,
    "commissionAmount": 10,
    "promoCode": "JOHN10",
    "customer": {
      "email": "customer@example.com",
      "name": "Test Customer"
    },
    "status": "approved",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

## Create Conversion

Records a new conversion.

- **URL**: `/api/conversions`
- **Method**: `POST`
- **Authentication Required**: Yes

### Request Body

```json
{
  "affiliateId": "60d21b4667d0d8992e610c85",
  "orderId": "ORD-12345",
  "orderAmount": 100,
  "commissionAmount": 10,
  "promoCode": "JOHN10",
  "customer": {
    "email": "customer@example.com",
    "name": "Test Customer"
  },
  "status": "pending"
}
```

Note: If `commissionAmount` is not provided, it will be calculated automatically based on the affiliate's commission rate.

### Success Response

```json
{
  "_id": "60d21b4667d0d8992e610c87",
  "affiliateId": "60d21b4667d0d8992e610c85",
  "orderId": "ORD-12345",
  "orderAmount": 100,
  "commissionAmount": 10,
  "promoCode": "JOHN10",
  "customer": {
    "email": "customer@example.com",
    "name": "Test Customer"
  },
  "status": "pending",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "error": "Conversion with this order ID already exists"
}
```

## Update Conversion Status

Updates the status of a conversion.

- **URL**: `/api/conversions/:id/status`
- **Method**: `PATCH`
- **Authentication Required**: Yes
- **URL Parameters**: `id` - ID of the conversion to update

### Request Body

```json
{
  "status": "approved"
}
```

### Success Response

```json
{
  "_id": "60d21b4667d0d8992e610c87",
  "affiliateId": "60d21b4667d0d8992e610c85",
  "orderId": "ORD-12345",
  "orderAmount": 100,
  "commissionAmount": 10,
  "promoCode": "JOHN10",
  "customer": {
    "email": "customer@example.com",
    "name": "Test Customer"
  },
  "status": "approved",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "error": "Conversion not found"
}
```

## Implementation Notes

- When a conversion status is changed to "approved", the affiliate's `totalEarned` and `pendingAmount` fields are automatically updated.
- When a conversion status is changed from "approved" to something else, the affiliate's totals are adjusted accordingly.
- When a payout is processed, conversions associated with that payout have their status changed to "paid".
