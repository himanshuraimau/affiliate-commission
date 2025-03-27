/**
 * API client for making requests to the backend
 */

// Base API paths
const API_BASE = '/api';
const AFFILIATES_PATH = `${API_BASE}/affiliates`;
const CONVERSIONS_PATH = `${API_BASE}/conversions`;
const PAYOUTS_PATH = `${API_BASE}/payouts`;
const SETTINGS_PATH = `${API_BASE}/settings`;

// Types - These should match your backend models
export interface Affiliate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  promoCode: string;
  commissionRate: number;
  paymentMethod: "TEST_RAILS";
  paymentDetails: {
    name: string;
    payeeId: string;
    contactDetails?: {
      email: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Conversion {
  _id: string;
  affiliateId: string;
  orderId: string;
  orderAmount: number;
  commissionAmount: number;
  promoCode: string;
  customer: {
    email: string;
    name?: string;
  };
  status: "pending" | "approved" | "rejected" | "paid";
  payoutId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  _id: string;
  affiliateId: string;
  amount: number;
  conversions: string[];
  paymentMethod: "TEST_RAILS";
  paymentDetails: {
    reference?: string;
    externalReference?: string;
    memo?: string;
    metadata?: Record<string, any>;
  };
  status: "pending" | "processing" | "completed" | "failed";
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
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
  updatedAt: string;
}

export interface DashboardStats {
  totalAffiliates: number;
  activeAffiliates: number;
  pendingConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  pendingCommissions: number;
  conversionRate: number;
  recentConversions: Conversion[];
  topAffiliates: {
    _id: string;
    name: string;
    email: string;
    totalEarned: number;
    promoCode: string;
  }[];
}

// Affiliates API
export const affiliatesApi = {
  getAll: async (params?: { status?: string }): Promise<Affiliate[]> => {
    const url = new URL(AFFILIATES_PATH, window.location.origin);
    
    if (params?.status) {
      url.searchParams.append('status', params.status);
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch affiliates');
    }
    return response.json();
  },
  
  getById: async (id: string): Promise<Affiliate> => {
    const response = await fetch(`${AFFILIATES_PATH}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch affiliate with id: ${id}`);
    }
    return response.json();
  },
  
  create: async (data: Omit<Affiliate, '_id' | 'createdAt' | 'updatedAt'>): Promise<Affiliate> => {
    const response = await fetch(AFFILIATES_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create affiliate');
    }
    return response.json();
  },
  
  update: async (id: string, data: Partial<Affiliate>): Promise<Affiliate> => {
    const response = await fetch(`${AFFILIATES_PATH}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update affiliate with id: ${id}`);
    }
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${AFFILIATES_PATH}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete affiliate with id: ${id}`);
    }
  },
};

// Conversions API
export const conversionsApi = {
  getAll: async (params?: { status?: string, dateFrom?: string, dateTo?: string }): Promise<Conversion[]> => {
    const url = new URL(CONVERSIONS_PATH, window.location.origin);
    
    if (params?.status) {
      url.searchParams.append('status', params.status);
    }
    
    if (params?.dateFrom) {
      url.searchParams.append('dateFrom', params.dateFrom);
    }
    
    if (params?.dateTo) {
      url.searchParams.append('dateTo', params.dateTo);
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch conversions');
    }
    return response.json();
  },
  
  getById: async (id: string): Promise<Conversion> => {
    const response = await fetch(`${CONVERSIONS_PATH}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversion with id: ${id}`);
    }
    return response.json();
  },
  
  updateStatus: async (id: string, status: "pending" | "approved" | "rejected"): Promise<Conversion> => {
    const response = await fetch(`${CONVERSIONS_PATH}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update status for conversion with id: ${id}`);
    }
    return response.json();
  },
};

// Payouts API
export const payoutsApi = {
  getAll: async (params?: { status?: string, dateFrom?: string, dateTo?: string, paymentMethod?: string }): Promise<Payout[]> => {
    const url = new URL(PAYOUTS_PATH, window.location.origin);
    
    // Add all params to URL
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch payouts');
    }
    return response.json();
  },
  
  getById: async (id: string): Promise<Payout> => {
    const response = await fetch(`${PAYOUTS_PATH}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch payout with id: ${id}`);
    }
    return response.json();
  },
  
  process: async (id: string): Promise<Payout> => {
    const response = await fetch(`${PAYOUTS_PATH}/${id}/process`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to process payout with id: ${id}`);
    }
    return response.json();
  },
  
  create: async (affiliateId: string, conversionIds: string[]): Promise<Payout> => {
    const response = await fetch(PAYOUTS_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ affiliateId, conversionIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payout');
    }
    return response.json();
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<Settings> => {
    const response = await fetch(SETTINGS_PATH);
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return response.json();
  },
  
  update: async (data: Partial<Settings>): Promise<Settings> => {
    const response = await fetch(SETTINGS_PATH, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update settings');
    }
    return response.json();
  },
};

// Dashboard stats API
export const statsApi = {
  getDashboardStats: async (dateFrom?: string, dateTo?: string): Promise<any> => {
    const url = new URL(`${API_BASE}/stats/dashboard`, window.location.origin);
    
    if (dateFrom) {
      url.searchParams.append('dateFrom', dateFrom);
    }
    
    if (dateTo) {
      url.searchParams.append('dateTo', dateTo);
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return response.json();
  },
};
