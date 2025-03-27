import { NextResponse } from 'next/server';
import { getModels } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { Affiliate } = getModels();
    
    const data = await request.json();
    const { 
      name, 
      email, 
      phone, 
      promoCode, 
      commissionRate, 
      status, 
      paymentMethod, 
      paymentDetails 
    } = data;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' }, 
        { status: 400 }
      );
    }

    // Generate a promo code if not provided
    let finalPromoCode = promoCode;
    if (!finalPromoCode) {
      // Generate code based on name and random numbers
      const namePrefix = name.split(' ')[0].slice(0, 4).toUpperCase();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      finalPromoCode = `${namePrefix}${randomSuffix}`;
    }

    // Check if promo code already exists
    const existingPromoCode = await Affiliate.findOne({ promoCode: finalPromoCode });
    if (existingPromoCode) {
      return NextResponse.json(
        { message: 'Promo code already exists. Please use a different one.' }, 
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await Affiliate.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { message: 'An affiliate with this email already exists.' }, 
        { status: 400 }
      );
    }

    // Create the affiliate in the database
    const affiliate = await Affiliate.create({
      name,
      email,
      phone,
      promoCode: finalPromoCode,
      commissionRate: commissionRate || 10,
      status: status || 'pending',
      paymentMethod: paymentMethod || 'TEST_RAILS',
      paymentDetails: paymentDetails || {},
      totalEarned: 0,
      totalPaid: 0,
      pendingAmount: 0
    });

    return NextResponse.json(affiliate);
  } catch (error) {
    console.error('Error creating affiliate:', error);
    return NextResponse.json(
      { 
        message: 'Failed to create affiliate', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const { Affiliate } = getModels();
    
    const affiliates = await Affiliate.find().sort({ createdAt: -1 });
    
    return NextResponse.json(affiliates);
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch affiliates', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
