import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()
    await dbConnect()

    // 1. Check if email exists
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return new NextResponse(JSON.stringify({ error: "Email already registered" }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // 3. Create user (Default role: librarian)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'librarian',
      isActive: true,
      failedAttempts: 0
    })

    // 4. Generate Token for Auto-login
    const { signJWT } = await import("@/lib/jwt")
    const token = await signJWT({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const response = new NextResponse(JSON.stringify({ 
      success: true, 
      message: "Account created successfully",
      user: { name: user.name, role: user.role } 
    }), { status: 201, headers: { 'Content-Type': 'application/json' } })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response

  } catch (error) {
    console.error("Signup Error:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
