import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function GET() {
  try {
    await connectToDatabase()
    const { Settings } = getModels()

    // Get settings - always return the first document
    let settings = await Settings.findOne({})
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        payoutSettings: {
          minimumPayoutAmount: 50,
          payoutFrequency: "monthly",
          payoutDay: 1,
          automaticPayouts: true,
        },
        apiKeys: {},
        commissionDefaults: {
          defaultRate: 10,
          minimumOrderAmount: 0,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Settings } = getModels()
    
    const data = await request.json()
    
    // Get existing settings
    let settings = await Settings.findOne({})
    
    // Create if doesn't exist
    if (!settings) {
      settings = new Settings({})
    }
    
    // Update with new data
    if (data.payoutSettings) {
      Object.assign(settings.payoutSettings, data.payoutSettings)
    }
    
    if (data.apiKeys) {
      Object.assign(settings.apiKeys, data.apiKeys)
    }
    
    if (data.commissionDefaults) {
      Object.assign(settings.commissionDefaults, data.commissionDefaults)
    }
    
    await settings.save()

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

