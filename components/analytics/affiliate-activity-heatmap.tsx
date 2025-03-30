"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAnalyticsFilter } from "./analytics-filter-context"

interface HeatmapData {
  day: number;
  hour: number;
  value: number;
}

// Mock data fetching hook - replace with real API call
function useAffiliateActivity() {
  const [data, setData] = useState<HeatmapData[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Generate mock data
        const mockData: HeatmapData[] = []
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            // Create realistic patterns
            let value = 0
            
            // More activity during weekdays
            if (day >= 1 && day <= 5) {
              value += Math.floor(Math.random() * 30) + 10
            } else {
              value += Math.floor(Math.random() * 20)
            }
            
            // More activity during business hours
            if (hour >= 9 && hour <= 17) {
              value += Math.floor(Math.random() * 50) + 20
            } else if ((hour >= 6 && hour < 9) || (hour > 17 && hour <= 21)) {
              value += Math.floor(Math.random() * 30) + 10
            } else {
              value += Math.floor(Math.random() * 15)
            }
            
            mockData.push({ day, hour, value })
          }
        }
        
        setData(mockData)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'))
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  return { data, isLoading, error }
}

export function AffiliateActivityHeatmap() {
  const { data, isLoading, error } = useAffiliateActivity()
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const hours = Array.from({ length: 24 }, (_, i) => 
    i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i-12}pm`
  )
  
  // Helper to get color based on value
  const getColor = (value: number) => {
    // Color gradient from light to dark
    if (value < 10) return "bg-blue-50"
    if (value < 20) return "bg-blue-100"
    if (value < 30) return "bg-blue-200"
    if (value < 40) return "bg-blue-300"
    if (value < 50) return "bg-blue-400"
    if (value < 60) return "bg-blue-500"
    if (value < 70) return "bg-blue-600"
    if (value < 80) return "bg-blue-700"
    if (value < 90) return "bg-blue-800"
    return "bg-blue-900"
  }
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="h-[500px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }
  
  if (error || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Affiliate Activity Heatmap</CardTitle>
          <CardDescription>Error loading activity data</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[500px] items-center justify-center">
          <p className="text-muted-foreground">Failed to load heatmap data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Affiliate Activity Heatmap</CardTitle>
        <CardDescription>
          Visualization of affiliate activity patterns by day and hour
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Hours header */}
            <div className="flex">
              <div className="w-24 shrink-0"></div>
              <div className="flex flex-1">
                {hours.map((hour, i) => (
                  <div key={i} className="flex-1 text-center text-xs text-muted-foreground">
                    {i % 2 === 0 ? hour : ""}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Heatmap grid */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex mt-1">
                <div className="w-24 shrink-0 pr-2 text-sm font-medium">{day}</div>
                <div className="flex flex-1">
                  {hours.map((_, hourIndex) => {
                    const cellData = data.find(d => d.day === dayIndex && d.hour === hourIndex)
                    return (
                      <div 
                        key={hourIndex} 
                        className={`flex-1 aspect-[4/3] m-[1px] relative ${getColor(cellData?.value || 0)}`}
                        title={`${day} ${hours[hourIndex]}: ${cellData?.value || 0} activities`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-gray-700 opacity-70">
                            {cellData?.value}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            
            {/* Legend */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Low</span>
                <div className="flex">
                  {["bg-blue-100", "bg-blue-300", "bg-blue-500", "bg-blue-700", "bg-blue-900"].map((color, i) => (
                    <div key={i} className={`w-6 h-4 ${color}`}></div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">High</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
