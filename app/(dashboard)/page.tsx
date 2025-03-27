import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { TopAffiliates } from "@/components/affiliates/top-affiliates"
import { RecentConversions } from "@/components/conversions/recent-conversions"
import { PayoutOverview } from "@/components/payout/payout-overview"

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <div className="mt-6">
        <DashboardCards />
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <TopAffiliates />
        <RecentConversions />
      </div>
      <div className="mt-8">
        <PayoutOverview />
      </div>
    </>
  )
}
