import { AffiliateForm } from "@/components/affiliates/affiliate-form"

export default function NewAffiliatePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Affiliate</h1>
      <AffiliateForm />
    </div>
  )
}
