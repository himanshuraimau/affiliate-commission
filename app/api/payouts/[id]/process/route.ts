import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const { Payout, Conversion, Affiliate } = getModels()
    const id = params.id
    
    // Get payout
    const payout = await Payout.findById(id)
    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }
    
    // Check if already processed or failed
    if (payout.status === "completed" || payout.status === "failed") {
      return NextResponse.json({ error: `Payout already ${payout.status}` }, { status: 400 })
    }
    
    // In a real app, this would involve calling a payment processing service
    // For this implementation, we'll simulate a successful payout
    
    // Update payout status
    payout.status = "completed"
    payout.processedAt = new Date()
    
    // Add transaction details based on payment method
    if (payout.paymentMethod === "ACH") {
      payout.paymentDetails = {
        transactionId: `ach_${Math.random().toString(36).substring(2, 15)}`
      }
    } else {
      payout.paymentDetails = {
        txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      }
    }
    
    await payout.save()
    
    // Update conversions to paid status
    await Conversion.updateMany(
      { _id: { $in: payout.conversions } },
      { status: "paid", payoutId: payout._id }
    )
    
    // Update affiliate stats
    await Affiliate.findByIdAndUpdate(payout.affiliateId, {
      $inc: {
        totalPaid: payout.amount,
        pendingAmount: -payout.amount
      }
    })

    return NextResponse.json(payout)
  } catch (error) {
    console.error(`Error processing payout: ${error}`)
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 })
  }
}
