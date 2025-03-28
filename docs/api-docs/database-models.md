# Database Models

This application uses MongoDB with Mongoose for data modeling. The following models are defined:

## User

Represents system administrators and users who can access the dashboard.

```typescript
interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  verifyPassword(password: string): boolean;
}
```

| Field | Type | Description |
|-------|------|-------------|
| name | String | User's full name |
| email | String | User's email (unique) |
| password | String | User's password (should be hashed in production) |
| createdAt | Date | Timestamp of creation |
| updatedAt | Date | Timestamp of last update |

## Affiliate

Represents a marketing partner who refers customers and earns commissions.

```typescript
interface IAffiliateDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  promoCode: string;
  commissionRate: number;
  paymentMethod: "TEST_RAILS";
  paymentDetails: {
    name: string;
    payeeId?: string;
    contactDetails?: {
      email?: string;
      phoneNumber?: string;
      address?: {
        addressLine1?: string;
        addressLine2?: string;
        addressLine3?: string;
        addressLine4?: string;
        locality?: string;
        region?: string;
        postcode?: string;
        country?: string;
      };
      taxId?: string;
    };
    tags?: string[];
  };
  status: "active" | "inactive" | "pending";
  totalEarned: number;
  totalPaid: number;
  pendingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

| Field | Type | Description |
|-------|------|-------------|
| name | String | Affiliate's full name |
| email | String | Affiliate's email (unique) |
| phone | String | Affiliate's phone number |
| promoCode | String | Unique code used for tracking referrals (unique) |
| commissionRate | Number | Percentage commission rate (default: 10) |
| paymentMethod | String | Payment method (currently only "TEST_RAILS") |
| paymentDetails | Object | Payment recipient details |
| paymentDetails.name | String | Recipient name in payment system |
| paymentDetails.payeeId | String | Recipient ID in payment system |
| paymentDetails.contactDetails | Object | Contact information |
| status | String | Account status: "active", "inactive", or "pending" |
| totalEarned | Number | Total commission earned across all conversions |
| totalPaid | Number | Total amount paid to affiliate |
| pendingAmount | Number | Amount earned but not yet paid |

## Conversion

Represents a sale or conversion attributed to an affiliate.

```typescript
interface IConversionDocument extends Document {
  affiliateId: mongoose.Types.ObjectId;
  orderId: string;
  orderAmount: number;
  commissionAmount: number;
  promoCode: string;
  customer: {
    email: string;
    name?: string;
  };
  status: "pending" | "approved" | "rejected" | "paid";
  payoutId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

| Field | Type | Description |
|-------|------|-------------|
| affiliateId | ObjectId | Reference to the affiliate |
| orderId | String | Order reference (unique) |
| orderAmount | Number | Total order value |
| commissionAmount | Number | Commission amount for this conversion |
| promoCode | String | Promo code used for the order |
| customer | Object | Customer information |
| customer.email | String | Customer email |
| customer.name | String | Customer name |
| status | String | Conversion status: "pending", "approved", "rejected", or "paid" |
| payoutId | ObjectId | Reference to the payout (if paid) |

## Payout

Represents a payment made to an affiliate.

```typescript
interface IPayoutDocument extends Document {
  affiliateId: mongoose.Types.ObjectId;
  amount: number;
  conversions: mongoose.Types.ObjectId[];
  paymentMethod: "TEST_RAILS";
  paymentDetails: {
    reference?: string;
    externalReference?: string;
    memo?: string;
    walletId?: string;
    metadata?: Record<string, any>;
  };
  status: "pending" | "processing" | "completed" | "failed";
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

| Field | Type | Description |
|-------|------|-------------|
| affiliateId | ObjectId | Reference to the affiliate |
| amount | Number | Total payment amount |
| conversions | [ObjectId] | References to the associated conversions |
| paymentMethod | String | Payment method used (currently only "TEST_RAILS") |
| paymentDetails | Object | Details of the payment transaction |
| paymentDetails.reference | String | Payment provider's reference |
| paymentDetails.externalReference | String | External reference |
| paymentDetails.memo | String | Payment description or memo |
| status | String | Payment status: "pending", "processing", "completed", or "failed" |
| processedAt | Date | Timestamp when payment was processed |

## Settings

Represents system-wide configuration settings.

```typescript
interface ISettingsDocument extends Document {
  payoutSettings: {
    minimumPayoutAmount: number;
    payoutFrequency: "daily" | "weekly" | "monthly";
    payoutDay?: number;
    automaticPayouts: boolean;
  };
  apiKeys: {
    paymanApiKey?: string;
    otherApiKeys?: Record<string, string>;
  };
  commissionDefaults: {
    defaultRate: number;
    minimumOrderAmount: number;
  };
  updatedAt: Date;
}
```

| Field | Type | Description |
|-------|------|-------------|
| payoutSettings.minimumPayoutAmount | Number | Minimum amount required for payout |
| payoutSettings.payoutFrequency | String | How often to process payouts: "daily", "weekly", "monthly" |
| payoutSettings.payoutDay | Number | The day to process payouts (for weekly/monthly) |
| payoutSettings.automaticPayouts | Boolean | Whether to process payouts automatically |
| apiKeys.paymanApiKey | String | API key for Payman payment provider |
| apiKeys.otherApiKeys | Object | Map of other API keys for integrations |
| commissionDefaults.defaultRate | Number | Default commission rate for new affiliates |
| commissionDefaults.minimumOrderAmount | Number | Minimum order amount to qualify for commission |

## Relationships Between Models

The database models are related in the following ways:

1. **Affiliate ← Conversion**: Each conversion references an affiliate via `affiliateId`
2. **Affiliate ← Payout**: Each payout references an affiliate via `affiliateId`
3. **Conversion ← Payout**: Each payout includes a list of conversions via `conversions` array
4. **Conversion → Payout**: Conversions with status "paid" reference their payout via `payoutId`

These relationships enable:
- Tracking all conversions for a specific affiliate
- Associating payouts with the affiliate who received them
- Connecting payouts to the specific conversions they cover
- Following the history of a conversion from creation to payment
