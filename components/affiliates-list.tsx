"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react"

export function AffiliatesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // In a real app, this data would come from an API call
  const affiliates = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      promoCode: "JOHN10",
      commissionRate: 10,
      totalEarned: 1250.6,
      pendingAmount: 125.4,
      paymentMethod: "ACH",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      promoCode: "JANE15",
      commissionRate: 15,
      totalEarned: 980.25,
      pendingAmount: 98.0,
      paymentMethod: "USDC",
      status: "active",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      promoCode: "BOB20",
      commissionRate: 20,
      totalEarned: 750.5,
      pendingAmount: 75.0,
      paymentMethod: "ACH",
      status: "active",
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      promoCode: "ALICE5",
      commissionRate: 5,
      totalEarned: 520.75,
      pendingAmount: 52.0,
      paymentMethod: "USDC",
      status: "inactive",
    },
    {
      id: "5",
      name: "Charlie Wilson",
      email: "charlie@example.com",
      promoCode: "CHARLIE",
      commissionRate: 10,
      totalEarned: 320.3,
      pendingAmount: 32.0,
      paymentMethod: "ACH",
      status: "pending",
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

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.promoCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || affiliate.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Search affiliates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Promo Code</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAffiliates.map((affiliate) => (
              <TableRow key={affiliate.id}>
                <TableCell>
                  <div className="font-medium">{affiliate.name}</div>
                  <div className="text-sm text-muted-foreground">{affiliate.email}</div>
                </TableCell>
                <TableCell>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {affiliate.promoCode}
                  </code>
                </TableCell>
                <TableCell>{affiliate.commissionRate}%</TableCell>
                <TableCell>
                  <div className="font-medium">{formatCurrency(affiliate.totalEarned)}</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(affiliate.pendingAmount)} pending</div>
                </TableCell>
                <TableCell>{affiliate.paymentMethod}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(affiliate.status)}>{affiliate.status}</Badge>
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Affiliate</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete Affiliate</span>
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

