import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { format, parseISO, subDays, eachDayOfInterval, addDays } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
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
    }).sort({ createdAt: 1 })
    
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
      
      return {
        date: dateStr,
        revenue: dayConversions.reduce((sum, conv) => sum + conv.orderAmount, 0),
        commission: dayConversions.reduce((sum, conv) => sum + conv.commissionAmount, 0),
      }
    })

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json(
      { error: "Failed to fetch revenue data" }, 
      { status: 500 }
    )
  }
}
