"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAffiliates } from "@/lib/api/hooks"

const conversionFormSchema = z.object({
  affiliateId: z.string({
    required_error: "Please select an affiliate",
  }),
  orderId: z.string().min(1, {
    message: "Order ID is required",
  }),
  orderAmount: z.coerce.number().min(0.01, {
    message: "Order amount must be greater than 0",
  }),
  commissionAmount: z.coerce.number().optional(),
  customerEmail: z.string().email({
    message: "Please enter a valid customer email",
  }),
  customerName: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "paid"], {
    required_error: "Please select a status",
  }),
})

type ConversionFormValues = z.infer<typeof conversionFormSchema>

export function ConversionForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates()

  const form = useForm<ConversionFormValues>({
    resolver: zodResolver(conversionFormSchema),
    defaultValues: {
      affiliateId: "",
      orderId: "",
      orderAmount: 0,
      commissionAmount: undefined,
      customerEmail: "",
      customerName: "",
      status: "pending",
    },
  })

  const watchAffiliateId = form.watch("affiliateId")
  const watchOrderAmount = form.watch("orderAmount")

  // Calculate commission amount based on affiliate's rate
  const selectedAffiliate = affiliates.find(a => a._id === watchAffiliateId)
  const calculatedCommission = selectedAffiliate && watchOrderAmount 
    ? (watchOrderAmount * selectedAffiliate.commissionRate / 100) 
    : 0

  async function onSubmit(values: ConversionFormValues) {
    setIsSubmitting(true)
    try {
      // Find the affiliate's promo code
      const affiliate = affiliates.find(a => a._id === values.affiliateId)
      if (!affiliate) {
        throw new Error("Selected affiliate not found")
      }

      // Prepare the data for API
      const conversionData = {
        affiliateId: values.affiliateId,
        orderId: values.orderId,
        orderAmount: values.orderAmount,
        commissionAmount: values.commissionAmount || calculatedCommission,
        promoCode: affiliate.promoCode,
        customer: {
          email: values.customerEmail,
          name: values.customerName,
        },
        status: values.status,
      }

      const response = await fetch("/api/conversions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create conversion")
      }

      toast.success("Conversion created successfully!")
      router.push("/conversions")
      router.refresh()
    } catch (error) {
      console.error("Error creating conversion:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create conversion")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Conversion</CardTitle>
        <CardDescription>
          Record a new conversion for an affiliate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="affiliateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliate</FormLabel>
                    <Select
                      disabled={isLoadingAffiliates}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select affiliate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {affiliates.map((affiliate) => (
                          <SelectItem key={affiliate._id} value={affiliate._id}>
                            {affiliate.name} ({affiliate.promoCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ORD-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="orderAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="commissionAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Amount (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder={calculatedCommission.toFixed(2)} 
                        {...field} 
                        value={field.value === undefined ? '' : field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchAffiliateId && watchOrderAmount > 0 
                        ? `Default: ${calculatedCommission.toFixed(2)} (${selectedAffiliate?.commissionRate}%)`
                        : "Will be calculated based on affiliate's commission rate if left empty"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="customer@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Conversion"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
