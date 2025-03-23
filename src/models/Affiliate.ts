import mongoose, { Document } from "mongoose";

export interface IAffiliateDocument extends Document {
  name: string;
  email: string;
  promoCode: string;
  commissionRate: number;
  payoutFrequency: "daily" | "monthly";
}

const AffiliateSchema = new mongoose.Schema({
  name: String,
  email: String,
  promoCode: { type: String, unique: true },
  commissionRate: { type: Number, default: 10.0 },
  payoutFrequency: { type: String, enum: ["weekly", "monthly"], default: "monthly" },
});

export default mongoose.models.Affiliate || mongoose.model<IAffiliateDocument>("Affiliate", AffiliateSchema);
