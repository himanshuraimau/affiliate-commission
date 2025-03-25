"use client"

import { useState, createContext, useContext } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format, subDays, subMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Create context for analytics date range
type DateRange = {
  from: Date
  to: Date
}

type AnalyticsDateContextType = {
  dateRange: DateRange
  dateParams: {
    from: string
    to: string
  }
}

const AnalyticsDateContext = createContext<AnalyticsDateContextType | undefined>(undefined)

export function useAnalyticsDate() {
  const context = useContext(AnalyticsDateContext)
  if (!context) {
    throw new Error("useAnalyticsDate must be used within an AnalyticsDateProvider")
  }
  return context
}

export function AnalyticsDatePicker() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get initial dates from URL or default to last 30 days
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")
  const now = new Date()
  const defaultFrom = subDays(now, 30)
  
  const initialFrom = fromParam ? new Date(fromParam) : defaultFrom
  const initialTo = toParam ? new Date(toParam) : now
  
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date | undefined
  }>({
    from: initialFrom,
    to: initialTo,
  })
  
  // Format dates for API params
  const dateParams = {
    from: dateRange.from.toISOString().split("T")[0],
    to: dateRange.to ? dateRange.to.toISOString().split("T")[0] : now.toISOString().split("T")[0]
  }
  
  // Custom time ranges
  const handleSelectRange = (range: string) => {
    const now = new Date()
    let from: Date
    
    switch (range) {
      case "7d":
        from = subDays(now, 7)
        break
      case "30d":
        from = subDays(now, 30)
        break
      case "3m":
        from = subMonths(now, 3)
        break
      case "6m":
        from = subMonths(now, 6)
        break
      case "1y":
        from = subMonths(now, 12)
        break
      default:
        from = subDays(now, 30)
    }
    
    setDateRange({ from, to: now })
    updateUrlParams(from, now)
  }
  
  // Update URL parameters when dates change
  const updateUrlParams = (from: Date, to: Date) => {
    const params = new URLSearchParams(searchParams)
    params.set("from", from.toISOString().split("T")[0])
    params.set("to", to.toISOString().split("T")[0])
    router.replace(`${pathname}?${params.toString()}`)
  }
  
  const contextValue = {
    dateRange: {
      from: dateRange.from,
      to: dateRange.to || now,
    },
    dateParams
  }
  
  return (
    <AnalyticsDateContext.Provider value={contextValue}>
      <Card className="p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-col space-y-1.5">
            <h2 className="text-xl font-semibold">Filter Analytics Data</h2>
            <p className="text-sm text-muted-foreground">
              Select a date range to filter the dashboard data
            </p>
          </div>
          <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectRange("7d")}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectRange("30d")}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectRange("3m")}
              >
                Last 3 months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectRange("6m")}
              >
                Last 6 months
              </Button>
            </div>
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal w-full md:w-[300px]"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      const newRange = range as { from: Date; to: Date | undefined }
                      setDateRange(newRange)
                      if (newRange?.from && newRange?.to) {
                        updateUrlParams(newRange.from, newRange.to)
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </Card>
    </AnalyticsDateContext.Provider>
  )
}
