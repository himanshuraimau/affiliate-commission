"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function PayoutOverview() {
  // In a real app, this data would come from an API call
  const payouts = [
    {
      id: "1",
      affiliateName: "John Doe",
      amount: 125.4,
      paymentMethod: "ACH",
      status: "completed",
      processedAt: new Date(2023, 5, 10),
    },
    {
      id: "2",
      affiliateName: "Jane Smith",
      amount: 98.0,
      paymentMethod: "USDC",
      status: "pending",
      processedAt: null,
    },
    {
      id: "3",
      affiliateName: "Bob Johnson",
      amount: 75.0,
      paymentMethod: "ACH",
      status: "processing",
      processedAt: new Date(2023, 5, 18),
    },
    {
      id: "4",
      affiliateName: "Alice Brown",
      amount: 52.0,
      paymentMethod: "USDC",
      status: "failed",
      processedAt: new Date(2023, 5, 15),
    },
  ]

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Payouts</CardTitle>
          <CardDescription>Latest affiliate payouts and their status</CardDescription>
        </div>
        <Button>View All Payouts</Button>
      </CardHeader>
      <CardContent>
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
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell className="font-medium">{payout.affiliateName}</TableCell>
                <TableCell>{formatCurrency(payout.amount)}</TableCell>
                <TableCell>{payout.paymentMethod}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payout.status)}>{payout.status}</Badge>
                </TableCell>
                <TableCell>{payout.processedAt ? formatDate(payout.processedAt) : "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

