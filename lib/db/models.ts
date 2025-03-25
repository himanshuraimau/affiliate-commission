// MongoDB schema definitions using mongoose

import mongoose, { Schema, type Document, type Model } from "mongoose"

// Affiliate Schema
export interface IAffiliateDocument extends Document {
  name: string
  email: string
  phone?: string
  promoCode: string
  commissionRate: number
  paymentMethod: "ACH" | "USDC"
  paymentDetails: {
    achAccount?: {
      accountNumber: string
      routingNumber: string
      accountName: string
    }
    usdcWallet?: string
  }
  status: "active" | "inactive" | "pending"
  totalEarned: number
  totalPaid: number
  pendingAmount: number
  createdAt: Date
  updatedAt: Date
}

const AffiliateSchema = new Schema<IAffiliateDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    promoCode: { type: String, required: true, unique: true },
    commissionRate: { type: Number, required: true, default: 10 }, // Percentage
    paymentMethod: { type: String, enum: ["ACH", "USDC"], required: true },
    paymentDetails: {
      achAccount: {
        accountNumber: { type: String },
        routingNumber: { type: String },
        accountName: { type: String },
      },
      usdcWallet: { type: String },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    totalEarned: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Conversion Schema
export interface IConversionDocument extends Document {
  affiliateId: mongoose.Types.ObjectId
  orderId: string
  orderAmount: number
  commissionAmount: number
  promoCode: string
  customer: {
    email: string
    name?: string
  }
  status: "pending" | "approved" | "rejected" | "paid"
  payoutId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ConversionSchema = new Schema<IConversionDocument>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    orderId: { type: String, required: true, unique: true },
    orderAmount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    promoCode: { type: String, required: true },
    customer: {
      email: { type: String, required: true },
      name: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
    payoutId: { type: Schema.Types.ObjectId, ref: "Payout" },
  },
  { timestamps: true },
)

// Payout Schema
export interface IPayoutDocument extends Document {
  affiliateId: mongoose.Types.ObjectId
  amount: number
  conversions: mongoose.Types.ObjectId[]
  paymentMethod: "ACH" | "USDC"
  paymentDetails: {
    transactionId?: string
    txHash?: string
  }
  status: "pending" | "processing" | "completed" | "failed"
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PayoutSchema = new Schema<IPayoutDocument>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    amount: { type: Number, required: true },
    conversions: [{ type: Schema.Types.ObjectId, ref: "Conversion" }],
    paymentMethod: { type: String, enum: ["ACH", "USDC"], required: true },
    paymentDetails: {
      transactionId: { type: String },
      txHash: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processedAt: { type: Date },
  },
  { timestamps: true },
)

// Settings Schema
export interface ISettingsDocument extends Document {
  payoutSettings: {
    minimumPayoutAmount: number
    payoutFrequency: "daily" | "weekly" | "monthly"
    payoutDay?: number // Day of week (0-6) or day of month (1-31)
    automaticPayouts: boolean
  }
  apiKeys: {
    paymanApiKey?: string
    otherApiKeys?: Record<string, string>
  }
  commissionDefaults: {
    defaultRate: number
    minimumOrderAmount: number
  }
  updatedAt: Date
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    payoutSettings: {
      minimumPayoutAmount: { type: Number, default: 50 },
      payoutFrequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "monthly",
      },
      payoutDay: { type: Number },
      automaticPayouts: { type: Boolean, default: true },
    },
    apiKeys: {
      paymanApiKey: { type: String },
      otherApiKeys: { type: Map, of: String },
    },
    commissionDefaults: {
      defaultRate: { type: Number, default: 10 },
      minimumOrderAmount: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
)

// Initialize models
export function getModels() {
  // Check if models are already defined to prevent recompilation in development
  const Affiliate =
    (mongoose.models.Affiliate as Model<IAffiliateDocument>) ||
    mongoose.model<IAffiliateDocument>("Affiliate", AffiliateSchema)

  const Conversion =
    (mongoose.models.Conversion as Model<IConversionDocument>) ||
    mongoose.model<IConversionDocument>("Conversion", ConversionSchema)

  const Payout =
    (mongoose.models.Payout as Model<IPayoutDocument>) || mongoose.model<IPayoutDocument>("Payout", PayoutSchema)

  const Settings =
    (mongoose.models.Settings as Model<ISettingsDocument>) ||
    mongoose.model<ISettingsDocument>("Settings", SettingsSchema)

  return { Affiliate, Conversion, Payout, Settings }
}

