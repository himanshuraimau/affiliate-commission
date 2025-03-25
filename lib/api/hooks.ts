/**
 * React Query hooks for API data fetching
 */
import { useQuery, useMutation, QueryClient, QueryKey } from '@tanstack/react-query'
import {
  affiliatesApi,
  conversionsApi,
  payoutsApi,
  settingsApi,
  statsApi,
  type Affiliate,
  type Conversion,
  type Payout,
  type Settings
} from './client'

// Affiliates Hooks
export function useAffiliates(status?: string) {
  return useQuery({
    queryKey: ['affiliates', { status }],
    queryFn: () => affiliatesApi.getAll({ status }),
  })
}

export function useAffiliate(id: string) {
  return useQuery({
    queryKey: ['affiliates', id],
    queryFn: () => affiliatesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateAffiliate() {
  const queryClient = new QueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<Affiliate, '_id' | 'createdAt' | 'updatedAt'>) => 
      affiliatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliates'] })
    },
  })
}

export function useUpdateAffiliate() {
  const queryClient = new QueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Affiliate> }) => 
      affiliatesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['affiliates', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['affiliates'] })
    },
  })
}

export function useDeleteAffiliate() {
  const queryClient = new QueryClient()
  
  return useMutation({
    mutationFn: (id: string) => affiliatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliates'] })
    },
  })
}

// Conversions Hooks
export function useConversions(params?: { status?: string, dateFrom?: string, dateTo?: string }) {
  return useQuery({
    queryKey: ['conversions', params],
    queryFn: () => conversionsApi.getAll(params),
  })
}

export function useConversion(id: string) {
  return useQuery({
    queryKey: ['conversions', id],
    queryFn: () => conversionsApi.getById(id),
    enabled: !!id,
  })
}

export function useUpdateConversionStatus() {
  const queryClient = new QueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string, status: "pending" | "approved" | "rejected" }) => 
      conversionsApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversions', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['conversions'] })
      queryClient.invalidateQueries({ queryKey: ['affiliates'] }) // May affect affiliate stats
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

// Payouts Hooks
export function usePayouts(params?: { status?: string, dateFrom?: string, dateTo?: string }) {
  return useQuery({
    queryKey: ['payouts', params],
    queryFn: () => payoutsApi.getAll(params),
  })
}

export function usePayout(id: string) {
  return useQuery({
    queryKey: ['payouts', id],
    queryFn: () => payoutsApi.getById(id),
    enabled: !!id,
  })
}

export function useProcessPayout() {
  const queryClient = new QueryClient()
  
  return useMutation({
    mutationFn: (id: string) => payoutsApi.process(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payouts', id] })
      queryClient.invalidateQueries({ queryKey: ['payouts'] })
      queryClient.invalidateQueries({ queryKey: ['conversions'] }) // May affect conversion status
      queryClient.invalidateQueries({ queryKey: ['affiliates'] }) // May affect affiliate stats
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useCreatePayout() {
  const queryClient = new QueryClient()
  
  return useMutation({
    mutationFn: ({ affiliateId, conversionIds }: { affiliateId: string, conversionIds: string[] }) => 
      payoutsApi.create(affiliateId, conversionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] })
      queryClient.invalidateQueries({ queryKey: ['conversions'] })
      queryClient.invalidateQueries({ queryKey: ['affiliates'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

// Settings Hooks
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  })
}

export function useUpdateSettings() {
  const queryClient = new QueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<Settings>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

// Stats Hooks
export function useDashboardStats(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['stats', 'dashboard', { dateFrom, dateTo }],
    queryFn: () => statsApi.getDashboardStats(dateFrom, dateTo),
  })
}

// Analytics Hooks
export function useAnalyticsOverview(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['analytics', 'overview', { dateFrom, dateTo }],
    queryFn: async () => {
      const url = new URL('/api/analytics/overview', window.location.origin);
      
      if (dateFrom) {
        url.searchParams.append('from', dateFrom);
      }
      
      if (dateTo) {
        url.searchParams.append('to', dateTo);
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics overview');
      }
      return response.json();
    }
  });
}

export function useRevenueOverTime(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['analytics', 'revenue', { dateFrom, dateTo }],
    queryFn: async () => {
      const url = new URL('/api/analytics/revenue', window.location.origin);
      
      if (dateFrom) {
        url.searchParams.append('from', dateFrom);
      }
      
      if (dateTo) {
        url.searchParams.append('to', dateTo);
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      return response.json();
    }
  });
}

export function useConversionRates(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['analytics', 'conversion-rate', { dateFrom, dateTo }],
    queryFn: async () => {
      const url = new URL('/api/analytics/conversion-rate', window.location.origin);
      
      if (dateFrom) {
        url.searchParams.append('from', dateFrom);
      }
      
      if (dateTo) {
        url.searchParams.append('to', dateTo);
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch conversion rate data');
      }
      return response.json();
    }
  });
}

export function useTopAffiliates(dateFrom?: string, dateTo?: string, limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'top-affiliates', { dateFrom, dateTo, limit }],
    queryFn: async () => {
      const url = new URL('/api/analytics/top-affiliates', window.location.origin);
      
      if (dateFrom) {
        url.searchParams.append('from', dateFrom);
      }
      
      if (dateTo) {
        url.searchParams.append('to', dateTo);
      }
      
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch top affiliates data');
      }
      return response.json();
    }
  });
}

export function useCommissionBreakdown(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['analytics', 'commission-breakdown', { dateFrom, dateTo }],
    queryFn: async () => {
      const url = new URL('/api/analytics/commission-breakdown', window.location.origin);
      
      if (dateFrom) {
        url.searchParams.append('from', dateFrom);
      }
      
      if (dateTo) {
        url.searchParams.append('to', dateTo);
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch commission breakdown data');
      }
      return response.json();
    }
  });
}
