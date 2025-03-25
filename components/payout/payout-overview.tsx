"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePayouts, useAffiliates } from "@/lib/api/hooks"
import Link from "next/link"

export function PayoutOverview() {
  // Fetch payouts and affiliates data
  const { data: payouts = [], isLoading: isLoadingPayouts } = usePayouts()
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates()
  
  // Get only the 4 most recent payouts
  const recentPayouts = [...payouts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map(payout => {
      const affiliate = affiliates.find(a => a._id === payout.affiliateId)
      return {
        ...payout,
        affiliateName: affiliate?.name || 'Unknown'
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "processing":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "failed":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }
  
  const isLoading = isLoadingPayouts || isLoadingAffiliates

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Payouts</CardTitle>
          <CardDescription>Latest affiliate payouts and their status</CardDescription>
        </div>
        <Button asChild>
          <Link href="/payouts">View All Payouts</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recentPayouts.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground">No payouts found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayouts.map((payout) => (
                <TableRow key={payout._id}>
                  <TableCell className="font-medium">{payout.affiliateName}</TableCell>
                  <TableCell>{formatCurrency(payout.amount)}</TableCell>
                  <TableCell>{payout.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payout.status)}>{payout.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {payout.processedAt 
                      ? formatDate(new Date(payout.processedAt)) 
                      : formatDate(new Date(payout.createdAt))}
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

