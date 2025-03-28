# Implementation Guide

This guide provides practical information for developers implementing the Affiliate Commission API.

## Getting Started

### Environment Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```
4. If needed, seed the database with test data using:
   ```
   node lib/db/seed.js
   ```

### Running the Application

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`.

## Key Implementation Concepts

### Authentication Flow

1. The application uses cookie-based authentication
2. When a user logs in via `/api/auth/login` or signs up via `/api/auth/signup`, an HTTP-only cookie is set
3. All API routes that require authentication check for this cookie
4. Users can log out via `/api/auth/logout`, which clears the cookie

### Affiliate Management

When creating a new affiliate:
1. If no promo code is provided, one is automatically generated
2. The affiliate's payment information must be configured to process payouts
3. Use the `/api/payments/create-payee` endpoint to create a payment recipient before setting the `payeeId` in the affiliate's record

### Conversion Tracking

The lifecycle of a conversion:
1. When a sale is made with an affiliate's promo code, create a conversion record via `/api/conversions`
2. Initially, conversions have a "pending" status
3. Conversions can be approved or rejected via `/api/conversions/:id/status`
4. When approved, the affiliate's pending amount is automatically updated
5. When a payout is processed, approved conversions are marked as "paid"

### Payout Processing

To process a payout:
1. Ensure the affiliate has a valid payment recipient (`payeeId`) configured
2. Create a payout via `/api/payouts` with the affiliate's ID
3. The system will:
   - Collect all approved conversions for the affiliate
   - Create a payout record
   - Process the payment via the Payman API
   - Update conversion statuses and affiliate balances

## Common Integration Patterns

### Frontend Integration

When building a frontend for this API:
1. Implement forms for creating affiliates, conversions, and processing payouts
2. Use dashboard endpoints to display statistics and performance data
3. Implement tables for viewing and managing affiliates, conversions, and payouts
4. Use the settings endpoint to configure system behavior

### External System Integration

To integrate with an e-commerce system:
1. When an order is placed with an affiliate promo code, send a request to `/api/conversions`
2. Include order details, affiliate ID, and promo code in the request
3. The API will validate the request and create a conversion record
4. The conversion status can be updated later based on order fulfillment

### Payment System Integration

The application is pre-integrated with the Payman payment service. To use a different payment provider:
1. Create a new implementation of the payment client in `/lib/payment/`
2. Update the payout processor to use your new payment client
3. Update the Settings model to store your payment provider's API keys
