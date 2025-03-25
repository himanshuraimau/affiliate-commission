"use client"

import React, { createContext, useState, useContext, ReactNode } from "react"
import { addDays } from "date-fns"

interface PayoutsFilterContextType {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  statusFilter: string
  paymentMethodFilter: string
  searchTerm: string
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
  setStatusFilter: (status: string) => void
  setPaymentMethodFilter: (method: string) => void
  setSearchTerm: (term: string) => void
  clearFilters: () => void
}

const PayoutsFilterContext = createContext<PayoutsFilterContextType | undefined>(undefined)

export function PayoutsFilterProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    setStatusFilter("all")
    setPaymentMethodFilter("all")
    setSearchTerm("")
  }
  
  return (
    <PayoutsFilterContext.Provider
      value={{
        dateRange,
        statusFilter,
        paymentMethodFilter,
        searchTerm,
        setDateRange,
        setStatusFilter,
        setPaymentMethodFilter,
        setSearchTerm,
        clearFilters,
      }}
    >
      {children}
    </PayoutsFilterContext.Provider>
  )
}

export function usePayoutsFilter() {
  const context = useContext(PayoutsFilterContext)
  if (context === undefined) {
    throw new Error("usePayoutsFilter must be used within a PayoutsFilterProvider")
  }
  return context
}
