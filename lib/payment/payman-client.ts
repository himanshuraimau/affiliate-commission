import axios from 'axios';

// Base URL for Payman API
const PAYMAN_API_BASE_URL = 'https://agent.payman.ai/api';

// Types for Payman API responses
export interface PaymanPaymentResponse {
  reference: string;
  externalReference: string;
  status: string;
}

export interface PaymanErrorResponse {
  error: string;
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  details?: any;
}

export class PaymanClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Send a payment using the Payman API
   */
  async sendPayment(params: {
    name?: string;
    amountDecimal: number;
    payeeId: string;
    payeeName?: string;
    memo: string;
  }): Promise<PaymanPaymentResponse> {
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
      if (axios.isAxiosError(error) && error.response) {
        console.error('Payman API error:', error.response.data);
        
        const errorData = error.response.data as PaymanErrorResponse;
        throw new Error(
          errorData.errorMessage || 
          errorData.message || 
          errorData.error || 
          'Payment processing failed'
        );
      }
      
      console.error('Payman API error:', error);
      throw new Error('Error connecting to payment service');
    }
  }
  
  /**
   * Create a test payee in the Payman system
   */
  async createTestPayee(params: {
    name: string;
    email?: string;
    tags?: string[];
    contactDetails?: any;
  }): Promise<any> {
    try {
      const response = await axios({
        method: 'POST',
        url: `${PAYMAN_API_BASE_URL}/payments/payees`,
        headers: {
          'x-payman-api-secret': this.apiKey,
          'Content-Type': 'application/json'
        },
        data: {
          type: "TEST_RAILS",
          name: params.name,
          tags: params.tags || [],
          contactDetails: params.contactDetails || {}
        }
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Payman API error:', error.response.data);
        throw new Error(
          error.response.data.message || 
          error.response.data.error || 
          'Failed to create test payee'
        );
      }
      
      console.error('Payman API error:', error);
      throw new Error('Error connecting to payment service');
    }
  }
}

/**
 * Create a new Payman client instance
 */
export function createPaymanClient(apiKey: string): PaymanClient {
  return new PaymanClient(apiKey);
}
