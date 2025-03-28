# Frontend Architecture

The Affiliate Commission System follows a modern React architecture built with Next.js 14 and the App Router pattern. This document outlines the high-level architecture decisions and patterns used throughout the application.

## Application Structure

The application is structured using the Next.js App Router pattern, providing a clear organization of pages and components:

```
/app                  # Next.js App Router pages and layouts
  /(dashboard)        # Dashboard routes (protected)
    /dashboard        # Main dashboard page
    /affiliates       # Affiliate management
    /conversions      # Conversion tracking
    /payouts          # Payout management
    /analytics        # Analytics and reporting
    /settings         # System settings
  /login              # Authentication routes
  /signup             # User registration
/components           # Reusable UI components
  /affiliates         # Affiliate-related components  
  /conversion         # Conversion-related components
  /payout             # Payout-related components
  /analytics          # Analytics components
  /dashboard          # Dashboard components
  /ui                 # Base UI components
/lib                  # Utility functions and hooks
  /api                # API client and React Query hooks
  /auth-context.ts    # Authentication context
  /payment            # Payment processing utilities
  /db                 # Database connection and models
  /utils.ts           # General utility functions
/types                # TypeScript type definitions
/public               # Static assets
```

## Client-Server Model

The application adopts Next.js 14's hybrid rendering model:

1. **Server Components**: Used for initial data loading and SEO-sensitive pages.
2. **Client Components**: Used for interactive UI elements and forms.

This hybrid approach allows us to:
- Reduce the JavaScript bundle size
- Improve initial page load performance
- Maintain responsive UI interactions where needed

## Routing and Navigation

Next.js App Router is used for all routing concerns:

1. **Route Groups**: Used to organize related routes (e.g., dashboard, admin)
2. **Dynamic Routes**: For resource-specific pages (e.g., /affiliates/[id])
3. **Layout Components**: For shared UI elements across related routes

## Authentication Flow

Authentication is handled through a custom AuthProvider context:

1. User submits login/signup form
2. API validates credentials and returns JWT and user info
3. Token is stored in an HTTP-only cookie for security
4. AuthProvider maintains authentication state
5. Protected routes redirect unauthenticated users to login
6. Navigation changes based on authentication state

## Protected Routes

Routes under the `/(dashboard)` group are protected, meaning:

1. Server-side checks verify authenticated session
2. Unauthenticated requests are redirected to /login
3. Client-side authentication state prevents unauthorized UI rendering

## Performance Considerations

Several strategies are employed to maintain high performance:

1. **Code Splitting**: Automatic by Next.js App Router
2. **Server Components**: Reduce client JavaScript
3. **React Query Caching**: Minimize redundant API calls
4. **Optimistic UI Updates**: For a responsive feel
5. **Dynamic Imports**: For infrequently accessed components
