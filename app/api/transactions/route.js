import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Transaction from '@/lib/models/Transaction'
import Book from '@/lib/models/Book'
import Member from '@/lib/models/Member'
import AuditLog from '@/lib/models/AuditLog'
import { addDays } from 'date-fns'


export async function GET(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const memberId = searchParams.get('memberId')
    const search = searchParams.get('search')

    let query = {}
    if (status) {
      query.status = status.includes(',') ? { $in: status.split(',') } : status
    }
    if (memberId) query.memberId = memberId
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } }
      ]
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .populate('bookId', 'title isbn price')
      .populate('memberId', 'name memberId email phone className address')
      .populate('issuedBy', 'name')

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const { memberId, bookId, dueDateOverride } = await req.json()

    // 1. Validate Member
    const member = await Member.findById(memberId)
    if (!member || !member.isActive) return NextResponse.json({ error: 'Member not found or inactive' }, { status: 400 })

    // 2. Check Member Limits
    const activeIssues = await Transaction.countDocuments({ memberId, status: 'issued' })
    const limits = { student: 3, faculty: 5, public: 2 }
    if (activeIssues >= limits[member.membershipType]) {
      return NextResponse.json({ error: `Borrow limit reached for ${member.membershipType}` }, { status: 400 })
    }

    // 3. Validate Book
    const book = await Book.findById(bookId)
    if (!book || book.availableCopies <= 0) return NextResponse.json({ error: 'Book not available' }, { status: 400 })

    // 4. Create Transaction
    const transactionId = `TXN-${Date.now()}`
    const dueDate = dueDateOverride ? new Date(dueDateOverride) : addDays(new Date(), 14)

    const transaction = await Transaction.create({
      transactionId,
      bookId,
      memberId,
      issuedBy: session.id,
      issueDate: new Date(),
      dueDate,
      status: 'issued'
    })

    // 5. Update Book Stock
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } })

    await AuditLog.create({
      userId: session.id,
      action: 'ISSUE_BOOK',
      details: { transactionId: transaction._id, book: book.title, member: member.name }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
