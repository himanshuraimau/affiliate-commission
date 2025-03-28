import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { connect } from "http2"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { Conversion } = getModels()

    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    
    // Build date range query
    const dateQuery: any = {}
    if (from) {
      dateQuery.$gte = new Date(from)
    }
    if (to) {
      const endDate = new Date(to)
      endDate.setDate(endDate.getDate() + 1) // Include the end date
      dateQuery.$lte = endDate
    }
    
    // Only include date filter if at least one parameter is present
    const query: any = {}
    if (Object.keys(dateQuery).length > 0) {
      query.createdAt = dateQuery
    }
    
    // We only want approved or paid conversions for revenue charts
    query.status = { $in: ["approved", "paid"] }
    
    // Aggregate revenue data by day
    const revenueByDay = await Conversion.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          date: { $first: "$createdAt" },
          totalOrderAmount: { $sum: "$orderAmount" },
          totalCommission: { $sum: "$commissionAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { date: 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date"
            }
          },
          orderAmount: "$totalOrderAmount",
          commissionAmount: "$totalCommission",
          count: 1
        }
      }
    ])

    return NextResponse.json(revenueByDay)
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}
