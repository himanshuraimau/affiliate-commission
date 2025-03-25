import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Conversion } = getModels()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const affiliateId = searchParams.get("affiliateId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build query based on search params
    const query: any = {}

    if (status) query.status = status
    if (affiliateId) query.affiliateId = affiliateId

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const conversions = await Conversion.find(query)
      .sort({ createdAt: -1 })
      .populate("affiliateId", "name email promoCode")

    return NextResponse.json(conversions)
  } catch (error) {
    console.error("Error fetching conversions:", error)
    return NextResponse.json({ error: "Failed to fetch conversions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Conversion, Affiliate } = getModels()

    const data = await request.json()
    const { promoCode, orderId, orderAmount, customer } = data

    // Find affiliate by promo code
    const affiliate = await Affiliate.findOne({ promoCode })

    if (!affiliate) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 400 })
    }

    // Check if order already exists
    const existingOrder = await Conversion.findOne({ orderId })

    if (existingOrder) {
      return NextResponse.json({ error: "Order already processed" }, { status: 400 })
    }

    // Calculate commission amount
    const commissionAmount = (orderAmount * affiliate.commissionRate) / 100

    // Create conversion record
    const conversion = new Conversion({
      affiliateId: affiliate._id,
      orderId,
      orderAmount,
      commissionAmount,
      promoCode,
      customer,
      status: "pending",
    })

    await conversion.save()

    // Update affiliate pending amount
    await Affiliate.findByIdAndUpdate(affiliate._id, {
      $inc: { pendingAmount: commissionAmount },
    })

    return NextResponse.json(conversion, { status: 201 })
  } catch (error) {
    console.error("Error creating conversion:", error)
    return NextResponse.json({ error: "Failed to create conversion" }, { status: 500 })
  }
}

