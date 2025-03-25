import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { createPaymanService } from "@/lib/payment/payman"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Payout, Settings } = getModels()

    const data = await request.json()
    const { payoutId } = data

    // Find payout
    const payout = await Payout.findById(payoutId).populate("affiliateId", "name email paymentMethod paymentDetails")

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }

    if (payout.status !== "pending") {
      return NextResponse.json(
        { error: `Payout is already ${payout.status}` },
        { status: 400 }
      )
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
      const paymanService = createPaymanService(paymanApiKey)

      if (payout.paymentMethod === "ACH") {
        // Call Payman API for ACH payment
        const paymentResult = await paymanService.createACHPayment(payout.affiliateId, payout.amount)
        payout.paymentDetails = {
          transactionId: paymentResult.transactionId
        }
      } else if (payout.paymentMethod === "USDC") {
        // Call Payman API for USDC payment
        const paymentResult = await paymanService.createUSDCPayment(payout.affiliateId, payout.amount)
        payout.paymentDetails = {
          txHash: paymentResult.txHash
        }
      }

      payout.status = "completed"
      payout.processedAt = new Date()
      await payout.save()

      return NextResponse.json({
        message: "Payout processed successfully",
        payout,
      })
    } catch (error: unknown) {
      // Mark payout as failed
      payout.status = "failed"
      await payout.save()

      console.error("Payment processing error:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      return NextResponse.json({ 
        error: "Payment processing failed", 
        details: errorMessage 
      }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error("Error processing payout:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Failed to process payout: ${errorMessage}` }, { status: 500 })
  }
}

