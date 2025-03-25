/**
 * UNUSED COMPONENT - Removed per requirements
 * Keeping file for reference in case filters need to be re-added later
 */

"use client"

import { CalendarIcon, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAnalyticsFilter } from "./analytics-filter-context"

export function AnalyticsFilter() {
  const {
    dateRange,
    comparisonRange,
    enableComparison,
    setDateRange,
    setComparisonRange,
    setEnableComparison,
    setPresetRange,
    clearFilters
  } = useAnalyticsFilter()

  // Handle date range selection with proper typing
  const handleDateRangeSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange?.from && selectedRange?.to) {
      setDateRange({
        from: selectedRange.from,
        to: selectedRange.to
      });
    }
  }
  
  // Handle comparison range selection with proper typing
  const handleComparisonRangeSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange?.from && selectedRange?.to) {
      setComparisonRange({
        from: selectedRange.from,
        to: selectedRange.to
      });
    }
  }

  // Calculate total days in the range
  const daysDifference = Math.ceil(
    (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Handle preset selection
  const handlePresetSelect = (preset: string) => {
    switch (preset) {
      case "7d":
        setPresetRange(7)
        break
      case "30d":
        setPresetRange(30)
        break
      case "90d":
        setPresetRange(90)
        break
      case "ytd":
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        setDateRange({ from: startOfYear, to: now })
        break
    }
  }

  // Toggle comparison mode
  const handleToggleComparison = (checked: boolean) => {
    setEnableComparison(checked)
    
    if (checked && !comparisonRange) {
      // Default to previous period of same length
      const daysInRange = Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
      )
      const compTo = new Date(dateRange.from)
      compTo.setDate(compTo.getDate() - 1)
      
      const compFrom = new Date(compTo)
      compFrom.setDate(compFrom.getDate() - daysInRange)
      
      setComparisonRange({ from: compFrom, to: compTo })
    }
  }

  return (
    <div className="bg-card border rounded-md p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div>
          <Tabs defaultValue="30d" className="w-full" onValueChange={handlePresetSelect}>
            <TabsList>
              <TabsTrigger value="7d">Last 7 days</TabsTrigger>
              <TabsTrigger value="30d">Last 30 days</TabsTrigger>
              <TabsTrigger value="90d">Last 90 days</TabsTrigger>
              <TabsTrigger value="ytd">Year to date</TabsTrigger>
              <TabsTrigger value="custom" disabled>Custom</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to default</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="compare-mode" 
          checked={enableComparison}
          onCheckedChange={handleToggleComparison}
        />
        <Label htmlFor="compare-mode">Compare with previous period</Label>
        
        {enableComparison && comparisonRange && (
          <Badge variant="secondary" className="ml-2">
            Comparing with: {format(comparisonRange.from, "LLL dd, y")} - {format(comparisonRange.to, "LLL dd, y")}
          </Badge>
        )}
        
        {enableComparison && comparisonRange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Change
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={comparisonRange.from}
                selected={{ from: comparisonRange.from, to: comparisonRange.to }}
                onSelect={handleComparisonRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}
