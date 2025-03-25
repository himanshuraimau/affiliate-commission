import { PayoutsList } from "@/components/payout/payouts-list"
import { PayoutsFilter } from "@/components/payout/payouts-filter"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"

export default function PayoutsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payouts</h1>
        <Button asChild>
          <Link href="/payouts/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Payout
          </Link>
        </Button>
      </div>
      
      <PayoutsFilter />
      <PayoutsList />
    </div>
  )
}

