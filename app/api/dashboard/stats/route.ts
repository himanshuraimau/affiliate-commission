import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Example response for dashboard stats
    const stats = {
      totalAffiliates: 120,
      totalConversions: 450,
      totalRevenue: 15000,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
