import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"
import { generatePromoCode } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Affiliate } = getModels()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const query = status ? { status } : {}

    const affiliates = await Affiliate.find(query).sort({ createdAt: -1 })

    return NextResponse.json(affiliates)
  } catch (error) {
    console.error("Error fetching affiliates:", error)
    return NextResponse.json({ error: "Failed to fetch affiliates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Affiliate, Settings } = getModels()

    const data = await request.json()

    // Get default commission rate from settings
    const settings = await Settings.findOne({})
    const defaultRate = settings?.commissionDefaults?.defaultRate || 10

    // Generate unique promo code if not provided
    if (!data.promoCode) {
      data.promoCode = await generatePromoCode(Affiliate)
    }

    // Set default commission rate if not provided
    if (!data.commissionRate) {
      data.commissionRate = defaultRate
    }

    const affiliate = new Affiliate(data)
    await affiliate.save()

    return NextResponse.json(affiliate, { status: 201 })
  } catch (error) {
    console.error("Error creating affiliate:", error)
    return NextResponse.json({ error: "Failed to create affiliate" }, { status: 500 })
  }
}

