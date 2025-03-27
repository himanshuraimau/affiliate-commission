"use client"

import { CalendarIcon, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePayoutsFilter } from "./payouts-filter-context"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PayoutsFilter() {
  const {
    dateRange,
    statusFilter,
    paymentMethodFilter,
    setDateRange,
    setStatusFilter,
    setPaymentMethodFilter,
    clearFilters
  } = usePayoutsFilter()

  // Count active filters
  const activeFiltersCount = [
    dateRange.from || dateRange.to ? 1 : 0,
    statusFilter !== "all" ? 1 : 0,
    paymentMethodFilter !== "all" ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  // Handle date selection with proper typing
  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange) {
      setDateRange({
        from: selectedRange.from,
        to: selectedRange.to
      });
    } else {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex-1"></div>

      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={dateRange.from || dateRange.to ? "default" : "outline"}
              className={cn(
                "justify-start text-left font-normal", 
                !dateRange.from && !dateRange.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Date Range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to
              }}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={cn(
            "w-[150px]",
            statusFilter !== "all" && "bg-primary text-primary-foreground"
          )}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
          <SelectTrigger className={cn(
            "w-[150px]",
            paymentMethodFilter !== "all" && "bg-primary text-primary-foreground"
          )}>
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="ACH">ACH</SelectItem>
            <SelectItem value="USDC">USDC</SelectItem>
          </SelectContent>
        </Select>
        
        {activeFiltersCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <RefreshCw className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}

