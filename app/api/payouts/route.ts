import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db/models";
import { connectDB } from "@/lib/db/connect";
import { createPaymanClient } from "@/lib/payment/payman-client";

// Known working payee ID for fallback
const WORKING_PAYEE_ID = "pd-1f00acb2-fba4-6983-b0fd-d7b9ea207569";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { Affiliate, Settings, Payout, Conversion } = getModels();
    
    // Get request data
    const data = await request.json();
    const { affiliateId } = data;
    
    if (!affiliateId) {
      return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 });
    }
    
    // Get affiliate info
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }
    
    // Validate payment details
    if (!affiliate.paymentDetails?.payeeId) {
      return NextResponse.json({ 
        error: "Missing payment details", 
        details: "The affiliate does not have a valid payee ID configured."
      }, { status: 400 });
    }
    
    // Get settings for API key
    const settings = await Settings.findOne();
    if (!settings?.apiKeys?.paymanApiKey) {
      return NextResponse.json({ error: "Payman API key not configured" }, { status: 500 });
    }
    
    // Get approved conversions for this affiliate
    const conversions = await Conversion.find({
      affiliateId: affiliate._id,
      status: "approved"
    });
    
    const conversionIds = conversions.map(conv => conv._id);
    
    // Create a new payout record
    const payout = await Payout.create({
      affiliateId: affiliate._id,
      amount: affiliate.pendingAmount,
      conversions: conversionIds,
      paymentMethod: "TEST_RAILS",
      status: "pending"
    });
    
    // Create Payman client with API key
    const paymanClient = createPaymanClient(settings.apiKeys.paymanApiKey);
    
    try {
      // Make the payment request to Payman API using our client
      const paymentResult = await paymanClient.sendPayment({
        name: "TESTING-AGAIN",
        amountDecimal: affiliate.pendingAmount,
        payeeId: affiliate.paymentDetails.payeeId,
        memo: `Payment for affiliate: ${affiliate.name}`
      });
      
      // Update payout with payment details
      payout.paymentDetails = {
        reference: paymentResult.reference,
        externalReference: paymentResult.externalReference,
      };
      payout.status = "completed";
      payout.processedAt = new Date();
      await payout.save();
      
      // Update conversions status to paid
      await Conversion.updateMany(
        { _id: { $in: conversionIds } },
        { $set: { status: "paid", payoutId: payout._id } }
      );
      
      // Update affiliate totals
      affiliate.totalPaid += affiliate.pendingAmount;
      affiliate.pendingAmount = 0;
      await affiliate.save();
      
      return NextResponse.json({ 
        success: true, 
        payout: payout,
        payment: paymentResult 
      });
    } catch (error: any) {
      // Update payout status to failed if payment fails
      payout.status = "failed";
      payout.paymentDetails = {
        memo: error.message
      };
      await payout.save();
      
      console.error("Payment processing error:", error);
      return NextResponse.json({ 
        error: "Payment failed", 
        details: error.message,
        payoutId: payout._id
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { Payout, Affiliate } = getModels();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // Build query
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }
    
    // Fetch payouts
    const payouts = await Payout.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(payouts);
    
  } catch (error: any) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
