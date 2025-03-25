import { CreatePayoutForm } from "@/components/payout/create-payout-form"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewPayoutPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Payout</h1>
        <Button variant="outline" asChild>
          <Link href="/payouts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payouts
          </Link>
        </Button>
      </div>
      <Separator />
      <CreatePayoutForm />
    </div>
  )
}
