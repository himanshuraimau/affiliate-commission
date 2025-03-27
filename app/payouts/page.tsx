"use client"

import { useState } from "react"
import { PayoutsList } from "@/components/payout/payouts-list"
import { PayoutsFilter } from "@/components/payout/payouts-filter"
import { PayoutsFilterProvider } from "@/components/payout/payouts-filter-context"
import { useAffiliates } from "@/lib/api/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function PayoutsPage() {
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates()
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  // Filter affiliates with pending amount
  const affiliatesWithPending = affiliates.filter(affiliate => affiliate.pendingAmount > 0)
  
  const initiatePayment = async (affiliateId: string) => {
    setProcessingId(affiliateId)
    
    try {
      const response = await fetch("/api/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ affiliateId }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Payment failed")
      }
      
      toast({
        title: "Payment successful",
        description: `Payment for ${result.payout.amount} has been processed.`,
      })
      
      // Refresh the affiliates data
      window.location.reload()
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: error.message || "An error occurred while processing the payment",
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <PayoutsFilterProvider>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payouts</h1>
          <div className="w-64">
           
          </div>
        </div>
        
        {/* Pending Payments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliates with Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAffiliates ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : affiliatesWithPending.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No affiliates with pending payments found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Promo Code</TableHead>
                    <TableHead>Pending Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliatesWithPending.map((affiliate) => (
                    <TableRow key={affiliate._id}>
                      <TableCell className="font-medium">{affiliate.name}</TableCell>
                      <TableCell>{affiliate.email}</TableCell>
                      <TableCell>{affiliate.promoCode}</TableCell>
                      <TableCell>{formatCurrency(affiliate.pendingAmount)}</TableCell>
                      <TableCell>{affiliate.paymentMethod}</TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => initiatePayment(affiliate._id)}
                          disabled={processingId === affiliate._id}
                          size="sm"
                        >
                          {processingId === affiliate._id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Pay Now'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <h2 className="text-xl font-semibold mt-4">Payment History</h2>
        <PayoutsFilter />
        <PayoutsList />
      </div>
    </PayoutsFilterProvider>
  )
}

