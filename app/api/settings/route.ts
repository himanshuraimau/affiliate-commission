import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import { getModels } from "@/lib/db/models"

export async function GET() {
  try {
    await connectToDatabase()
    const { Settings } = getModels()

    // Get or create settings
    let settings = await Settings.findOne({})

    if (!settings) {
      settings = await Settings.create({
        payoutSettings: {
          minimumPayoutAmount: 50,
          payoutFrequency: "monthly",
          payoutDay: 1,
          automaticPayouts: true,
        },
        commissionDefaults: {
          defaultRate: 10,
          minimumOrderAmount: 0,
        },
      })
    }

    // Don't return API keys in the response
    const response = { ...settings.toObject() }
    if (response.apiKeys) {
      // Replace actual keys with boolean indicating if they exist
      Object.keys(response.apiKeys).forEach((key) => {
        if (response.apiKeys[key]) {
          response.apiKeys[key] = true
        }
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    const { Settings } = getModels()

    const data = await request.json()

    // Get or create settings
    let settings = await Settings.findOne({})

    if (!settings) {
      settings = new Settings({})
    }

    // Update settings with new data
    if (data.payoutSettings) {
      settings.payoutSettings = {
        ...settings.payoutSettings,
        ...data.payoutSettings,
      }
    }

    if (data.commissionDefaults) {
      settings.commissionDefaults = {
        ...settings.commissionDefaults,
        ...data.commissionDefaults,
      }
    }

    if (data.apiKeys) {
      settings.apiKeys = {
        ...settings.apiKeys,
        ...data.apiKeys,
      }
    }

    await settings.save()

    // Don't return API keys in the response
    const response = { ...settings.toObject() }
    if (response.apiKeys) {
      // Replace actual keys with boolean indicating if they exist
      Object.keys(response.apiKeys).forEach((key) => {
        if (response.apiKeys[key]) {
          response.apiKeys[key] = true
        }
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

