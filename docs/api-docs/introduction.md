# Introduction

The Affiliate Commission system provides a complete solution for managing affiliates, tracking conversions, and processing payouts.

## System Overview

The system consists of several interconnected components:

1. **Affiliate Management**: Create and manage affiliate accounts, including commission rates and payment details.
2. **Conversion Tracking**: Record and validate sales conversions attributed to affiliates.
3. **Payout Processing**: Process payments to affiliates based on approved conversions.
4. **Analytics**: Visualize performance data including revenue, commission rates, and affiliate activity.
5. **Settings Management**: Configure system defaults and integrate with payment providers.

## Authentication

This system uses cookie-based authentication. To use the API, you must first authenticate via the `/api/auth/login` endpoint, which sets an HTTP-only cookie. All subsequent requests will use this cookie for authentication.

## Database Models

The system uses MongoDB with Mongoose for data storage. The primary models are:

- User: System administrators/users
- Affiliate: Partners who promote products for commission
- Conversion: Recorded sales attributed to affiliates
- Payout: Payment transactions to affiliates
- Settings: System configuration

More details on the database schema can be found in the [Database Models](./database-models.md) documentation.

## External Services

The system integrates with Payman for payment processing. Refer to the [Payment Processing](./payment-api.md) documentation for details on this integration.
