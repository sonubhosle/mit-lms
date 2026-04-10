import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Transaction from '@/lib/models/Transaction'
import { startOfDay } from 'date-fns'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const today = startOfDay(new Date())

    const overdue = await Transaction.find({
      status: 'issued',
      dueDate: { $lt: today }
    })
    .sort({ dueDate: 1 })
    .populate('bookId', 'title isbn')
    .populate('memberId', 'name phone memberId')

    return NextResponse.json(overdue)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
