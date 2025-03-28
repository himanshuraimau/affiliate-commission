import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { parseISO, subDays } from "date-fns"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { Affiliate, Conversion } = getModels()

    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    
    // Default to last 30 days if no dates provided
    const now = new Date()
    const from = fromDate ? parseISO(fromDate) : subDays(now, 30)
    const to = toDate ? parseISO(toDate) : now
    
    // First get all active affiliates
    const affiliates = await Affiliate.find({ status: "active" }).lean()
    
    // Get conversions for the selected period
    const conversions = await Conversion.find({
      createdAt: { $gte: from, $lte: to },
      status: { $in: ["approved", "paid"] }
    })
    
    // Calculate revenue by affiliate
    const affiliateStats = affiliates.map(affiliate => {
      // Convert ObjectId to string for safe comparison
      const affiliateIdStr = (affiliate._id as mongoose.Types.ObjectId).toString();
      
      const affiliateConversions = conversions.filter(
        conv => conv.affiliateId.toString() === affiliateIdStr
      )
      
      const revenue = affiliateConversions.reduce(
        (sum, conv) => sum + conv.orderAmount, 0
      )
      
      const commissionsEarned = affiliateConversions.reduce(
        (sum, conv) => sum + conv.commissionAmount, 0
      )
      
      return {
        id: affiliateIdStr,
        name: affiliate.name,
        revenue,
        commissionsEarned,
        conversionCount: affiliateConversions.length
      }
    })
    
    // Sort by revenue and take top N
    const topAffiliates = affiliateStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return NextResponse.json(topAffiliates)
  } catch (error) {
    console.error("Error fetching top affiliates:", error)
    return NextResponse.json(
      { error: "Failed to fetch top affiliates" }, 
      { status: 500 }
    )
  }
}
