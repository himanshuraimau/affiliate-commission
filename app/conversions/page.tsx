import { ConversionsList } from "@/components/conversions-list"
import { ConversionsFilter } from "@/components/conversions-filter"

export default function ConversionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Conversions</h1>
      </div>
      <ConversionsFilter />
      <ConversionsList />
    </div>
  )
}

