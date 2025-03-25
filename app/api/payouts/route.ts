import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Payout } = getModels()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Build query based on filters
    const query: any = {}
    
    if (status) {
      query.status = status
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {}
      
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom)
      }
      
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo)
      }
    }

    const payouts = await Payout.find(query).sort({ createdAt: -1 })

    return NextResponse.json(payouts)
  } catch (error) {
    console.error("Error fetching payouts:", error)
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Payout, Conversion, Affiliate } = getModels()

    const { affiliateId, conversionIds } = await request.json()
    
    // Validate required fields
    if (!affiliateId || !conversionIds || !conversionIds.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Get affiliate to determine payment method
    const affiliate = await Affiliate.findById(affiliateId)
    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 })
    }
    
    // Get conversions
    const conversions = await Conversion.find({
      _id: { $in: conversionIds },
      status: "approved",
      affiliateId
    })
    
    if (conversions.length === 0) {
      return NextResponse.json({ error: "No valid conversions found" }, { status: 400 })
    }
    
    // Calculate total payout amount
    const amount = conversions.reduce((sum, conversion) => sum + conversion.commissionAmount, 0)
    
    // Create payout
    const payout = new Payout({
      affiliateId,
      amount,
      conversions: conversions.map(c => c._id),
      paymentMethod: affiliate.paymentMethod,
      status: "pending"
    })
    
    await payout.save()

    return NextResponse.json(payout, { status: 201 })
  } catch (error) {
    console.error("Error creating payout:", error)
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 })
  }
}

