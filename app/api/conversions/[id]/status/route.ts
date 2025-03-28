import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { getModels } from "@/lib/db/models";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing conversion ID or status" },
        { status: 400 }
      );
    }

    await connectDB();
    const { Conversion, Affiliate } = getModels();

    const conversion = await Conversion.findById(id);

    if (!conversion) {
      return NextResponse.json(
        { error: "Conversion not found" },
        { status: 404 }
      );
    }

    const oldStatus = conversion.status;
    conversion.status = status;
    await conversion.save();

    // If status is changing to/from approved, update affiliate stats
    if (oldStatus !== status) {
      const amount = conversion.commissionAmount;
      const affiliate = await Affiliate.findById(conversion.affiliateId);

      if (affiliate) {
        // If changing to approved, add to pending amount
        if (status === "approved" && oldStatus !== "approved") {
          affiliate.totalEarned += amount;
          affiliate.pendingAmount += amount;
          await affiliate.save();
        }
        // If changing from approved, subtract from pending amount
        else if (status !== "approved" && oldStatus === "approved") {
          affiliate.totalEarned -= amount;
          affiliate.pendingAmount -= amount;
          await affiliate.save();
        }
      }
    }

    return NextResponse.json(conversion);
  } catch (error) {
    console.error("Error updating conversion status:", error);
    return NextResponse.json(
      {
        error: "Failed to update conversion status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
