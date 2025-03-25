"use client"

import { CalendarIcon, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useConversionsFilter } from "./conversions-filter-context"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAffiliates } from "@/lib/api/hooks"

export function ConversionsFilter() {
  const {
    dateRange,
    statusFilter,
    affiliateFilter,
    searchTerm,
    setDateRange,
    setStatusFilter,
    setAffiliateFilter,
    setSearchTerm,
    clearFilters
  } = useConversionsFilter()
  
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates()

  // Count active filters (excluding search)
  const activeFiltersCount = [
    dateRange.from || dateRange.to ? 1 : 0,
    statusFilter !== "all" ? 1 : 0,
    affiliateFilter !== "all" ? 1 : 0
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
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Search by order ID or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

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
              autoFocus
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        <Select value={affiliateFilter} onValueChange={setAffiliateFilter}>
          <SelectTrigger className={cn(
            "w-[180px]",
            affiliateFilter !== "all" && "bg-primary text-primary-foreground"
          )}>
            <SelectValue placeholder="Affiliate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Affiliates</SelectItem>
            {affiliates.map(affiliate => (
              <SelectItem key={affiliate._id} value={affiliate._id}>
                {affiliate.name}
              </SelectItem>
            ))}
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
