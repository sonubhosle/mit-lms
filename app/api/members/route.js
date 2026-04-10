import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Member from '@/lib/models/Member'
import AuditLog from '@/lib/models/AuditLog'
import { encrypt, decrypt } from '@/lib/encryption'

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

    // Decrypt sensitive data before sending to client
    const decryptedMembers = members.map(m => {
      const member = m.toObject()
      member.email = decrypt(member.email)
      member.phone = decrypt(member.phone)
      return member
    })

    return NextResponse.json({
      members: decryptedMembers,
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

    // Encrypt sensitive info
    const encryptedData = {
      ...data,
      memberId,
      email: encrypt(data.email),
      phone: encrypt(data.phone),
      address: data.address ? encrypt(data.address) : ''
    }

    const member = await Member.create(encryptedData)

    await AuditLog.create({
      userId: session.id,
      action: 'ADD_MEMBER',
      details: { memberId: member._id, libId: member.memberId, name: member.name }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Member POST error:', error)
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}
