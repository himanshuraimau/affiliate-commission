import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { subDays, isAfter, isBefore, parseISO } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Affiliate, Conversion, Payout } = getModels()

    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")
    
    // Default to last 30 days if no dates provided
    const now = new Date()
    const from = fromDate ? parseISO(fromDate) : subDays(now, 30)
    const to = toDate ? parseISO(toDate) : now
    
    // Get previous period dates (same length as selected period)
    const daysDiff = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
    const prevFrom = subDays(from, daysDiff)
    const prevTo = subDays(to, 1)
    
    // Query for current period
    const [currentConversions, activeAffiliates] = await Promise.all([
      Conversion.find({
        createdAt: { $gte: from, $lte: to }
      }),
      Affiliate.countDocuments({
        status: "active"
      })
    ])
    
    // Query for previous period
    const prevConversions = await Conversion.find({
      createdAt: { $gte: prevFrom, $lte: prevTo }
    })
    
    // Calculate metrics for current period
    const totalRevenue = currentConversions.reduce((sum, conv) => sum + conv.orderAmount, 0)
    const totalCommission = currentConversions.reduce((sum, conv) => sum + conv.commissionAmount, 0)
    const approvedConversions = currentConversions.filter(c => c.status === "approved" || c.status === "paid")
    const conversionRate = currentConversions.length > 0 
      ? (approvedConversions.length / currentConversions.length) * 100 
      : 0
    const averageCommission = approvedConversions.length > 0 
      ? totalCommission / approvedConversions.length 
      : 0
    
    // Calculate metrics for previous period
    const prevRevenue = prevConversions.reduce((sum, conv) => sum + conv.orderAmount, 0)
    const prevApprovedConversions = prevConversions.filter(c => c.status === "approved" || c.status === "paid")
    const prevConversionRate = prevConversions.length > 0 
      ? (prevApprovedConversions.length / prevConversions.length) * 100 
      : 0
    const prevAverageCommission = prevApprovedConversions.length > 0 
      ? prevApprovedConversions.reduce((sum, conv) => sum + conv.commissionAmount, 0) / prevApprovedConversions.length 
      : 0
    
    // Calculate growth rates
    const revenueGrowth = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
      : 100
    const conversionRateChange = prevConversionRate > 0 
      ? conversionRate - prevConversionRate 
      : conversionRate
    const averageCommissionChange = prevAverageCommission > 0 
      ? ((averageCommission - prevAverageCommission) / prevAverageCommission) * 100 
      : 100
    
    // Count how many affiliates were active in previous period
    const prevActiveAffiliates = await Affiliate.countDocuments({
      createdAt: { $lte: prevTo },
      status: "active"
    })
    
    const affiliatesGrowth = prevActiveAffiliates > 0 
      ? ((activeAffiliates - prevActiveAffiliates) / prevActiveAffiliates) * 100 
      : 100

    return NextResponse.json({
      totalRevenue,
      revenueGrowth,
      conversionRate,
      conversionRateChange,
      activeAffiliates,
      affiliatesGrowth,
      averageCommission,
      averageCommissionChange,
    })
  } catch (error) {
    console.error("Error fetching analytics overview:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics overview" }, 
      { status: 500 }
    )
  }
}
