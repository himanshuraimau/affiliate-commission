# Affiliates API

The Affiliates API allows for management of affiliate partners, including creation, fetching, and updating of affiliate accounts.

## Get All Affiliates

Retrieves a list of all affiliates.

- **URL**: `/api/affiliates`
- **Method**: `GET`
- **Authentication Required**: Yes

### Success Response

```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "promoCode": "JOHN10",
    "commissionRate": 10,
    "paymentMethod": "TEST_RAILS",
    "paymentDetails": {
      "name": "TESTING-AGAIN",
      "payeeId": "pd-1f00acb2-fba4-6983-b0fd-d7b9ea207569",
      "contactDetails": {
        "email": "john@example.com",
        "phoneNumber": "+1 (555) 123-4567"
      }
    },
    "status": "active",
    "totalEarned": 100,
    "totalPaid": 50,
    "pendingAmount": 50,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

## Create Affiliate

Creates a new affiliate account.

- **URL**: `/api/affiliates`
- **Method**: `POST`
- **Authentication Required**: Yes

### Request Body

```json
{
  "name": "New Affiliate",
  "email": "newaffiliate@example.com",
  "phone": "+1 (555) 987-6543",
  "promoCode": "NEW20",
  "commissionRate": 20,
  "status": "pending",
  "paymentMethod": "TEST_RAILS",
  "paymentDetails": {
    "name": "TESTING-AGAIN"
  }
}
```

Note: If `promoCode` is not provided, the system will generate one automatically based on the affiliate's name.

### Success Response

```json
{
  "_id": "60d21b4667d0d8992e610c86",
  "name": "New Affiliate",
  "email": "newaffiliate@example.com",
  "phone": "+1 (555) 987-6543",
  "promoCode": "NEW20",
  "commissionRate": 20,
  "paymentMethod": "TEST_RAILS",
  "paymentDetails": {
    "name": "TESTING-AGAIN"
  },
  "status": "pending",
  "totalEarned": 0,
  "totalPaid": 0,
  "pendingAmount": 0,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "message": "An affiliate with this email already exists."
}
```

## Create Payee

Creates a payment recipient in the payment system for an affiliate.

- **URL**: `/api/payments/create-payee`
- **Method**: `POST`
- **Authentication Required**: Yes

### Request Body

```json
{
  "name": "Affiliate Name",
  "email": "affiliate@example.com",
  "phone": "+1 (555) 123-4567"
}
```

### Success Response

```json
{
  "id": "pd-1f00acb2-fba4-6983-b0fd-d7b9ea207569",
  "name": "Affiliate Name",
  "type": "TEST_RAILS",
  "contactDetails": {
    "email": "affiliate@example.com"
  },
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "message": "Failed to create payee",
  "error": "Error details from payment provider"
}
```

## Implementation Notes

- When creating an affiliate without a provided promo code, the system generates one by taking the first 4 letters of the affiliate's name (uppercase) and appending a random 4-digit number.
- The `totalEarned`, `totalPaid`, and `pendingAmount` fields are automatically managed by the system based on conversions and payouts.
- Affiliate status can be "active", "inactive", or "pending".
