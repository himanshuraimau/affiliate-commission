import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const userCookie = (await cookies()).get("user");
    
    if (!userCookie?.value) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    const user = JSON.parse(userCookie.value);
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
