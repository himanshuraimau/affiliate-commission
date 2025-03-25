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
import { MoreHorizontal, Check, X, Eye } from "lucide-react"
import { useConversions, useAffiliates, useUpdateConversionStatus } from "@/lib/api/hooks"

export function ConversionsList() {
  const { toast } = useToast()
  
  // Get conversions and affiliates
  const { data: conversions = [], isLoading: isLoadingConversions } = useConversions()
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates()
  
  // Get mutation function for updating conversion status
  const updateConversionStatus = useUpdateConversionStatus()

  // Combine conversion data with affiliate names
  const enrichedConversions = conversions.map(conversion => {
    const affiliate = affiliates.find(a => a._id === conversion.affiliateId)
    return {
      ...conversion,
      affiliateName: affiliate?.name || 'Unknown',
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

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateConversionStatus.mutateAsync({ id, status })
      toast({
        title: "Success",
        description: `Conversion ${status === "approved" ? "approved" : "rejected"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update conversion status: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  if (isLoadingConversions || isLoadingAffiliates) {
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
              Conversions will appear here once they're created
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
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedConversions.map((conversion) => (
                <TableRow key={conversion._id}>
                  <TableCell className="font-medium">{conversion.orderId}</TableCell>
                  <TableCell>
                    <div className="font-medium">{conversion.affiliateName}</div>
                    <div className="text-sm text-muted-foreground">{conversion.promoCode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{conversion.customer.name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{conversion.customer.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(conversion.orderAmount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(conversion.commissionAmount)} commission
                    </div>
                  </TableCell>
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        {conversion.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(conversion._id, "approved")}>
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span>Approve</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(conversion._id, "rejected")}>
                              <X className="mr-2 h-4 w-4 text-red-500" />
                              <span>Reject</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={conversion.status !== "pending"}>
                          <span>Edit Details</span>
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

