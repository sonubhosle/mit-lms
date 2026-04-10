import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Settings from '@/lib/models/Settings'
import AuditLog from '@/lib/models/AuditLog'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const settings = await Settings.find()
    
    // Transform to key-value object
    const config = {}
    settings.forEach(s => { config[s.key] = s.value })

    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await dbConnect()
    const data = await req.json()

    // Upsert each setting
    const promises = Object.entries(data).map(([key, value]) => 
      Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })
    )
    await Promise.all(promises)

    await AuditLog.create({
      userId: session.id,
      action: 'UPDATE_SETTINGS',
      details: data
    })

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
