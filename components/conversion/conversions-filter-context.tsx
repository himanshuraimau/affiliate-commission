"use client"

import React, { createContext, useState, useContext, ReactNode } from "react"

interface ConversionsFilterContextType {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  statusFilter: string
  affiliateFilter: string
  searchTerm: string
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
  setStatusFilter: (status: string) => void
  setAffiliateFilter: (affiliateId: string) => void
  setSearchTerm: (term: string) => void
  clearFilters: () => void
}

const ConversionsFilterContext = createContext<ConversionsFilterContextType | undefined>(undefined)

export function ConversionsFilterProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  
  const [statusFilter, setStatusFilter] = useState("all")
  const [affiliateFilter, setAffiliateFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    setStatusFilter("all")
    setAffiliateFilter("all")
    setSearchTerm("")
  }
  
  return (
    <ConversionsFilterContext.Provider
      value={{
        dateRange,
        statusFilter,
        affiliateFilter,
        searchTerm,
        setDateRange,
        setStatusFilter,
        setAffiliateFilter,
        setSearchTerm,
        clearFilters,
      }}
    >
      {children}
    </ConversionsFilterContext.Provider>
  )
}

export function useConversionsFilter() {
  const context = useContext(ConversionsFilterContext)
  if (context === undefined) {
    throw new Error("useConversionsFilter must be used within a ConversionsFilterProvider")
  }
  return context
}
