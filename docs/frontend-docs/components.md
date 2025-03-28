# Component Architecture

The Affiliate Commission System uses a structured component architecture to ensure maintainability, reusability, and consistency. This document outlines the component organization patterns and key components used throughout the application.

## Component Organization

Components are organized into several categories:

1. **Feature Components**: Grouped by domain/feature (affiliates, conversions, etc.)
2. **UI Components**: Reusable UI primitives built on shadcn/ui
3. **Layout Components**: For page structure and navigation
4. **Context Providers**: For shared state management
5. **Page Components**: Next.js pages that compose other components

## Feature Components

Feature components are organized by domain area:

### Affiliate Components
- `AffiliatesList`: Displays a table of affiliates with filtering
- `AffiliateForm`: Form for creating/editing affiliates
- `TopAffiliates`: Dashboard widget showing top performing affiliates
- `AffiliateDashboardSidebar`: Main navigation sidebar

### Conversion Components
- `ConversionsList`: Displays a table of conversions with filtering
- `ConversionForm`: Form for creating/editing conversions
- `RecentConversions`: Dashboard widget showing recent conversions
- `ConversionsFilter`: Filter interface for conversions

### Payout Components
- `PayoutsList`: Displays a table of payouts with filtering
- `PayoutOverview`: Dashboard widget showing payout summary
- `PayoutsFilter`: Filter interface for payouts

### Analytics Components
- `RevenueOverTimeChart`: Chart showing revenue trends
- `ConversionRateChart`: Chart showing conversion rate trends
- `TopAffiliatesChart`: Chart showing top affiliates
- `CommissionBreakdownChart`: Chart showing commission distribution
- `AnalyticsFilter`: Date range and comparison filters

### Dashboard Components
- `DashboardCards`: Key metrics cards for dashboard
- `DashboardHeader`: Dashboard header with date filter

## UI Components

UI components are built on top of shadcn/ui primitives:

```
/components/ui
  /button.tsx
  /card.tsx
  /dropdown-menu.tsx
  /form.tsx
  /input.tsx
  /select.tsx
  /sidebar.tsx
  /table.tsx
  /toast.tsx
  ...
```

These components:
- Are unstyled by default
- Use Tailwind CSS for styling
- Are composed to build more complex components
- Maintain consistent design language

## Context Providers

The application uses several context providers:

1. **AuthProvider**: Manages authentication state
2. **ThemeProvider**: Manages light/dark theme
3. **SidebarProvider**: Manages sidebar state (open/closed)
4. **ConversionsFilterProvider**: Manages conversion filtering state
5. **PayoutsFilterProvider**: Manages payout filtering state
6. **AnalyticsFilterProvider**: Manages analytics filtering state

Example of using a filter context:

```tsx
// Define context
export const ConversionsFilterContext = createContext<ConversionsFilterContextType | undefined>(undefined)

// Provider component
export function ConversionsFilterProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  
  // More state...
  
  return (
    <ConversionsFilterContext.Provider value={{
      dateRange,
      setDateRange,
      // More values...
    }}>
      {children}
    </ConversionsFilterContext.Provider>
  )
}

// Usage in components
export function ConversionsFilter() {
  const { dateRange, setDateRange } = useConversionsFilter()
  
  // Component implementation...
}
```

## Component Composition Patterns

The application uses several composition patterns:

### Container/Presenter Pattern

Components are often split into:
- **Container Components**: Handle data fetching and state
- **Presenter Components**: Focus on rendering UI

Example:
```tsx
// Container component
export function ConversionsList() {
  const { data: conversions, isLoading } = useConversions()
  
  // Additional logic...
  
  return <ConversionsTable conversions={enrichedConversions} isLoading={isLoading} />
}

// Presenter component
function ConversionsTable({ conversions, isLoading }: ConversionsTableProps) {
  // Rendering logic...
}
```

### Composition with Children

For flexible component composition:

```tsx
function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("bg-card border rounded-lg shadow", className)} {...props}>
      {children}
    </div>
  )
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-3">{children}</div>
}

// Usage
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

### Higher-Order Components

Used for cross-cutting concerns:

```tsx
function withAuth(Component: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const { isAuthenticated, isLoading } = useAuth()
    
    if (isLoading) return <Loading />
    if (!isAuthenticated) return <Redirect to="/login" />
    
    return <Component {...props} />
  }
}
```

## State Management Within Components

Components manage state using React hooks:

1. **useState**: For simple component state
2. **useReducer**: For complex state logic
3. **useContext**: For shared state across components
4. **useQuery/useMutation**: For server state
5. **useForm**: For form state (with React Hook Form)

Example of form state management:

```tsx
const form = useForm<z.infer<typeof affiliateFormSchema>>({
  resolver: zodResolver(affiliateFormSchema),
  defaultValues: {
    name: "",
    email: "",
    // Other defaults...
  },
})

// Form submission
async function onSubmit(values: z.infer<typeof affiliateFormSchema>) {
  try {
    await createAffiliate.mutateAsync(values)
    toast.success("Affiliate created")
    router.push("/affiliates")
  } catch (error) {
    toast.error("Failed to create affiliate")
  }
}
```
