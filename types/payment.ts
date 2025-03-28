// Payment API response types
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

// Payment Request types
export interface SendPaymentParams {
  name?: string;
  amountDecimal: number;
  payeeId: string;
  payeeName?: string;
  memo: string;
}

export interface CreatePayeeParams {
  name: string;
  email?: string;
  phoneNumber?: string;
  tags?: string[];
}
