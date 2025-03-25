"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useConversions, useAffiliates } from "@/lib/api/hooks"

export function RecentConversions() {
  // Fetch recent conversions and affiliates data
  const { data: conversions = [], isLoading: isLoadingConversions } = useConversions()
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates()
  
  // Get only the 5 most recent conversions
  const recentConversions = [...conversions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(conversion => {
      const affiliate = affiliates.find(a => a._id === conversion.affiliateId)
      return {
        ...conversion,
        affiliateName: affiliate?.name || 'Unknown'
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      case "paid":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const isLoading = isLoadingConversions || isLoadingAffiliates

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Conversions</CardTitle>
        <CardDescription>Latest affiliate conversions and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recentConversions.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground">No conversions found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Affiliate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentConversions.map((conversion) => (
                <TableRow key={conversion._id}>
                  <TableCell className="font-medium">{conversion.orderId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{conversion.affiliateName}</span>
                      <span className="text-xs text-muted-foreground">{conversion.promoCode}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatCurrency(conversion.orderAmount)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(conversion.commissionAmount)} commission
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(conversion.status)}>{conversion.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(new Date(conversion.createdAt))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

