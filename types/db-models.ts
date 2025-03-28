import mongoose, { Document } from "mongoose";

// User Schema Interface
export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  verifyPassword(password: string): boolean;
}

// Affiliate Schema Interface
export interface IAffiliateDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  promoCode: string;
  commissionRate: number;
  paymentMethod: "TEST_RAILS";
  paymentDetails: {
    name: string;
    payeeId?: string;
    contactDetails?: {
      email?: string;
      phoneNumber?: string;
      address?: {
        addressLine1?: string;
        addressLine2?: string;
        addressLine3?: string;
        addressLine4?: string;
        locality?: string;
        region?: string;
        postcode?: string;
        country?: string;
      };
      taxId?: string;
    };
    tags?: string[];
  };
  status: "active" | "inactive" | "pending";
  totalEarned: number;
  totalPaid: number;
  pendingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Conversion Schema Interface
export interface IConversionDocument extends Document {
  affiliateId: mongoose.Types.ObjectId;
  orderId: string;
  orderAmount: number;
  commissionAmount: number;
  promoCode: string;
  customer: {
    email: string;
    name?: string;
  };
  status: "pending" | "approved" | "rejected" | "paid";
  payoutId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Payout Schema Interface
export interface IPayoutDocument extends Document {
  affiliateId: mongoose.Types.ObjectId;
  amount: number;
  conversions: mongoose.Types.ObjectId[];
  paymentMethod: "TEST_RAILS";
  paymentDetails: {
    reference?: string;
    externalReference?: string;
    memo?: string;
    walletId?: string;
    metadata?: Record<string, any>;
  };
  status: "pending" | "processing" | "completed" | "failed";
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Settings Schema Interface
export interface ISettingsDocument extends Document {
  payoutSettings: {
    minimumPayoutAmount: number;
    payoutFrequency: "daily" | "weekly" | "monthly";
    payoutDay?: number; // Day of week (0-6) or day of month (1-31)
    automaticPayouts: boolean;
  };
  apiKeys: {
    paymanApiKey?: string;
    otherApiKeys?: Record<string, string>;
  };
  commissionDefaults: {
    defaultRate: number;
    minimumOrderAmount: number;
  };
  updatedAt: Date;
}
