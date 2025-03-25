import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { createPaymanService } from "@/lib/payment/payman"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const { Payout, Conversion, Affiliate, Settings } = getModels()
    const id = params.id
    
    // Get payout
    const payout = await Payout.findById(id).populate("affiliateId", "name email paymentMethod paymentDetails")
    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }
    
    // Check if already processed or failed
    if (payout.status === "completed" || payout.status === "failed") {
      return NextResponse.json({ error: `Payout already ${payout.status}` }, { status: 400 })
    }
    
    // Get API keys from settings
    const settings = await Settings.findOne({})
    const paymanApiKey = settings?.apiKeys?.paymanApiKey
    
    if (!paymanApiKey) {
      return NextResponse.json({ error: "Payment API key not configured" }, { status: 400 })
    }
    
    // Update payout status to processing
    payout.status = "processing"
    await payout.save()
    
    try {
      // Process payment with Payman
      const paymanService = createPaymanService(paymanApiKey)
      
      // Update payout status
      payout.status = "completed"
      payout.processedAt = new Date()
      
      // Add transaction details based on payment method
      if (payout.paymentMethod === "ACH") {
        const paymentResult = await paymanService.createACHPayment(payout.affiliateId, payout.amount)
        payout.paymentDetails = {
          transactionId: paymentResult.transactionId
        }
      } else {
        const paymentResult = await paymanService.createUSDCPayment(payout.affiliateId, payout.amount)
        payout.paymentDetails = {
          txHash: paymentResult.txHash
        }
      }
      
      await payout.save()
      
      // Update conversions to paid status
      await Conversion.updateMany(
        { _id: { $in: payout.conversions } },
        { status: "paid", payoutId: payout._id }
      )
      
      // Update affiliate stats
      await Affiliate.findByIdAndUpdate(payout.affiliateId._id, {
        $inc: {
          totalPaid: payout.amount,
          pendingAmount: -payout.amount
        }
      })
  
      return NextResponse.json(payout)
    } catch (error: unknown) {
      // Mark payout as failed
      payout.status = "failed"
      await payout.save()
      
      console.error(`Payment processing error:`, error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      return NextResponse.json({ 
        error: "Payment processing failed", 
        details: errorMessage 
      }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error(`Error processing payout:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Failed to process payout: ${errorMessage}` }, { status: 500 })
  }
}
