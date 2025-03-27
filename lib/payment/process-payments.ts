import { createPaymanService } from "./payman";
import { getModels } from "@/lib/db/models";

export async function processPayment(payoutId: string, apiKey: string) {
  const { Payout, Affiliate, Conversion } = getModels();

  // Get payout
  const payout = await Payout.findById(payoutId);
  if (!payout) {
    throw new Error("Payout not found");
  }

  if (payout.status !== "pending") {
    throw new Error(`Payout is already ${payout.status}`);
  }

  // Get affiliate info
  const affiliate = await Affiliate.findById(payout.affiliateId);
  if (!affiliate) {
    throw new Error("Affiliate not found");
  }

  // Update payout status to processing
  payout.status = "processing";
  await payout.save();

  // Initialize payment service
  const paymanService = createPaymanService(apiKey);

  try {
    // Verify affiliate has the required payment details
    if (!affiliate.paymentDetails?.payeeId) {
      throw new Error("Affiliate does not have a valid payee ID for payments");
    }
    
    if (!affiliate.paymentDetails?.name) {
      console.warn(`Affiliate ${affiliate.name} missing payment name, using default`);
      affiliate.paymentDetails.name = affiliate.name || "Affiliate Payment";
    }
    
    // Process payment through Payman using TEST_RAILS
    const paymentResult = await paymanService.createPayment(
      affiliate,
      payout.amount
    );

    // Update payout with payment details
    payout.paymentDetails = {
      reference: paymentResult.reference,
      externalReference: paymentResult.externalReference,
      memo: `Affiliate payout for ${affiliate.paymentDetails.name || affiliate.name}`,
    };

    // Update status based on payment result
    if (paymentResult.status === "INITIATED") {
      payout.status = "completed";
      payout.processedAt = new Date();

      // Update affiliate payment totals
      affiliate.totalPaid += payout.amount;
      affiliate.pendingAmount -= payout.amount;
      await affiliate.save();

      // Update conversion statuses
      await Conversion.updateMany(
        { _id: { $in: payout.conversions } },
        { $set: { status: "paid", payoutId: payout._id } }
      );
    } else {
      payout.status = "failed";
    }

    await payout.save();
    return payout;
  } catch (error) {
    // Update payout status to failed
    payout.status = "failed";
    await payout.save();
    throw error;
  }
}
