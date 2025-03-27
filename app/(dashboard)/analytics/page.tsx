import { CommissionBreakdownChart } from "@/components/analytics/commission-breakdown-chart"
import { ConversionRateChart } from "@/components/analytics/conversion-rate-chart"
import { RevenueOverTimeChart } from "@/components/analytics/revenue-over-time-chart"
import { TopAffiliatesChart } from "@/components/analytics/top-affiliates-chart"
import { AnalyticsFilter } from "@/components/analytics/analytics-filter"
import { AnalyticsFilterProvider } from "@/components/analytics/analytics-filter-context"

export default function AnalyticsPage() {
  return (
   
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        
    
        
        <div className="grid gap-6 md:grid-cols-2">
          <RevenueOverTimeChart />
          <ConversionRateChart />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <TopAffiliatesChart />
          <CommissionBreakdownChart />
        </div>
      </div>
   
  )
}
