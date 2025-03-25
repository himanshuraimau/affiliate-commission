import { AffiliatesList } from "@/components/affiliates/affiliates-list"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"

export default function AffiliatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Affiliates</h1>
        <Button asChild>
          <Link href="/affiliates/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Affiliate
          </Link>
        </Button>
      </div>
      <AffiliatesList />
    </div>
  )
}

