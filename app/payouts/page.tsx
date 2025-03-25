import { PayoutsList } from "@/components/payouts-list"
import { PayoutsFilter } from "@/components/payouts-filter"
import { Button } from "@/components/ui/button"
import { PlayIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"

export default function PayoutsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payouts</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/payouts/settings">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Payout Settings
            </Link>
          </Button>
          <Button>
            <PlayIcon className="mr-2 h-4 w-4" />
            Run Manual Payout
          </Button>
        </div>
      </div>
      <PayoutsFilter />
      <PayoutsList />
    </div>
  )
}

