import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Member from '@/lib/models/Member'
import AuditLog from '@/lib/models/AuditLog'

export async function GET(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    let query = { isActive: true }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } }
      ]
    }

    const [members, total] = await Promise.all([
      Member.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Member.countDocuments(query)
    ])

    const Transaction = (await import('@/lib/models/Transaction')).default

    // Get active issue counts for all members in this page at once
    const memberIds = members.map(m => m._id)
    const issueCounts = await Transaction.aggregate([
      { $match: { memberId: { $in: memberIds }, status: 'issued' } },
      { $group: { _id: '$memberId', count: { $sum: 1 } } }
    ])

    const countsMap = Object.fromEntries(issueCounts.map(c => [c._id.toString(), c.count]))

    const membersWithCounts = members.map(m => {
      const member = m.toObject()
      member.activeIssues = countsMap[member._id.toString()] || 0
      return member
    })

    return NextResponse.json({
      members: membersWithCounts,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const data = await req.json()

    // Generate memberId: LIB-YYYY-XXXX
    const year = new Date().getFullYear()
    const count = await Member.countDocuments({ 
      createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) } 
    })
    const sequence = String(count + 1).padStart(4, '0')
    const memberId = `LIB-${year}-${sequence}`

    const member = await Member.create({ ...data, memberId })

    await AuditLog.create({
      userId: session.id,
      action: 'ADD_MEMBER',
      details: { memberId: member._id, libId: member.memberId, name: member.name }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Member POST error:', error)
    if (error.code === 11000 && error.keyPattern?.email) {
      return NextResponse.json({ error: 'A member with this email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}
