import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { format, parseISO, subDays, eachDayOfInterval, addDays } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { Conversion } = getModels()

    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")
    
    // Default to last 30 days if no dates provided
    const now = new Date()
    const from = fromDate ? parseISO(fromDate) : subDays(now, 30)
    const to = toDate ? parseISO(toDate) : now
    
    // Get all conversions within the selected period
    const conversions = await Conversion.find({
      createdAt: { $gte: from, $lte: to }
    })
    
    // Generate date range
    const dateRange = eachDayOfInterval({ start: from, end: to })
    
    // Aggregate data by day
    const chartData = dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      const dayStart = new Date(dateStr)
      const dayEnd = addDays(dayStart, 1)
      
      const dayConversions = conversions.filter(
        (conv) => conv.createdAt >= dayStart && conv.createdAt < dayEnd
      )
      
      const total = dayConversions.length
      const approved = dayConversions.filter(
        (conv) => conv.status === "approved" || conv.status === "paid"
      ).length
      
      // Calculate rate, default to 0 if no conversions
      const rate = total > 0 ? (approved / total) * 100 : 0
      
      return {
        date: dateStr,
        rate: parseFloat(rate.toFixed(2)),
        total,
        approved
      }
    })

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching conversion rate data:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversion rate data" }, 
      { status: 500 }
    )
  }
}
