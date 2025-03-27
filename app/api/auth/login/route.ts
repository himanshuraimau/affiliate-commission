import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { getModels } from "@/lib/db/models";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    const { email, password } = await request.json();
    
    console.log(`Login attempt for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User not found: ${email}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password by simple comparison
    const isValid = user.password === password;
    console.log(`Password verification result: ${isValid}`);
    
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set cookie with user info
    const userId = user._id.toString();
    
    (await cookies()).set("user", JSON.stringify({
      id: userId,
      name: user.name,
      email: user.email
    }), { 
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "lax"
    });

    console.log(`Login successful for: ${user.name}`);

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
