import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { Conversion } = getModels()

    const conversion = await Conversion.findById(params.id).populate("affiliateId", "name email promoCode")

    if (!conversion) {
      return NextResponse.json({ error: "Conversion not found" }, { status: 404 })
    }

    return NextResponse.json(conversion)
  } catch (error) {
    console.error("Error fetching conversion:", error)
    return NextResponse.json({ error: "Failed to fetch conversion" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { Conversion, Affiliate } = getModels()

    const data = await request.json()
    const { status } = data

    const conversion = await Conversion.findById(params.id)

    if (!conversion) {
      return NextResponse.json({ error: "Conversion not found" }, { status: 404 })
    }

    const oldStatus = conversion.status

    // Update conversion
    const updatedConversion = await Conversion.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true },
    )

    // Handle affiliate pending amount updates based on status change
    if (oldStatus !== status) {
      const affiliate = await Affiliate.findById(conversion.affiliateId)

      if (affiliate) {
        let update = {}

        if (oldStatus === "pending" && status === "approved") {
          // No change to pending amount, it's still pending until paid
        } else if (oldStatus === "pending" && status === "rejected") {
          // Remove from pending amount
          update = {
            $inc: { pendingAmount: -conversion.commissionAmount },
          }
        } else if (oldStatus === "approved" && status === "rejected") {
          // Remove from pending amount
          update = {
            $inc: { pendingAmount: -conversion.commissionAmount },
          }
        } else if (status === "paid" && (oldStatus === "pending" || oldStatus === "approved")) {
          // Move from pending to paid
          update = {
            $inc: {
              pendingAmount: -conversion.commissionAmount,
              totalPaid: conversion.commissionAmount,
              totalEarned: conversion.commissionAmount,
            },
          }
        }

        if (Object.keys(update).length > 0) {
          await Affiliate.findByIdAndUpdate(affiliate._id, update)
        }
      }
    }

    return NextResponse.json(updatedConversion)
  } catch (error) {
    console.error("Error updating conversion:", error)
    return NextResponse.json({ error: "Failed to update conversion" }, { status: 500 })
  }
}

