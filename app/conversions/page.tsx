import { ConversionsList } from "@/components/conversion/conversions-list"
import { ConversionsFilter } from "@/components/conversion/conversions-filter"
import { ConversionsFilterProvider } from "@/components/conversion/conversions-filter-context"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"

export default function ConversionsPage() {
  return (
    <ConversionsFilterProvider>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Conversions</h1>
          <Button asChild>
            <Link href="/conversions/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Conversion
            </Link>
          </Button>
        </div>
        
        <ConversionsFilter />
        <ConversionsList />
      </div>
    </ConversionsFilterProvider>
  )
}

