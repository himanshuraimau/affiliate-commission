import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentConversions } from "@/components/conversions/recent-conversions"
import { TopAffiliates } from "@/components/affiliates/top-affiliates"
import { PayoutOverview } from "@/components/payout/payout-overview"

export default async function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />
      <DashboardCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentConversions />
        <TopAffiliates />
      </div>
      <PayoutOverview />
    </div>
  )
}

