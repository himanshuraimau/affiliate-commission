"use client"

import { useState } from "react"
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
import { Check, X, MoreHorizontal } from "lucide-react"
import { useConversions, useAffiliates, useUpdateConversionStatus } from "@/lib/api/hooks"
import { useConversionsFilter } from "./conversions-filter-context"

export function ConversionsList() {
  const { toast } = useToast()
  const { 
    dateRange, 
    statusFilter, 
    affiliateFilter, 
    searchTerm 
  } = useConversionsFilter()
  
  // Format date for API
  const formatDateParam = (date: Date | undefined) => {
    if (!date) return undefined
    return date.toISOString().split('T')[0]
  }
  
  // Prepare filters for API
  const apiFilters = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    dateFrom: formatDateParam(dateRange.from),
    dateTo: formatDateParam(dateRange.to),
    affiliateId: affiliateFilter !== "all" ? affiliateFilter : undefined
  }
  
  // Get conversions with filters
  const { data: conversions = [], isLoading: isLoadingConversions } = useConversions(apiFilters)
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates()
  
  const updateConversionStatus = useUpdateConversionStatus()

  // Combine conversions data with affiliate info and apply client-side filters
  const enrichedConversions = conversions
    .map(conversion => {
      const affiliate = affiliates.find(a => a._id === conversion.affiliateId)
      return {
        ...conversion,
        affiliateName: affiliate?.name || 'Unknown',
        affiliateEmail: affiliate?.email || 'Unknown'
      }
    })
    // Apply search filter
    .filter(conversion => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      return (
        conversion.orderId.toLowerCase().includes(searchLower) ||
        conversion.customer.email.toLowerCase().includes(searchLower) ||
        (conversion.customer.name && conversion.customer.name.toLowerCase().includes(searchLower))
      )
    })
    // Sort by creation date descending
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateConversionStatus.mutateAsync({ id, status })
      toast({
        title: "Success",
        description: `Conversion ${status}`,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Error",
        description: `Failed to update conversion: ${errorMessage}`,
        variant: "destructive",
      })
    }
  }

  const isLoading = isLoadingConversions || isLoadingAffiliates

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
        {enrichedConversions.length === 0 ? (
          <div className="text-center p-4">
            <h3 className="text-lg font-medium">No conversions found</h3>
            <p className="text-sm text-muted-foreground">
              {conversions.length > 0 ? 
                "No conversions match the current filters" : 
                "Conversions will appear here once they're created"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Affiliate</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedConversions.map((conversion) => (
                <TableRow key={conversion._id}>
                  <TableCell className="font-medium">{conversion.orderId}</TableCell>
                  <TableCell>{conversion.affiliateName}</TableCell>
                  <TableCell>
                    <div>{conversion.customer.name || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{conversion.customer.email}</div>
                  </TableCell>
                  <TableCell>{formatCurrency(conversion.orderAmount)}</TableCell>
                  <TableCell>{formatCurrency(conversion.commissionAmount)}</TableCell>
                  <TableCell>{formatDate(new Date(conversion.createdAt))}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(conversion.status)}>{conversion.status}</Badge>
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
                        {conversion.status === "pending" && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(conversion._id, "approved")}
                              className="text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              <span>Approve</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(conversion._id, "rejected")}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              <span>Reject</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem>
                          <span>View Details</span>
                        </DropdownMenuItem>
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
