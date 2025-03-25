"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function RecentConversions() {
  // In a real app, this data would come from an API call
  const conversions = [
    {
      id: "1",
      orderId: "ORD-12345",
      affiliateName: "John Doe",
      promoCode: "JOHN10",
      orderAmount: 125.99,
      commissionAmount: 12.6,
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
      <CardHeader>
        <CardTitle>Recent Conversions</CardTitle>
        <CardDescription>Latest affiliate conversions and their status</CardDescription>
      </CardHeader>
      <CardContent>
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
            {conversions.map((conversion) => (
              <TableRow key={conversion.id}>
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
                <TableCell>{formatDate(conversion.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

