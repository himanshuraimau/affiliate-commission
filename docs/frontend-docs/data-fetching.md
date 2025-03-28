# Data Fetching Strategy

The Affiliate Commission System uses a robust data fetching strategy built on React Query and a strongly typed API client. This document explains how data is fetched, cached, and updated throughout the application.

## React Query Integration

React Query (TanStack Query) serves as the primary data-fetching and state management solution for server state. The configuration is defined in `lib/providers.tsx`:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
})
```

Key configuration choices:
- **Stale Time**: Data is considered fresh for 60 seconds
- **Retry**: Failed queries are retried once
- **Refetch on Window Focus**: Enabled by default to ensure data freshness

## API Client Layer

A strongly typed API client in `lib/api/client.ts` provides a clean abstraction over API endpoints:

```typescript
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
  
  // Additional methods...
}
```

The API client:
- Is organized by resource type (affiliates, conversions, payouts)
- Handles URL construction
- Manages request parameters
- Processes error responses
- Returns strongly typed results

## Custom React Query Hooks

Custom hooks in `lib/api/hooks.ts` wrap the API client with React Query functionality:

```typescript
// Example hook
export function useAffiliates(status?: string) {
  return useQuery({
    queryKey: ['affiliates', { status }],
    queryFn: () => affiliatesApi.getAll({ status }),
  })
}
```

Benefits of this approach:
- **Consistent Query Keys**: Ensures proper cache invalidation
- **Type Safety**: TypeScript types flow from API to UI
- **Encapsulated Logic**: Query-specific settings in one place
- **Reusability**: Same data access pattern throughout the app

## Mutation Patterns

For data mutations (create, update, delete), we use the `useMutation` hook:

```typescript
export function useCreateAffiliate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<Affiliate, '_id' | 'createdAt' | 'updatedAt'>) => 
      affiliatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliates'] })
    },
  })
}
```

Key patterns:
- **Automatic Invalidation**: Cache is invalidated after successful mutations
- **Optimistic Updates**: For frequently used mutations
- **Error Handling**: Toast notifications for user feedback
- **Query Client Access**: Via the `useQueryClient` hook

## Cache Invalidation Strategy

Cache invalidation follows these principles:
1. Invalidate the exact resource that changed
2. Invalidate collections containing the resource
3. Invalidate related resources that might be affected

For example, approving a conversion:
```typescript
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: ['conversions', variables.id] })
  queryClient.invalidateQueries({ queryKey: ['conversions'] })
  queryClient.invalidateQueries({ queryKey: ['affiliates'] }) 
  queryClient.invalidateQueries({ queryKey: ['stats'] })
}
```

## Error Handling

API errors are handled in multiple ways:
1. **Global Error Boundary**: For unexpected failures
2. **Per-Query Error States**: Using `error` and `isError` from useQuery
3. **Toast Notifications**: For mutation failures
4. **Form Error States**: For validation errors

## Loading States

Loading indicators are handled consistently:
1. **Skeleton Loaders**: For initial content loading
2. **Button Spinners**: For mutation loading states
3. **isLoading Flag**: From React Query to control UI

## Analytics Data

Analytics data uses specialized endpoints with custom date ranges:

```typescript
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
```
