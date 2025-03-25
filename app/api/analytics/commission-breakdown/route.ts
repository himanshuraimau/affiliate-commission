import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { parseISO, subDays } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Conversion, Affiliate } = getModels()

    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")
    
    // Default to last 30 days if no dates provided
    const now = new Date()
    const from = fromDate ? parseISO(fromDate) : subDays(now, 30)
    const to = toDate ? parseISO(toDate) : now
    
    // Get all conversions and affiliates for the selected period
    const [conversions, affiliates] = await Promise.all([
      Conversion.find({
        createdAt: { $gte: from, $lte: to },
        status: { $in: ["approved", "paid"] }
      }),
      Affiliate.find()
    ])
    
    // Define proper type for commissionsGrouped
    const commissionsGrouped: Record<string, number> = {}
    
    for (const conversion of conversions) {
      // Convert ObjectId to string for safe comparison
      const conversionAffiliateIdStr = conversion.affiliateId.toString();
      const affiliate = affiliates.find(a => (a._id as { toString(): string }).toString() === conversionAffiliateIdStr);
      
      if (!affiliate) continue;
      
      // Create category string for the payment method
      const category = `${affiliate.paymentMethod} Commissions`;
      
      if (!commissionsGrouped[category]) {
        commissionsGrouped[category] = 0;
      }
      
      commissionsGrouped[category] += conversion.commissionAmount;
    }
    
    // Convert to array format needed for pie chart
    const pieData = Object.entries(commissionsGrouped).map(([name, value]) => ({
      name,
      value
    }))
    
    // Additional breakdown by status if needed
    // Define proper type for the accumulator
    const statusBreakdown: Record<string, number> = conversions.reduce((acc: Record<string, number>, conv) => {
      const key = `${conv.status.charAt(0).toUpperCase()}${conv.status.slice(1)}`;
      if (!acc[key]) acc[key] = 0;
      acc[key] += conv.commissionAmount;
      return acc;
    }, {})
    
    // Add status breakdown to pie data if there's meaningful data
    Object.entries(statusBreakdown).forEach(([status, amount]) => {
      if (status !== "Approved" && status !== "Paid") {
        pieData.push({
          name: status,
          value: amount
        })
      }
    })

    return NextResponse.json(pieData)
  } catch (error) {
    console.error("Error fetching commission breakdown:", error)
    return NextResponse.json(
      { error: "Failed to fetch commission breakdown" }, 
      { status: 500 }
    )
  }
}
