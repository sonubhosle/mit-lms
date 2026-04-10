import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import { signJWT } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    await dbConnect()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    if (user.isActive === false) {
      return new NextResponse(JSON.stringify({ error: "Account is inactive" }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return new NextResponse(JSON.stringify({ error: "Account locked" }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordCorrect) {
      user.failedAttempts += 1
      if (user.failedAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000)
      }
      await user.save()
      return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    user.failedAttempts = 0
    user.lockUntil = undefined
    user.lastLogin = new Date()
    await user.save()

    const token = await signJWT({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const response = new NextResponse(JSON.stringify({ 
      success: true, 
      user: { name: user.name, role: user.role } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Set cookie on response object directly
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response
  } catch (error) {
    console.error("Login Error:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
