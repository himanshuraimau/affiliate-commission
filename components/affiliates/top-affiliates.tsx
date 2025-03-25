"use client"

import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAffiliates } from "@/lib/api/hooks"
import { useConversions } from "@/lib/api/hooks"

export function TopAffiliates() {
  // Fetch affiliates and conversion data
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates("active")
  const { data: conversions = [], isLoading: isLoadingConversions } = useConversions()

  // Combine affiliate data with conversion count
  const topAffiliates = affiliates
    .map(affiliate => {
      const affiliateConversions = conversions.filter(
        c => c.affiliateId === affiliate._id && c.status !== "rejected"
      )
      
      return {
        ...affiliate,
        conversionCount: affiliateConversions.length
      }
    })
    // Sort by total earned descending
    .sort((a, b) => b.totalEarned - a.totalEarned)
    // Take top 5
    .slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "inactive":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const isLoading = isLoadingAffiliates || isLoadingConversions
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Affiliates</CardTitle>
        <CardDescription>Your best performing affiliate partners</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : topAffiliates.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground">No active affiliates found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topAffiliates.map((affiliate) => (
                <TableRow key={affiliate._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{affiliate.name}</span>
                      <span className="text-xs text-muted-foreground">{affiliate.promoCode}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatCurrency(affiliate.totalEarned)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(affiliate.pendingAmount)} pending
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{affiliate.conversionCount}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(affiliate.status)}>{affiliate.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

