import { IPayeeResponse } from "@/types/payman";

export class PaymanClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PAYMANT_API_KEY || '';
    this.baseUrl = process.env.PAYMAN_API_URL || 'https://agent.payman.ai/api';
    
    if (!this.apiKey) {
      console.warn('PAYMAN_API_KEY is not defined in environment variables');
    }
  }

  async createTestRailsPayee(data: {
    name: string;
    email?: string;
    phoneNumber?: string;
    tags?: string[];
  }): Promise<IPayeeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/payees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payman-api-secret': this.apiKey
        },
        body: JSON.stringify({
          type: 'TEST_RAILS',
          name: data.name,
          tags: data.tags || [],
          contactDetails: {
            email: data.email,
            phoneNumber: data.phoneNumber
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create payee: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating TEST_RAILS payee:', error);
      throw error;
    }
  }
}

export const paymanClient = new PaymanClient();
