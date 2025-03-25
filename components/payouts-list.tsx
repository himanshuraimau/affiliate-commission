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
import { MoreHorizontal, Play, Eye, AlertCircle } from "lucide-react"

export function PayoutsList() {
  // In a real app, this data would come from an API call
  const payouts = [
    {
      id: "1",
      affiliateName: "John Doe",
      affiliateEmail: "john@example.com",
      amount: 125.4,
      paymentMethod: "ACH",
      paymentDetails: {
        transactionId: "ach_123456789",
      },
      status: "completed",
      processedAt: new Date(2023, 5, 10),
      createdAt: new Date(2023, 5, 9),
    },
    {
      id: "2",
      affiliateName: "Jane Smith",
      affiliateEmail: "jane@example.com",
      amount: 98.0,
      paymentMethod: "USDC",
      paymentDetails: {},
      status: "pending",
      processedAt: null,
      createdAt: new Date(2023, 5, 17),
    },
    {
      id: "3",
      affiliateName: "Bob Johnson",
      affiliateEmail: "bob@example.com",
      amount: 75.0,
      paymentMethod: "ACH",
      paymentDetails: {
        transactionId: "ach_987654321",
      },
      status: "processing",
      processedAt: new Date(2023, 5, 18),
      createdAt: new Date(2023, 5, 18),
    },
    {
      id: "4",
      affiliateName: "Alice Brown",
      affiliateEmail: "alice@example.com",
      amount: 52.0,
      paymentMethod: "USDC",
      paymentDetails: {
        txHash: "0x1234567890abcdef",
      },
      status: "failed",
      processedAt: new Date(2023, 5, 15),
      createdAt: new Date(2023, 5, 15),
    },
    {
      id: "5",
      affiliateName: "Charlie Wilson",
      affiliateEmail: "charlie@example.com",
      amount: 32.0,
      paymentMethod: "ACH",
      paymentDetails: {},
      status: "pending",
      processedAt: null,
      createdAt: new Date(2023, 5, 19),
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
      <CardContent className="p-6">
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
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell>
                  <div className="font-medium">{payout.affiliateName}</div>
                  <div className="text-sm text-muted-foreground">{payout.affiliateEmail}</div>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                <TableCell>{payout.paymentMethod}</TableCell>
                <TableCell>{formatDate(payout.createdAt)}</TableCell>
                <TableCell>{payout.processedAt ? formatDate(payout.processedAt) : "N/A"}</TableCell>
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
                        <DropdownMenuItem>
                          <Play className="mr-2 h-4 w-4 text-green-500" />
                          <span>Process Payout</span>
                        </DropdownMenuItem>
                      )}
                      {payout.status === "failed" && (
                        <DropdownMenuItem>
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
      </CardContent>
    </Card>
  )
}

