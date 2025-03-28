# Payment Processing API

The application integrates with the Payman payment service to process payouts to affiliates. This document describes the integration and available endpoints.

## Payman Integration

The system uses the Payman API client to interact with the Payman payment service. The client is implemented in `/lib/payment/payman-client.ts` and provides methods for:

1. Sending payments
2. Creating payment recipients (payees)

## Create Payee

Creates a new payment recipient in the Payman system.

- **URL**: `/api/payments/create-payee`
- **Method**: `POST`
- **Authentication Required**: Yes

### Request Body

```json
{
  "name": "Recipient Name",
  "email": "recipient@example.com",
  "phone": "+1 (555) 123-4567"
}
```

### Success Response

```json
{
  "id": "pd-1f00acb2-fba4-6983-b0fd-d7b9ea207569",
  "name": "Recipient Name",
  "type": "TEST_RAILS",
  "contactDetails": {
    "email": "recipient@example.com",
    "phoneNumber": "+1 (555) 123-4567"
  },
  "tags": ["affiliate"],
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "message": "Failed to create payee",
  "error": "Invalid email format"
}
```

## Implementation Details

### Payman Client

The Payman client is instantiated with an API key and provides methods to interact with the Payman API:

```typescript
import { createPaymanClient } from '@/lib/payment/payman-client';

// Create a client instance
const paymanClient = createPaymanClient('your-api-key');

// Send a payment
const paymentResult = await paymanClient.sendPayment({
  name: "Payment Name",
  amountDecimal: 100.50,
  payeeId: "pd-1f00acb2-fba4-6983-b0fd-d7b9ea207569",
  memo: "Payment for services"
});

// Create a test payee
const payee = await paymanClient.createTestPayee({
  name: "Recipient Name",
  email: "recipient@example.com",
  tags: ["affiliate"]
});
```

### PaymanClient Response Types

#### PaymanPaymentResponse

```typescript
interface PaymanPaymentResponse {
  reference: string;      // Payman's internal reference
  externalReference: string;  // External system reference
  status: string;         // Payment status
}
```

#### PaymanErrorResponse

```typescript
interface PaymanErrorResponse {
  error: string;
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  details?: any;
}
```

### API Key Configuration

The Payman API key should be stored in the system settings using the Settings API. The key is used when initializing the Payman client for payment processing.
