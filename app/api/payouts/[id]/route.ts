import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const { Payout } = getModels()
    const id = params.id
    
    const payout = await Payout.findById(id)
      .populate("affiliateId")
      .populate("conversions")
    
    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }
    
    return NextResponse.json(payout)
  } catch (error) {
    console.error(`Error fetching payout: ${error}`)
    return NextResponse.json({ error: "Failed to fetch payout" }, { status: 500 })
  }
}
