import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Member from '@/lib/models/Member'
import AuditLog from '@/lib/models/AuditLog'
import { encrypt, decrypt } from '@/lib/encryption'

export async function GET(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const memberDoc = await Member.findById(params.id)
    if (!memberDoc) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

    const member = memberDoc.toObject()
    member.email = decrypt(member.email)
    member.phone = decrypt(member.phone)
    member.address = decrypt(member.address)

    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const data = await req.json()

    // Encrypt sensitive info for update
    const encryptedData = {
      ...data,
      email: encrypt(data.email),
      phone: encrypt(data.phone),
      address: data.address ? encrypt(data.address) : ''
    }

    const member = await Member.findByIdAndUpdate(params.id, encryptedData, { new: true })

    await AuditLog.create({
      userId: session.id,
      action: 'EDIT_MEMBER',
      details: { memberId: params.id, name: member.name }
    })

    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    await Member.findByIdAndUpdate(params.id, { isActive: false })

    await AuditLog.create({
      userId: session.id,
      action: 'SOFT_DELETE_MEMBER',
      details: { memberId: params.id }
    })

    return NextResponse.json({ message: 'Member deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
}
