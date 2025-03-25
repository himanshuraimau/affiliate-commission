import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

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
        { error: `Payout is already ${payout.status}` },\
        { status  {
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
      // Process payment based on payment method
      let paymentResult

      if (payout.paymentMethod === "ACH") {
        // Call Payman API for ACH payment
        paymentResult = await processAchPayment(paymanApiKey, payout.affiliateId, payout.amount)
      } else if (payout.paymentMethod === "USDC") {
        // Call Payman API for USDC payment
        paymentResult = await processUsdcPayment(paymanApiKey, payout.affiliateId, payout.amount)
      }

      // Update payout with transaction details
      payout.paymentDetails = {
        transactionId: paymentResult.transactionId,
        txHash: paymentResult.txHash,
      }
      payout.status = "completed"
      payout.processedAt = new Date()
      await payout.save()

      return NextResponse.json({
        message: "Payout processed successfully",
        payout,
      })
    } catch (error) {
      // Mark payout as failed
      payout.status = "failed"
      await payout.save()

      console.error("Payment processing error:", error)
      return NextResponse.json({ error: "Payment processing failed", details: error.message }, { status: 500 })
    }
  } catch (error) 
    console.error("Error processing payout:", error)
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 })
}

// Mock functions for payment processing
async function processAchPayment(apiKey: string, affiliate: any, amount: number) {
  // In a real implementation, this would call the Payman API
  console.log(`Processing ACH payment of $${amount} to ${affiliate.name}`)

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock transaction details
  return {
    transactionId: `ach_${Date.now()}`,
    status: "completed",
  }
}

async function processUsdcPayment(apiKey: string, affiliate: any, amount: number) {
  // In a real implementation, this would call the Payman API
  console.log(`Processing USDC payment of $${amount} to ${affiliate.name}`)

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock transaction details
  return {
    txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
    status: "completed",
  }
}

