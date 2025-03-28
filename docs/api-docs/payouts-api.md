# Payouts API

The Payouts API handles the processing of payments to affiliates based on their earned commissions.

## Get Payouts

Retrieves a list of payouts with optional filtering.

- **URL**: `/api/payouts`
- **Method**: `GET`
- **Authentication Required**: Yes

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status ("pending", "processing", "completed", "failed") |
| dateFrom | string | Filter by date from (YYYY-MM-DD) |
| dateTo | string | Filter by date to (YYYY-MM-DD) |

### Success Response

```json
[
  {
    "_id": "60d21b4667d0d8992e610c88",
    "affiliateId": "60d21b4667d0d8992e610c85",
    "amount": 50,
    "conversions": ["60d21b4667d0d8992e610c87"],
    "paymentMethod": "TEST_RAILS",
    "paymentDetails": {
      "reference": "pay_123456789",
      "externalReference": "ext_123456789"
    },
    "status": "completed",
    "processedAt": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

## Create Payout

Processes a payout to an affiliate.

- **URL**: `/api/payouts`
- **Method**: `POST`
- **Authentication Required**: Yes

### Request Body

```json
{
  "affiliateId": "60d21b4667d0d8992e610c85"
}
```

### Success Response

```json
{
  "success": true,
  "payout": {
    "_id": "60d21b4667d0d8992e610c88",
    "affiliateId": "60d21b4667d0d8992e610c85",
    "amount": 50,
    "conversions": ["60d21b4667d0d8992e610c87"],
    "paymentMethod": "TEST_RAILS",
    "paymentDetails": {
      "reference": "pay_123456789",
      "externalReference": "ext_123456789"
    },
    "status": "completed",
    "processedAt": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "payment": {
    "reference": "pay_123456789",
    "externalReference": "ext_123456789",
    "status": "succeeded"
  }
}
```

### Error Response

```json
{
  "error": "Payment failed",
  "details": "Insufficient funds in account",
  "payoutId": "60d21b4667d0d8992e610c88"
}
```

## Implementation Notes

When a payout is successfully processed:

1. A new `Payout` record is created with the initial status of "pending"
2. The system attempts to process the payment using the Payman payment service
3. If successful:
   - The payout status is updated to "completed"
   - Associated conversions have their status updated to "paid"
   - The affiliate's `pendingAmount` is reduced and `totalPaid` is increased
4. If the payment fails:
   - The payout status is updated to "failed"
   - The error details are stored in the payout record
   - No changes are made to conversions or affiliate totals

The payment processing uses the affiliate's `paymentDetails.payeeId` to identify the recipient in the payment system.
