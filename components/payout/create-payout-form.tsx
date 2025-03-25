"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DollarSign, Check, ChevronsUpDown, CheckSquare } from "lucide-react"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" 
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useAffiliates, useConversions, useCreatePayout } from "@/lib/api/hooks"
import { formatCurrency, formatDate } from "@/lib/utils"

// Define form validation schema
const formSchema = z.object({
  affiliateId: z.string().min(1, { message: "Please select an affiliate" }),
  conversionIds: z.array(z.string()).min(1, { message: "Please select at least one conversion" }),
})

export function CreatePayoutForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  
  // Query hooks
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates()
  const [selectedAffiliateId, setSelectedAffiliateId] = useState("")
  
  // Get conversions for selected affiliate
  const { data: conversions = [], isLoading: isLoadingConversions } = useConversions({
    status: "approved",
    affiliateId: selectedAffiliateId,
  })
  
  const createPayout = useCreatePayout()
  
  // Set up form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      affiliateId: "",
      conversionIds: [],
    },
  })
  
  const watchAffiliateId = form.watch("affiliateId")
  const watchConversionIds = form.watch("conversionIds")
  
  // Calculate payout amount based on selected conversions
  const selectedConversions = conversions.filter(
    (conversion) => watchConversionIds.includes(conversion._id)
  )
  
  const payoutAmount = selectedConversions.reduce(
    (total, conversion) => total + conversion.commissionAmount,
    0
  )
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createPayout.mutateAsync({
        affiliateId: values.affiliateId,
        conversionIds: values.conversionIds,
      })
      
      toast({
        title: "Success",
        description: "Payout created successfully",
      })
      
      router.push("/payouts")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }
  
  // Handle affiliate selection
  const handleAffiliateSelect = (value: string) => {
    form.setValue("affiliateId", value)
    setSelectedAffiliateId(value)
    form.setValue("conversionIds", [])
  }

  // Handle selecting all conversions
  const handleSelectAllConversions = (checked: boolean) => {
    if (checked) {
      const allConversionIds = conversions.map(conversion => conversion._id)
      form.setValue("conversionIds", allConversionIds)
    } else {
      form.setValue("conversionIds", [])
    }
  }

  // Handle batch selection by amount range
  const [minAmount, setMinAmount] = useState(0)
  const [maxAmount, setMaxAmount] = useState(10000)
  
  const handleSelectByAmount = () => {
    const filteredConversions = conversions.filter(
      conv => conv.commissionAmount >= minAmount && conv.commissionAmount <= maxAmount
    )
    const ids = filteredConversions.map(conv => conv._id)
    form.setValue("conversionIds", ids)
  }
  
  // Handle batch selection by date range
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  
  const handleSelectByDate = () => {
    if (!startDate && !endDate) return
    
    const filteredConversions = conversions.filter(conv => {
      const convDate = new Date(conv.createdAt)
      
      if (startDate && endDate) {
        return convDate >= new Date(startDate) && convDate <= new Date(endDate)
      } else if (startDate) {
        return convDate >= new Date(startDate)
      } else if (endDate) {
        return convDate <= new Date(endDate)
      }
      
      return true
    })
    
    const ids = filteredConversions.map(conv => conv._id)
    form.setValue("conversionIds", ids)
  }
  
  // Get affiliates with approved conversions for quick selection
  const affiliatesWithApprovedConversions = affiliates.filter(a => a.pendingAmount > 0)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Payout</CardTitle>
        <CardDescription>
          Select an affiliate and conversions to create a payout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="affiliateId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Affiliate</FormLabel>
                  <Tabs defaultValue="single">
                    <TabsList className="mb-4">
                      <TabsTrigger value="single">Single Affiliate</TabsTrigger>
                      <TabsTrigger value="quick">Quick Selection</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="single">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? affiliates.find((affiliate) => affiliate._id === field.value)?.name ||
                                  "Select affiliate"
                                : "Select affiliate"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search affiliates..." />
                            <CommandEmpty>No affiliate found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-72">
                                {affiliates.map((affiliate) => (
                                  <CommandItem
                                    key={affiliate._id}
                                    value={affiliate._id}
                                    onSelect={() => {
                                      handleAffiliateSelect(affiliate._id)
                                      setOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        affiliate._id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{affiliate.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {affiliate.email}
                                      </span>
                                    </div>
                                    <div className="ml-auto text-xs">
                                      Pending: {formatCurrency(affiliate.pendingAmount)}
                                    </div>
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </TabsContent>
                    
                    <TabsContent value="quick">
                      <div className="space-y-4">
                        <div className="text-sm font-medium mb-2">
                          Affiliates with pending payouts
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {affiliatesWithApprovedConversions.length === 0 ? (
                            <div className="col-span-2 text-center p-4 border rounded-md">
                              <p className="text-muted-foreground">No affiliates with pending payouts found</p>
                            </div>
                          ) : (
                            affiliatesWithApprovedConversions.map(affiliate => (
                              <Card key={affiliate._id} className={cn(
                                "cursor-pointer transition-colors",
                                affiliate._id === field.value ? "border-primary" : "hover:bg-muted/50"
                              )} onClick={() => handleAffiliateSelect(affiliate._id)}>
                                <CardContent className="p-4 flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{affiliate.name}</div>
                                    <div className="text-xs text-muted-foreground">{affiliate.email}</div>
                                  </div>
                                  <div className="text-sm font-semibold">
                                    {formatCurrency(affiliate.pendingAmount)}
                                    {affiliate._id === field.value && (
                                      <Check className="text-primary ml-2 inline h-4 w-4" />
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <FormDescription>
                    Select the affiliate to create a payout for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchAffiliateId && (
              <FormField
                control={form.control}
                name="conversionIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Conversions</FormLabel>
                      <FormDescription>
                        Select the conversions to include in this payout
                      </FormDescription>
                    </div>
                    
                    {isLoadingConversions ? (
                      <div>Loading conversions...</div>
                    ) : conversions.length === 0 ? (
                      <div className="text-center p-4 border rounded-md">
                        <p className="text-muted-foreground">No approved conversions found for this affiliate</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Tabs defaultValue="individual">
                          <TabsList>
                            <TabsTrigger value="individual">Individual Selection</TabsTrigger>
                            <TabsTrigger value="batch">Batch Selection</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="individual">
                            <div className="flex items-center justify-between mb-4 mt-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="select-all" 
                                  checked={watchConversionIds.length === conversions.length}
                                  onCheckedChange={handleSelectAllConversions}
                                />
                                <label
                                  htmlFor="select-all"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Select All ({conversions.length})
                                </label>
                              </div>
                              {watchConversionIds.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  {watchConversionIds.length} of {conversions.length} selected
                                </div>
                              )}
                            </div>
                            <div className="border rounded-md">
                              {conversions.map((conversion) => (
                                <FormField
                                  key={conversion._id}
                                  control={form.control}
                                  name="conversionIds"
                                  render={({ field }) => {
                                    return (
                                      <>
                                        <FormItem
                                          key={conversion._id}
                                          className="flex flex-row items-start space-x-3 space-y-0 p-4"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(conversion._id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, conversion._id])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== conversion._id
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <div className="flex-1 space-y-1 leading-none">
                                            <div className="font-medium">Order #{conversion.orderId}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {formatDate(new Date(conversion.createdAt))}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-medium">
                                              {formatCurrency(conversion.commissionAmount)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {formatCurrency(conversion.orderAmount)} order
                                            </div>
                                          </div>
                                        </FormItem>
                                        <Separator />
                                      </>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="batch">
                            <div className="space-y-6 py-4">
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Select by Amount Range</h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">Min: $</span>
                                    <input 
                                      type="number" 
                                      value={minAmount}
                                      onChange={(e) => setMinAmount(Number(e.target.value))}
                                      className="w-20 rounded-md border border-input px-3 py-1 text-sm" 
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">Max: $</span>
                                    <input 
                                      type="number" 
                                      value={maxAmount}
                                      onChange={(e) => setMaxAmount(Number(e.target.value))}
                                      className="w-20 rounded-md border border-input px-3 py-1 text-sm" 
                                    />
                                  </div>
                                  <Button type="button" variant="outline" size="sm" onClick={handleSelectByAmount}>
                                    Apply
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Select by Date Range</h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">From:</span>
                                    <input 
                                      type="date" 
                                      value={startDate}
                                      onChange={(e) => setStartDate(e.target.value)}
                                      className="rounded-md border border-input px-3 py-1 text-sm" 
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">To:</span>
                                    <input 
                                      type="date" 
                                      value={endDate}
                                      onChange={(e) => setEndDate(e.target.value)}
                                      className="rounded-md border border-input px-3 py-1 text-sm" 
                                    />
                                  </div>
                                  <Button type="button" variant="outline" size="sm" onClick={handleSelectByDate}>
                                    Apply
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
                                <div className="flex gap-2">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => handleSelectAllConversions(true)}
                                  >
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    Select All ({conversions.length})
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => handleSelectAllConversions(false)}
                                  >
                                    Clear Selection
                                  </Button>
                                </div>
                              </div>

                              {watchConversionIds.length > 0 && (
                                <Alert>
                                  <AlertDescription>
                                    Selected {watchConversionIds.length} conversions worth {formatCurrency(payoutAmount)}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <FormMessage />
                      </div>
                    )}
                  </FormItem>
                )}
              />
            )}
            
            {watchConversionIds.length > 0 && (
              <div className="bg-primary-foreground p-4 rounded-md flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Total payout amount</h3>
                </div>
                <div className="text-xl font-bold">{formatCurrency(payoutAmount)}</div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/payouts")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createPayout.isPending ||
                  isLoadingAffiliates ||
                  isLoadingConversions ||
                  watchConversionIds.length === 0
                }
              >
                {createPayout.isPending ? "Creating..." : "Create Payout"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
