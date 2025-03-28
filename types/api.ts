// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

// Analytics types
export interface AnalyticsOverviewData {
  totalRevenue: number;
  revenueGrowth: number;
  conversionRate: number;
  conversionRateChange: number;
  activeAffiliates: number;
  affiliatesGrowth: number;
  averageCommission: number;
  averageCommissionChange: number;
}

export interface RevenueDataPoint {
  date: string;
  orderAmount: number;
  commissionAmount: number;
  count: number;
}

export interface ConversionRateDataPoint {
  date: string;
  rate: number;
  total: number;
  approved: number;
}

export interface CommissionBreakdownItem {
  name: string;
  value: number;
}

export interface TopAffiliateItem {
  id: string;
  name: string;
  revenue: number;
  commissionsEarned: number;
  conversionCount: number;
}

// Dashboard stats
export interface DashboardStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalConversions: number;
  pendingConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  pendingPayouts: number;
  conversionRate: number;
}
