# Affiliate Commission System - Frontend Documentation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: Custom components built with Tailwind CSS and shadcn/ui
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Custom auth context using cookies and JWT
- **API Integration**: Custom React Query hooks with Axios

## Architecture Overview

The application follows a modern React architecture with:

- **App Router**: Uses Next.js App Router for routing and layouts
- **Server Components**: Leverages Next.js Server Components for initial data loading
- **Client Components**: Uses client components for interactive UI elements
- **API Layer**: Structured API client with React Query for data fetching

## Directory Structure

```
/app                  # Next.js App Router pages and layouts
  /(dashboard)        # Dashboard routes (protected)
  /login              # Authentication routes
  /signup             # User registration
/components           # Reusable UI components
  /affiliates         # Affiliate-related components  
  /ui                 # Base UI components
/lib                  # Utility functions and hooks
  /api                # API client and React Query hooks
  /auth-context.ts    # Authentication context
  /payment            # Payment processing utilities
  /db                 # Database connection and models
  /utils.ts           # General utility functions
/types                # TypeScript type definitions
```

## Data Fetching

### React Query Integration

Data fetching is handled through React Query, set up in `lib/providers.tsx`:

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

### API Client

The API client in `lib/api/client.ts` provides typed functions for API interactions:

- `affiliatesApi` - Manage affiliate data
- `conversionsApi` - Track conversion data
- `payoutsApi` - Handle payout operations
- `settingsApi` - Manage system settings
- `statsApi` - Get dashboard statistics

### React Query Hooks

Custom hooks in `lib/api/hooks.ts` wrap the API client with React Query:

```typescript
// Example hook
export function useAffiliates(status?: string) {
  return useQuery({
    queryKey: ['affiliates', { status }],
    queryFn: () => affiliatesApi.getAll({ status }),
  })
}
```

## Authentication

Authentication is managed through a custom `AuthProvider` that:

1. Handles user login/signup requests
2. Maintains session state
3. Redirects unauthenticated users
4. Provides auth status to components

## Component Organization

### Layout Components

- `AffiliateDashboardSidebar` - Main navigation sidebar
- `Providers` - Wraps application with necessary providers

### Feature Components

Components are organized by feature:

- **Affiliates**: `AffiliatesList`, `AffiliateForm`, `TopAffiliates`
- **Payouts**: `PayoutOverview`, `PayoutForm`
- **Settings**: `SettingsForm`

### UI Components

Built on shadcn/ui with Tailwind CSS for consistent styling.

## Form Handling

Forms use React Hook Form with Zod validation:

```typescript
// Example schema
const affiliateFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  // ...other fields
})

// Form setup
const form = useForm<z.infer<typeof affiliateFormSchema>>({
  resolver: zodResolver(affiliateFormSchema),
  defaultValues: { /* ... */ }
})
```

## Payment Integration

The application integrates with Payman API for payment processing:

1. Creating payees when affiliates are registered
2. Processing payouts to affiliates
3. Tracking payment status

The `PaymanClient` in `lib/payment/payman-client.ts` handles API interactions.

## State Management

- **Server State**: Managed with React Query
- **UI State**: Local React state with useState/useReducer
- **Global UI State**: Context API for theme, sidebar, etc.

## Error Handling

- API errors are caught and displayed via toast notifications
- Form validation errors shown inline
- Authentication errors redirect to login

## Performance Considerations

- React Query for efficient data caching and revalidation
- Optimistic UI updates for a responsive feel
- Pagination for large data sets
- Code splitting via Next.js App Router