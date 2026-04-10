import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import AuditLog from '@/lib/models/AuditLog'

export async function GET(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await dbConnect()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = 50
    const skip = (page - 1) * limit

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name role')

    const total = await AuditLog.countDocuments()

    return NextResponse.json({
      logs,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
