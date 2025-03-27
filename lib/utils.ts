import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generatePromoCode(Affiliate: any): Promise<string> {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like O, 0, I, 1
  const codeLength = 7;
  let isUnique = false;
  let promoCode = '';
  
  // Keep generating until we get a unique code
  while (!isUnique) {
    promoCode = '';
    // Generate random code
    for (let i = 0; i < codeLength; i++) {
      promoCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check if code is unique
    const existingAffiliate = await Affiliate.findOne({ promoCode });
    if (!existingAffiliate) {
      isUnique = true;
    }
  }
  
  return promoCode;
}

// Format currency
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
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

