import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { Conversion } = getModels()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const affiliateId = searchParams.get("affiliateId")

    // Build query based on filters
    const query: any = {}
    
    if (status) {
      query.status = status
    }
    
    if (affiliateId) {
      query.affiliateId = affiliateId
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {}
      
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom)
      }
      
      if (dateTo) {
        // Add one day to include the end date fully
        const endDate = new Date(dateTo)
        endDate.setDate(endDate.getDate() + 1)
        query.createdAt.$lte = endDate
      }
    }

    const conversions = await Conversion.find(query).sort({ createdAt: -1 })

    return NextResponse.json(conversions)
  } catch (error) {
    console.error("Error fetching conversions:", error)
    return NextResponse.json({ error: "Failed to fetch conversions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { Conversion, Affiliate } = getModels()

    const data = await request.json()
    
    // Validate required fields
    if (!data.affiliateId || !data.orderId || !data.orderAmount || !data.promoCode || !data.customer?.email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Check if order already exists to prevent duplicates
    const existingConversion = await Conversion.findOne({ orderId: data.orderId })
    if (existingConversion) {
      return NextResponse.json({ error: "Conversion with this order ID already exists" }, { status: 409 })
    }
    
    // Get affiliate to calculate commission amount if not provided
    if (!data.commissionAmount) {
      const affiliate = await Affiliate.findById(data.affiliateId)
      if (!affiliate) {
        return NextResponse.json({ error: "Affiliate not found" }, { status: 404 })
      }
      
      data.commissionAmount = data.orderAmount * (affiliate.commissionRate / 100)
    }
    
    // Create the conversion
    const conversion = new Conversion(data)
    await conversion.save()
    
    // Update affiliate stats if conversion is already approved
    if (data.status === "approved") {
      await Affiliate.findByIdAndUpdate(data.affiliateId, {
        $inc: {
          totalEarned: data.commissionAmount,
          pendingAmount: data.commissionAmount
        }
      })
    }

    return NextResponse.json(conversion, { status: 201 })
  } catch (error) {
    console.error("Error creating conversion:", error)
    return NextResponse.json({ error: "Failed to create conversion" }, { status: 500 })
  }
}

