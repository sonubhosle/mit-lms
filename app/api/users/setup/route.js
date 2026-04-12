import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    await dbConnect()
    
    // Safety check - only allow if no users exist
    const userCount = await User.countDocuments()
    if (userCount > 0) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 403 })
    }

    const { name, email, password } = await req.json()
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'superadmin',
      isActive: true,
      failedAttempts: 0
    })

    // Auto-login after setup
    const { signJWT } = await import("@/lib/jwt")
    const token = await signJWT({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({ message: 'Admin created successfully' })
    
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Setup API Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
