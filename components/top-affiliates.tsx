"use client"

import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function TopAffiliates() {
  // In a real app, this data would come from an API call
  const affiliates = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      promoCode: "JOHN10",
      totalEarned: 1250.6,
      pendingAmount: 125.4,
      conversionCount: 45,
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      promoCode: "JANE15",
      totalEarned: 980.25,
      pendingAmount: 98.0,
      conversionCount: 32,
      status: "active",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      promoCode: "BOB20",
      totalEarned: 750.5,
      pendingAmount: 75.0,
      conversionCount: 28,
      status: "active",
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      promoCode: "ALICE5",
      totalEarned: 520.75,
      pendingAmount: 52.0,
      conversionCount: 18,
      status: "inactive",
    },
    {
      id: "5",
      name: "Charlie Wilson",
      email: "charlie@example.com",
      promoCode: "CHARLIE",
      totalEarned: 320.3,
      pendingAmount: 32.0,
      conversionCount: 12,
      status: "active",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "inactive":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Affiliates</CardTitle>
        <CardDescription>Your best performing affiliate partners</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Affiliate</TableHead>
              <TableHead>Earned</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.map((affiliate) => (
              <TableRow key={affiliate.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{affiliate.name}</span>
                    <span className="text-xs text-muted-foreground">{affiliate.promoCode}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatCurrency(affiliate.totalEarned)}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(affiliate.pendingAmount)} pending
                    </span>
                  </div>
                </TableCell>
                <TableCell>{affiliate.conversionCount}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(affiliate.status)}>{affiliate.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

