"use server";

import { connectToDatabase } from "@/lib/mongo";
import Affiliate, { IAffiliateDocument } from "@/models/Affiliate";

interface AffiliateInput {
  name: string;
  email: string;
  promoCode: string;
}

interface AffiliateResponse {
  success: boolean;
  affiliate?: IAffiliateDocument;
  error?: string;
}

export async function addAffiliate({ name, email, promoCode }: AffiliateInput): Promise<AffiliateResponse> {
  try {
    await connectToDatabase();
    const newAffiliate = await Affiliate.create({ name, email, promoCode });
    return { success: true, affiliate: newAffiliate };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAffiliates(): Promise<IAffiliateDocument[]> {
  await connectToDatabase();
  return await Affiliate.find();
}
