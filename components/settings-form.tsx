"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings, useUpdateSettings } from "@/lib/api/hooks"

const payoutSettingsSchema = z.object({
  minimumPayoutAmount: z.coerce.number().min(1, {
    message: "Minimum payout amount must be at least $1",
  }),
  payoutFrequency: z.enum(["daily", "weekly", "monthly"]),
  payoutDay: z.coerce.number().optional(),
  automaticPayouts: z.boolean().default(true),
})

const commissionSettingsSchema = z.object({
  defaultRate: z.coerce.number().min(1).max(100, {
    message: "Default commission rate must be between 1% and 100%",
  }),
  minimumOrderAmount: z.coerce.number().min(0, {
    message: "Minimum order amount must be at least $0",
  }),
})

const apiKeysSchema = z.object({
  paymanApiKey: z.string().optional(),
})

export function SettingsForm() {
  const [activeTab, setActiveTab] = useState("payout")
  
  // Fetch settings from API
  const { data: settings, isLoading } = useSettings()
  
  // Update settings mutation
  const updateSettings = useUpdateSettings()

  const payoutForm = useForm<z.infer<typeof payoutSettingsSchema>>({
    resolver: zodResolver(payoutSettingsSchema),
    defaultValues: {
      minimumPayoutAmount: 50,
      payoutFrequency: "monthly",
      payoutDay: 1,
      automaticPayouts: true,
    },
  })

  const commissionForm = useForm<z.infer<typeof commissionSettingsSchema>>({
    resolver: zodResolver(commissionSettingsSchema),
    defaultValues: {
      defaultRate: 10,
      minimumOrderAmount: 0,
    },
  })

  const apiKeysForm = useForm<z.infer<typeof apiKeysSchema>>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: {
      paymanApiKey: "",
    },
  })

  // Update the forms when settings load
  useEffect(() => {
    if (settings) {
      payoutForm.reset({
        minimumPayoutAmount: settings.payoutSettings.minimumPayoutAmount,
        payoutFrequency: settings.payoutSettings.payoutFrequency,
        payoutDay: settings.payoutSettings.payoutDay || 1,
        automaticPayouts: settings.payoutSettings.automaticPayouts,
      })
      
      commissionForm.reset({
        defaultRate: settings.commissionDefaults.defaultRate,
        minimumOrderAmount: settings.commissionDefaults.minimumOrderAmount,
      })
      
      apiKeysForm.reset({
        paymanApiKey: settings.apiKeys.paymanApiKey || "",
      })
    }
  }, [settings, payoutForm, commissionForm, apiKeysForm])

  async function onPayoutSubmit(values: z.infer<typeof payoutSettingsSchema>) {
    try {
      await updateSettings.mutateAsync({
        payoutSettings: values
      })
      toast.success("Payout settings updated successfully")
    } catch (error) {
      toast.error("Failed to update payout settings")
    }
  }

  async function onCommissionSubmit(values: z.infer<typeof commissionSettingsSchema>) {
    try {
      await updateSettings.mutateAsync({
        commissionDefaults: values
      })
      toast.success("Commission settings updated successfully")
    } catch (error) {
      toast.error("Failed to update commission settings")
    }
  }

  async function onApiKeysSubmit(values: z.infer<typeof apiKeysSchema>) {
    try {
      await updateSettings.mutateAsync({
        apiKeys: values
      })
      toast.success("API keys updated successfully")
    } catch (error) {
      toast.error("Failed to update API keys")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Tabs defaultValue="payout" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="payout">Payout Settings</TabsTrigger>
        <TabsTrigger value="commission">Commission Settings</TabsTrigger>
        <TabsTrigger value="api">API Keys</TabsTrigger>
      </TabsList>

      <TabsContent value="payout">
        <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
            <CardDescription>Configure how and when affiliate payouts are processed</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...payoutForm}>
              <form onSubmit={payoutForm.handleSubmit(onPayoutSubmit)} className="space-y-8">
                <FormField
                  control={payoutForm.control}
                  name="minimumPayoutAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Payout Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Affiliates must earn at least this amount to receive a payout</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={payoutForm.control}
                  name="payoutFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payout Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>How often payouts are processed</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {payoutForm.watch("payoutFrequency") === "weekly" && (
                  <FormField
                    control={payoutForm.control}
                    name="payoutDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Day of the week when payouts are processed</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {payoutForm.watch("payoutFrequency") === "monthly" && (
                  <FormField
                    control={payoutForm.control}
                    name="payoutDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Month</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={31} {...field} />
                        </FormControl>
                        <FormDescription>Day of the month when payouts are processed (1-31)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={payoutForm.control}
                  name="automaticPayouts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Automatic Payouts</FormLabel>
                        <FormDescription>Process payouts automatically based on the schedule</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? "Saving..." : "Save Payout Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="commission">
        <Card>
          <CardHeader>
            <CardTitle>Commission Settings</CardTitle>
            <CardDescription>Configure default commission rates and rules</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...commissionForm}>
              <form onSubmit={commissionForm.handleSubmit(onCommissionSubmit)} className="space-y-8">
                <FormField
                  control={commissionForm.control}
                  name="defaultRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Default commission percentage for new affiliates</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={commissionForm.control}
                  name="minimumOrderAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Minimum order amount required to earn commission</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Save Commission Settings</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="api">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys for payment processing and other integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...apiKeysForm}>
              <form onSubmit={apiKeysForm.handleSubmit(onApiKeysSubmit)} className="space-y-8">
                <FormField
                  control={apiKeysForm.control}
                  name="paymanApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payman API Key</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>API key for Payman payment processing</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Save API Keys</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

