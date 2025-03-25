import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCards } from "@/components/dashboard-cards"
import { RecentConversions } from "@/components/recent-conversions"
import { TopAffiliates } from "@/components/top-affiliates"
import { PayoutOverview } from "@/components/payout-overview"

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

