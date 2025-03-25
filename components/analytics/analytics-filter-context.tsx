"use client"

import React, { createContext, useState, useContext, ReactNode } from "react"
import { addDays, subDays } from "date-fns"

interface AnalyticsFilterContextType {
  dateRange: {
    from: Date
    to: Date
  }
  comparisonRange: {
    from: Date
    to: Date
  } | null
  enableComparison: boolean
  setDateRange: (range: { from: Date; to: Date }) => void
  setComparisonRange: (range: { from: Date; to: Date } | null) => void
  setEnableComparison: (enable: boolean) => void
  setPresetRange: (days: number) => void
  clearFilters: () => void
}

const AnalyticsFilterContext = createContext<AnalyticsFilterContextType | undefined>(undefined)

export function AnalyticsFilterProvider({ children }: { children: ReactNode }) {
  // Default to last 30 days
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)
  
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: thirtyDaysAgo,
    to: today,
  })
  
  const [comparisonRange, setComparisonRange] = useState<{
    from: Date
    to: Date
  } | null>(null)
  
  const [enableComparison, setEnableComparison] = useState(false)
  
  const setPresetRange = (days: number) => {
    const to = new Date()
    const from = subDays(to, days)
    setDateRange({ from, to })
    
    // Automatically update comparison range to previous period
    if (enableComparison) {
      const compTo = subDays(from, 1)
      const compFrom = subDays(compTo, days)
      setComparisonRange({ from: compFrom, to: compTo })
    }
  }
  
  const clearFilters = () => {
    setDateRange({
      from: thirtyDaysAgo,
      to: today,
    })
    setComparisonRange(null)
    setEnableComparison(false)
  }
  
  return (
    <AnalyticsFilterContext.Provider
      value={{
        dateRange,
        comparisonRange,
        enableComparison,
        setDateRange,
        setComparisonRange,
        setEnableComparison,
        setPresetRange,
        clearFilters,
      }}
    >
      {children}
    </AnalyticsFilterContext.Provider>
  )
}

export function useAnalyticsFilter() {
  const context = useContext(AnalyticsFilterContext)
  if (context === undefined) {
    throw new Error("useAnalyticsFilter must be used within an AnalyticsFilterProvider")
  }
  return context
}
