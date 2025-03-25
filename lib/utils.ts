import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique promo code
export async function generatePromoCode(AffiliateModel: any) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    // Check if code already exists
    const existingAffiliate = await AffiliateModel.findOne({ promoCode: code })

    if (!existingAffiliate) {
      return code
    }

    attempts++
  }

  // If we couldn't generate a unique code after max attempts, use timestamp
  return `AFF${Date.now().toString().slice(-6)}`
}

// Format currency
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Format date
export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

// Calculate date range for filtering
export function getDateRange(range: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (range) {
    case "today":
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      }
    case "yesterday":
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        startDate: yesterday,
        endDate: today,
      }
    case "thisWeek":
      const thisWeekStart = new Date(today)
      thisWeekStart.setDate(today.getDate() - today.getDay())
      return {
        startDate: thisWeekStart,
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      }
    case "thisMonth":
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return {
        startDate: thisMonthStart,
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      }
    case "lastMonth":
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        startDate: lastMonthStart,
        endDate: lastMonthEnd,
      }
    default:
      return {
        startDate: null,
        endDate: null,
      }
  }
}

