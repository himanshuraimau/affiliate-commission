import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { getModels } from "@/lib/db/models";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { User } = getModels();
    const { name, email, password } = await request.json();

    // Check for existing user
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Convert _id to string explicitly
    const userId = user._id.toString();
    
    // Set cookie
    (await
          // Set cookie
          cookies()).set("user", JSON.stringify({
      id: userId,
      name: user.name,
      email: user.email
    }), { 
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "lax"
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
