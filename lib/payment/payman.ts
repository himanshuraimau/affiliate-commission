import Payman from 'paymanai';

interface PaymanConfig {
  apiSecret: string;
}

// Define return type for payment results
interface PaymentResult {
  reference: string;
  externalReference: string;
  status: string;
}

export class PaymanService {
  private client: any;
  
  constructor(config: PaymanConfig) {
    this.client = new Payman({
      xPaymanAPISecret: config.apiSecret,
    });
  }
  
  async createPayment(affiliate: any, amount: number): Promise<PaymentResult> {
    try {
      // Using the TEST_RAILS payment method as specified in the updated schema
      if (!affiliate.paymentDetails?.payeeId) {
        throw new Error('No payee ID provided for payment');
      }
      
      // Send the payment using the payee ID
      const payment = await this.client.payments.sendPayment({
        amountDecimal: amount,
        payeeId: affiliate.paymentDetails.payeeId,
        memo: `Affiliate payout for ${affiliate.paymentDetails.name || affiliate.name}`,
      });
      
      return {
        reference: payment.reference,
        externalReference: payment.externalReference,
        status: payment.status
      };
    } catch (error: unknown) {
      console.error('Payman payment error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Payment failed: ${errorMessage}`);
    }
  }
}

export function createPaymanService(apiSecret: string) {
  return new PaymanService({ apiSecret });
}
