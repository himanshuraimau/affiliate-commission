import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { getModels } from '@/lib/db/models';
import { createSuccessResponse, createErrorResponse, buildDateQuery } from '@/lib/api/utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { Affiliate, Conversion, Payout } = getModels();
    
    // Get query params for date filtering
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    
    // Build date query for filtered results
    const dateQuery = buildDateQuery(dateFrom, dateTo);
    console.log("Date query for dashboard stats:", dateQuery);
    
    // Run queries in parallel
    const [
      totalAffiliates,
      activeAffiliates,
      conversions,
      totalRevenue,
      totalCommissions,
      pendingPayouts
    ] = await Promise.all([
      // Total affiliates count
      Affiliate.countDocuments(),
      
      // Active affiliates count
      Affiliate.countDocuments({ status: "active" }),
      
      // All conversions with status
      Conversion.find(dateQuery),
      
      // Total revenue (sum of order amounts)
      Conversion.aggregate([
        { $match: { ...dateQuery, status: { $in: ["approved", "paid"] } } },
        { $group: { _id: null, total: { $sum: "$orderAmount" } } }
      ]),
      
      // Total commissions (sum of commission amounts)
      Conversion.aggregate([
        { $match: { ...dateQuery, status: { $in: ["approved", "paid"] } } },
        { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
      ]),
      
      // Pending payouts (sum of pending amounts across affiliates)
      Affiliate.aggregate([
        { $match: { pendingAmount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: "$pendingAmount" } } }
      ])
    ]);
    
    // Process conversion data
    const pendingConversions = conversions.filter(c => c.status === "pending").length;
    const approvedConversions = conversions.filter(c => c.status === "approved" || c.status === "paid").length;
    
    // Calculate conversion rate
    const conversionRate = approvedConversions > 0 && conversions.length > 0
      ? (approvedConversions / conversions.length) * 100
      : 0;
    
    // Extract totals from aggregation results
    const extractTotal = (result: Array<{ total: number }> | undefined) => 
      result && result.length > 0 ? result[0].total : 0;
    
    const stats = {
      totalAffiliates,
      activeAffiliates,
      totalConversions: conversions.length,
      pendingConversions,
      totalRevenue: extractTotal(totalRevenue),
      totalCommissions: extractTotal(totalCommissions),
      pendingPayouts: extractTotal(pendingPayouts),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
    
    console.log("Dashboard stats calculated:", stats);
    return createSuccessResponse(stats);
  } catch (error: any) {
    console.error("Error in dashboard stats API:", error);
    return createErrorResponse(error.message || "Failed to fetch dashboard stats", 500);
  }
}
