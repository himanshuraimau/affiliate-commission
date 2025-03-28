# Payment Integration

The Affiliate Commission System integrates with the Payman API for payment processing. This document outlines how the payment system is implemented and how it interacts with the affiliate system.

## Payment Flow Overview

The payment process follows these steps:

1. Affiliate registers in the system
2. Affiliate is created as a payee in Payman
3. Conversions are tracked and approved
4. Payouts are created from approved conversions
5. Payments are processed via Payman API
6. Payment status is tracked and updated

## Payman API Client

The system uses a dedicated client for Payman API interactions in `lib/payment/payman-client.ts`:

```typescript
export class PaymanClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async sendPayment(params: SendPaymentParams): Promise<PaymanPaymentResponse> {
    try {
      const response = await axios({
        method: 'POST',
        url: `${PAYMAN_API_BASE_URL}/payments/send-payment`,
        headers: {
          'x-payman-api-secret': this.apiKey,
          'Content-Type': 'application/json'
        },
        data: params
      });
      
      return response.data;
    } catch (error) {
      // Error handling...
    }
  }
  
  async createTestPayee(params: CreatePayeeParams): Promise<any> {
    // Implementation...
  }
}
```

The client is created with the API key stored in settings:

```typescript
export function createPaymanClient(apiKey: string): PaymanClient {
  return new PaymanClient(apiKey);
}
```

## Affiliate Registration

When a new affiliate is registered, a Payman payee is created:

```typescript
// First, create a TEST_RAILS payee via Payman API
const payeeResponse = await fetch("/api/payments/create-payee", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: values.name,
    email: values.email,
    phone: values.phone,
  }),
});

const payeeData = await payeeResponse.json();

// Now create the affiliate with the payee ID
const affiliateData = {
  ...values,
  paymentMethod: "TEST_RAILS",
  paymentDetails: {
    name: values.name,
    payeeId: payeeData.id,
    contactDetails: {
      email: values.email,
      phoneNumber: values.phone,
    }
  }
};
```

## Processing Payouts

Payouts are processed through the following flow:

1. User initiates a payout for an affiliate
2. System groups approved conversions for that affiliate
3. Payout record is created with "pending" status
4. Payman API is called to process the payment:

```typescript
export async function processPayoutById(payoutId: string) {
  try {
    // Get payout and affiliate information
    const payout = await Payout.findById(payoutId).populate('affiliateId');
    if (!payout) {
      throw new Error('Payout not found');
    }
    
    const affiliate = payout.affiliateId;
    
    // Get Payman API key from settings
    const settings = await Settings.findOne();
    const paymanApiKey = settings?.apiKeys?.paymanApiKey;
    
    if (!paymanApiKey) {
      throw new Error('Payman API key not configured');
    }
    
    // Create Payman client
    const paymanClient = createPaymanClient(paymanApiKey);
    
    // Process payment
    const paymentResponse = await paymanClient.sendPayment({
      amount: payout.amount,
      currency: 'USD',
      payeeId: affiliate.paymentDetails.payeeId,
      reference: `Payout-${payout._id}`,
      memo: `Commission payout for ${affiliate.name}`,
      metadata: {
        payoutId: payout._id.toString(),
        affiliateId: affiliate._id.toString()
      }
    });
    
    // Update payout status and details
    payout.status = 'processing';
    payout.paymentDetails = {
      reference: paymentResponse.reference,
      externalReference: paymentResponse.externalReference
    };
    await payout.save();
    
    // Mark conversions as paid
    await Conversion.updateMany(
      { _id: { $in: payout.conversions } },
      { $set: { status: 'paid' } }
    );
    
    return payout;
  } catch (error) {
    // Error handling...
  }
}
```

## Webhook Integration

Payman webhooks are used to receive payment status updates:

```typescript
export async function handlePaymentWebhook(payload: any) {
  try {
    const { event, payment } = payload;
    
    // Find the related payout by reference
    const payout = await Payout.findOne({
      'paymentDetails.reference': payment.reference
    });
    
    if (!payout) {
      throw new Error('Payout not found for payment reference');
    }
    
    // Update payout status based on event
    switch (event) {
      case 'payment.completed':
        payout.status = 'completed';
        payout.processedAt = new Date();
        
        // Update affiliate's paid amount
        await Affiliate.findByIdAndUpdate(payout.affiliateId, {
          $inc: {
            totalPaid: payout.amount,
            pendingAmount: -payout.amount
          }
        });
        break;
        
      case 'payment.failed':
        payout.status = 'failed';
        payout.paymentDetails.errorDetails = payment.failureReason;
        
        // Revert conversions to approved status
        await Conversion.updateMany(
          { _id: { $in: payout.conversions } },
          { $set: { status: 'approved' } }
        );
        break;
    }
    
    await payout.save();
    return payout;
  } catch (error) {
    // Error handling...
  }
}
```

## Payment Settings

Payment settings are configured in the application settings:

1. **API Keys**: Payman API key and other integration keys
2. **Payout Settings**: Minimum payout amount, frequency, automatic processing
3. **Default Methods**: Preferred payment methods

These settings are managed through the SettingsForm component:

```typescript
<FormField
  control={apiKeysForm.control}
  name="paymanApiKey"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Payman API Key</FormLabel>
      <FormControl>
        <Input type="password" {...field} />
      </FormControl>
      <FormDescription>API key for Payman payment processing</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Payment Types

Payment-related interfaces are defined in `types/payment.ts`:

```typescript
export interface SendPaymentParams {
  amount: number;
  currency: string;
  payeeId: string;
  reference?: string;
  memo?: string;
  metadata?: Record<string, any>;
}

export interface PaymanPaymentResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  reference?: string;
  externalReference?: string;
  createdAt: string;
  processedAt?: string;
  amount: number;
  currency: string;
  payeeId: string;
  payeeName: string;
  paymentMethod: string;
  metadata?: Record<string, any>;
}
```

These types ensure type safety throughout the payment processing flow.
