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
import { MoreHorizontal, Check, X, Eye } from "lucide-react"

export function ConversionsList() {
  // In a real app, this data would come from an API call
  const conversions = [
    {
      id: "1",
      orderId: "ORD-12345",
      affiliateName: "John Doe",
      promoCode: "JOHN10",
      orderAmount: 125.99,
      commissionAmount: 12.6,
      customer: {
        email: "customer1@example.com",
        name: "Customer One",
      },
      status: "approved",
      createdAt: new Date(2023, 5, 15),
    },
    {
      id: "2",
      orderId: "ORD-12346",
      affiliateName: "Jane Smith",
      promoCode: "JANE15",
      orderAmount: 89.99,
      commissionAmount: 9.0,
      customer: {
        email: "customer2@example.com",
        name: "Customer Two",
      },
      status: "pending",
      createdAt: new Date(2023, 5, 16),
    },
    {
      id: "3",
      orderId: "ORD-12347",
      affiliateName: "Bob Johnson",
      promoCode: "BOB20",
      orderAmount: 199.99,
      commissionAmount: 20.0,
      customer: {
        email: "customer3@example.com",
        name: "Customer Three",
      },
      status: "approved",
      createdAt: new Date(2023, 5, 17),
    },
    {
      id: "4",
      orderId: "ORD-12348",
      affiliateName: "Alice Brown",
      promoCode: "ALICE5",
      orderAmount: 49.99,
      commissionAmount: 5.0,
      customer: {
        email: "customer4@example.com",
        name: "Customer Four",
      },
      status: "rejected",
      createdAt: new Date(2023, 5, 18),
    },
    {
      id: "5",
      orderId: "ORD-12349",
      affiliateName: "Charlie Wilson",
      promoCode: "CHARLIE",
      orderAmount: 299.99,
      commissionAmount: 30.0,
      customer: {
        email: "customer5@example.com",
        name: "Customer Five",
      },
      status: "pending",
      createdAt: new Date(2023, 5, 19),
    },
  ]

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

  return (
    <Card>
      <CardContent className="p-6">
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
            {conversions.map((conversion) => (
              <TableRow key={conversion.id}>
                <TableCell className="font-medium">{conversion.orderId}</TableCell>
                <TableCell>
                  <div className="font-medium">{conversion.affiliateName}</div>
                  <div className="text-sm text-muted-foreground">{conversion.promoCode}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{conversion.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{conversion.customer.email}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatCurrency(conversion.orderAmount)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(conversion.commissionAmount)} commission
                  </div>
                </TableCell>
                <TableCell>{formatDate(conversion.createdAt)}</TableCell>
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
                          <DropdownMenuItem>
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            <span>Approve</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
      </CardContent>
    </Card>
  )
}

