import { AnalyticsDatePicker } from "@/components/analytics/analytics-date-picker"
import { AnalyticsMetricsCards } from "@/components/analytics/analytics-metrics-cards"
import { CommissionBreakdownChart } from "@/components/analytics/commission-breakdown-chart"
import { ConversionRateChart } from "@/components/analytics/conversion-rate-chart"
import { RevenueOverTimeChart } from "@/components/analytics/revenue-over-time-chart"
import { TopAffiliatesChart } from "@/components/analytics/top-affiliates-chart"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-1.5">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your affiliate program performance
        </p>
      </div>
      
      <AnalyticsDatePicker />
      
      <AnalyticsMetricsCards />
      
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
