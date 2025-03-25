import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const { Conversion, Affiliate } = getModels()
    const id = params.id
    
    const { status } = await request.json()
    
    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    
    // Get current conversion
    const conversion = await Conversion.findById(id)
    if (!conversion) {
      return NextResponse.json({ error: "Conversion not found" }, { status: 404 })
    }
    
    const previousStatus = conversion.status
    
    // Update conversion status
    conversion.status = status
    await conversion.save()
    
    // Update affiliate stats based on status change
    const affiliate = await Affiliate.findById(conversion.affiliateId)
    
    if (previousStatus !== "approved" && status === "approved") {
      // Newly approved conversion - increment earnings
      await Affiliate.findByIdAndUpdate(conversion.affiliateId, {
        $inc: {
          totalEarned: conversion.commissionAmount,
          pendingAmount: conversion.commissionAmount
        }
      })
    } else if (previousStatus === "approved" && status !== "approved") {
      // Approved conversion changed to non-approved - decrement earnings
      await Affiliate.findByIdAndUpdate(conversion.affiliateId, {
        $inc: {
          totalEarned: -conversion.commissionAmount,
          pendingAmount: -conversion.commissionAmount
        }
      })
    }

    return NextResponse.json(conversion)
  } catch (error) {
    console.error(`Error updating conversion status: ${error}`)
    return NextResponse.json({ error: "Failed to update conversion status" }, { status: 500 })
  }
}
