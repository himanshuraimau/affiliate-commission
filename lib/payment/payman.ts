import Payman from 'paymanai';

interface PaymanConfig {
  apiSecret: string;
}

// Define return types for payment results
interface ACHPaymentResult {
  transactionId: string;
  status: string;
}

interface USDCPaymentResult {
  txHash: string;
  status: string;
}

export class PaymanService {
  private client: any;
  
  constructor(config: PaymanConfig) {
    this.client = new Payman({
      xPaymanAPISecret: config.apiSecret,
    });
  }
  
  async createACHPayment(affiliate: any, amount: number): Promise<ACHPaymentResult> {
    try {
      // First create or retrieve a payee
      const payeeData = {
        type: "US_ACH",
        name: affiliate.name,
        accountHolderName: affiliate.paymentDetails.achAccount.accountName,
        accountHolderType: "individual", 
        accountNumber: affiliate.paymentDetails.achAccount.accountNumber,
        routingNumber: affiliate.paymentDetails.achAccount.routingNumber,
        accountType: "checking", // Assuming checking account
        contactDetails: {
          email: affiliate.email,
        },
      };
      
      const payee = await this.client.payments.createPayee(payeeData);
      
      // Then send the payment
      const payment = await this.client.payments.sendPayment({
        amountDecimal: amount,
        payeeId: payee.id,
        memo: `Affiliate payout for ${affiliate.name}`,
      });
      
      return {
        transactionId: payment.id,
        status: payment.status,
      };
    } catch (error: unknown) {
      console.error('Payman ACH payment error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Payment failed: ${errorMessage}`);
    }
  }
  
  async createUSDCPayment(affiliate: any, amount: number): Promise<USDCPaymentResult> {
    try {
      // For USDC payments, we need wallet address
      const walletAddress = affiliate.paymentDetails.usdcWallet;
      
      if (!walletAddress) {
        throw new Error('No USDC wallet address provided');
      }
      
      // Create a crypto payee
      const payeeData = {
        type: "CRYPTO",
        name: affiliate.name,
        walletAddress: walletAddress,
        chain: "ethereum", // assuming Ethereum chain for USDC
        currency: "USDC",
        contactDetails: {
          email: affiliate.email,
        },
      };
      
      const payee = await this.client.payments.createPayee(payeeData);
      
      // Send the crypto payment
      const payment = await this.client.payments.sendPayment({
        amountDecimal: amount,
        payeeId: payee.id,
        memo: `Affiliate payout for ${affiliate.name}`,
      });
      
      return {
        txHash: payment.transactionHash,
        status: payment.status,
      };
    } catch (error: unknown) {
      console.error('Payman USDC payment error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Crypto payment failed: ${errorMessage}`);
    }
  }
}

export function createPaymanService(apiSecret: string) {
  return new PaymanService({ apiSecret });
}
