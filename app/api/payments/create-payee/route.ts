import { NextResponse } from 'next/server';
import { paymanClient } from '@/lib/payman-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    // Create payee using the Payman client
    const payee = await paymanClient.createTestRailsPayee({
      name,
      email,
      phoneNumber: phone,
      tags: ['affiliate']
    });

    return NextResponse.json(payee);
  } catch (error) {
    console.error('Error creating payee:', error);
    return NextResponse.json({ 
      message: 'Failed to create payee',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
