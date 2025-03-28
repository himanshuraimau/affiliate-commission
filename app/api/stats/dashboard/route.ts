import { type NextRequest } from "next/server"
import { connectDB } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { createSuccessResponse, createErrorResponse, buildDateQuery } from "@/lib/api/utils"
import { DashboardStats } from "@/types"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { Affiliate, Conversion, Payout } = getModels()

    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Build date query for filtered stats
    const dateQuery = buildDateQuery(dateFrom, dateTo);

    // Fetch aggregate data
    const [
      totalAffiliates,
      activeAffiliates,
      allConversions,
      filteredConversions,
      pendingPayouts
    ] = await Promise.all([
      Affiliate.countDocuments(),
      Affiliate.countDocuments({ status: "active" }),
      Conversion.find(),
      Conversion.find(dateQuery),
      Payout.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ])

    // Calculate statistics
    const pendingConversions = filteredConversions.filter(c => c.status === "pending").length
    const totalRevenue = filteredConversions.reduce((sum, c) => sum + c.orderAmount, 0)
    const totalCommissions = filteredConversions.reduce((sum, c) => sum + c.commissionAmount, 0)
    
    // Calculate conversion rate (% of orders that used a promo code)
    const conversionRate = totalRevenue > 0 ? (totalCommissions / totalRevenue) * 100 : 0

    const stats: DashboardStats = {
      totalAffiliates,
      activeAffiliates,
      totalConversions: filteredConversions.length,
      pendingConversions,
      totalRevenue,
      totalCommissions,
      pendingPayouts: pendingPayouts.length > 0 ? pendingPayouts[0].total : 0,
      conversionRate
    }

    return createSuccessResponse(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return createErrorResponse("Failed to fetch dashboard stats");
  }
}
