import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { Affiliate } = getModels()

    const affiliate = await Affiliate.findById(params.id)

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 })
    }

    return NextResponse.json(affiliate)
  } catch (error) {
    console.error("Error fetching affiliate:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { Affiliate } = getModels()

    const data = await request.json()

    const affiliate = await Affiliate.findByIdAndUpdate(params.id, { $set: data }, { new: true, runValidators: true })

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 })
    }

    return NextResponse.json(affiliate)
  } catch (error) {
    console.error("Error updating affiliate:", error)
    return NextResponse.json({ error: "Failed to update affiliate" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { Affiliate, Conversion } = getModels()

    // Check if affiliate has conversions
    const conversionCount = await Conversion.countDocuments({
      affiliateId: params.id,
    })

    if (conversionCount > 0) {
      // Instead of deleting, mark as inactive
      const affiliate = await Affiliate.findByIdAndUpdate(params.id, { $set: { status: "inactive" } }, { new: true })

      return NextResponse.json({
        message: "Affiliate marked as inactive (has existing conversions)",
        affiliate,
      })
    }

    // If no conversions, can safely delete
    const affiliate = await Affiliate.findByIdAndDelete(params.id)

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Affiliate deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting affiliate:", error)
    return NextResponse.json({ error: "Failed to delete affiliate" }, { status: 500 })
  }
}

