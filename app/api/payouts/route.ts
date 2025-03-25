import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Payout } = getModels()

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

    const payouts = await Payout.find(query).sort({ createdAt: -1 }).populate("affiliateId", "name email promoCode")

    return NextResponse.json(payouts)
  } catch (error) {
    console.error("Error fetching payouts:", error)
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Payout, Affiliate, Conversion, Settings } = getModels()

    const data = await request.json()
    const { affiliateId, manualPayout } = data

    // Get settings for minimum payout amount
    const settings = await Settings.findOne({})
    const minimumPayoutAmount = settings?.payoutSettings?.minimumPayoutAmount || 50

    // Find affiliate
    const affiliate = await Affiliate.findById(affiliateId)

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 })
    }

    // Check if pending amount meets minimum threshold
    if (affiliate.pendingAmount < minimumPayoutAmount && !manualPayout) {
      return NextResponse.json(
        {
          error: `Pending amount (${affiliate.pendingAmount}) is below minimum payout threshold (${minimumPayoutAmount})`,
        },
        { status: 400 },
      )
    }

    // Find all approved conversions for this affiliate
    const conversions = await Conversion.find({
      affiliateId: affiliate._id,
      status: "approved",
    })

    if (conversions.length === 0) {
      return NextResponse.json({ error: "No approved conversions to pay out" }, { status: 400 })
    }

    // Calculate total amount to pay
    const amount = conversions.reduce((sum, conversion) => sum + conversion.commissionAmount, 0)

    // Create payout record
    const payout = new Payout({
      affiliateId: affiliate._id,
      amount,
      conversions: conversions.map((c) => c._id),
      paymentMethod: affiliate.paymentMethod,
      status: "pending",
    })

    await payout.save()

    // Update conversions to mark them as included in this payout
    await Conversion.updateMany(
      { _id: { $in: conversions.map((c) => c._id) } },
      { $set: { status: "paid", payoutId: payout._id } },
    )

    // Update affiliate pending amount
    await Affiliate.findByIdAndUpdate(affiliate._id, {
      $inc: {
        pendingAmount: -amount,
        totalPaid: amount,
      },
    })

    return NextResponse.json(payout, { status: 201 })
  } catch (error) {
    console.error("Error creating payout:", error)
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 })
  }
}

