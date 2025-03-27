"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Play, Eye, AlertCircle } from "lucide-react"
import { usePayouts, useAffiliates, useProcessPayout } from "@/lib/api/hooks"
import { usePayoutsFilter } from "./payouts-filter-context"

export function PayoutsList() {
  const { toast } = useToast()
  const { dateRange, statusFilter, paymentMethodFilter } = usePayoutsFilter()
  
  // Format date for API
  const formatDateParam = (date: Date | undefined) => {
    if (!date) return undefined
    return date.toISOString().split('T')[0]
  }
  
  // Prepare filters for API
  const apiFilters = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    dateFrom: formatDateParam(dateRange.from),
    dateTo: formatDateParam(dateRange.to)
  }
  
  // Get payouts and affiliates with filters
  const { data: payouts = [], isLoading: isLoadingPayouts } = usePayouts(apiFilters)
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates()
  
  // Get mutation function for processing payouts
  const processPayout = useProcessPayout()

  // Combine payouts data with affiliate info and apply client-side filters
  const enrichedPayouts = payouts
    .map(payout => {
      const affiliate = affiliates.find(a => a._id === payout.affiliateId)
      return {
        ...payout,
        affiliateName: affiliate?.name || 'Unknown',
        affiliateEmail: affiliate?.email || 'Unknown'
      }
    })
    // Apply payment method filter client-side if needed
    .filter(payout => paymentMethodFilter === "all" || payout.paymentMethod === paymentMethodFilter)
    // Sort by creation date descending
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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

  const handleProcessPayout = async (id: string) => {
    try {
      await processPayout.mutateAsync(id)
      toast({
        title: "Success",
        description: "Payout processed successfully",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Error",
        description: `Failed to process payout: ${errorMessage}`,
        variant: "destructive",
      })
    }
  }

  const isLoading = isLoadingPayouts || isLoadingAffiliates

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {enrichedPayouts.length === 0 ? (
          <div className="text-center p-4">
            <h3 className="text-lg font-medium">No payouts found</h3>
            <p className="text-sm text-muted-foreground">
              {payouts.length > 0 ? 
                "No payouts match the current filters" : 
                "Payouts will appear here once they're created"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedPayouts.map((payout) => (
                <TableRow key={payout._id}>
                  <TableCell>
                    <div className="font-medium">{payout.affiliateName}</div>
                    <div className="text-sm text-muted-foreground">{payout.affiliateEmail}</div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                  <TableCell>{payout.paymentMethod}</TableCell>
                  <TableCell>{formatDate(new Date(payout.createdAt))}</TableCell>
                  <TableCell>
                    {payout.processedAt ? formatDate(new Date(payout.processedAt)) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payout.status)}>{payout.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        {payout.status === "pending" && (
                          <DropdownMenuItem onClick={() => handleProcessPayout(payout._id)}>
                            <Play className="mr-2 h-4 w-4 text-green-500" />
                            <span>Process Payout</span>
                          </DropdownMenuItem>
                        )}
                        {payout.status === "failed" && (
                          <DropdownMenuItem onClick={() => handleProcessPayout(payout._id)}>
                            <Play className="mr-2 h-4 w-4 text-green-500" />
                            <span>Retry Payout</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {payout.status === "failed" && (
                          <DropdownMenuItem>
                            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                            <span>View Error Details</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

