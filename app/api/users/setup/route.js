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

    await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'superadmin',
      isActive: true,
      failedAttempts: 0
    })

    return NextResponse.json({ message: 'Admin created successfully' })
  } catch (error) {
    console.error("Setup API Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
