// MongoDB schema definitions using mongoose

import mongoose, { Schema, Model } from "mongoose"
import { 
  IUserDocument, 
  IAffiliateDocument, 
  IConversionDocument, 
  IPayoutDocument, 
  ISettingsDocument 
} from "@/types/db-models"

// User Schema
const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
)

// Simple password verification without hashing
UserSchema.methods.verifyPassword = function(candidatePassword: string): boolean {
  return this.password === candidatePassword;
};

// Affiliate Schema
const AffiliateSchema = new Schema<IAffiliateDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    promoCode: { type: String, required: true, unique: true },
    commissionRate: { type: Number, required: true, default: 10 }, // Percentage
    paymentMethod: { type: String, enum: ["TEST_RAILS"], required: true, default: "TEST_RAILS" },
    paymentDetails: {
      name: { type: String, required: true },
      payeeId: { type: String },
      contactDetails: {
        email: { type: String },
        phoneNumber: { type: String },
        address: {
          addressLine1: { type: String },
          addressLine2: { type: String },
          addressLine3: { type: String },
          addressLine4: { type: String },
          locality: { type: String },
          region: { type: String },
          postcode: { type: String },
          country: { type: String },
        },
        taxId: { type: String }
      },
      tags: [{ type: String }]
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
const PayoutSchema = new Schema<IPayoutDocument>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    amount: { type: Number, required: true },
    conversions: [{ type: Schema.Types.ObjectId, ref: "Conversion" }],
    paymentMethod: { type: String, enum: ["TEST_RAILS"], required: true, default: "TEST_RAILS" },
    paymentDetails: {
      reference: { type: String },
      externalReference: { type: String },
      memo: { type: String },
      walletId: { type: String },
      metadata: { type: Schema.Types.Mixed }
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
  const User = 
    (mongoose.models.User as Model<IUserDocument>) ||
    mongoose.model<IUserDocument>("User", UserSchema)

  const Affiliate =
    (mongoose.models.Affiliate as Model<IAffiliateDocument>) ||
    mongoose.model<IAffiliateDocument>("Affiliate", AffiliateSchema)

  const Conversion =
    (mongoose.models.Conversion as Model<IConversionDocument>) ||
    mongoose.model<IConversionDocument>("Conversion", ConversionSchema)

  const Payout =
    (mongoose.models.Payout as Model<IPayoutDocument>) || 
    mongoose.model<IPayoutDocument>("Payout", PayoutSchema)

  const Settings =
    (mongoose.models.Settings as Model<ISettingsDocument>) ||
    mongoose.model<ISettingsDocument>("Settings", SettingsSchema)

  return { User, Affiliate, Conversion, Payout, Settings }
}

