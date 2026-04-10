import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Transaction from '@/lib/models/Transaction'
import Book from '@/lib/models/Book'
import Member from '@/lib/models/Member'
import Fine from '@/lib/models/Fine'
import AuditLog from '@/lib/models/AuditLog'
import { differenceInDays, isAfter } from 'date-fns'

export async function PUT(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const { action, remarks } = await req.json()
    const { id } = await params

    const transaction = await Transaction.findById(id).populate('bookId')
    if (!transaction || (transaction.status === 'returned' && action !== 'mark_lost')) {
      return NextResponse.json({ error: 'Transaction not found or already closed' }, { status: 400 })
    }

    const today = new Date()
    let fineAmount = 0
    let message = ""

    // Calculate daily penalty (RS 10 per day)
    const isOverdue = isAfter(today, transaction.dueDate)
    const overdueDays = isOverdue ? differenceInDays(today, transaction.dueDate) : 0
    const latePenalty = overdueDays * 10

    if (action === 'return') {
      fineAmount = latePenalty
      
      transaction.status = 'returned'
      transaction.returnDate = today
      transaction.fineAmount = fineAmount
      transaction.remarks = remarks || "Normal Return"
      await transaction.save()

      // Increase stock
      await Book.findByIdAndUpdate(transaction.bookId, { $inc: { availableCopies: 1 } })
      message = "Book returned successfully"
    } 
    else if (action === 'lost') {
      // Penalty = Full Price + Late Penalty
      const bookPrice = transaction.bookId?.price || 0
      fineAmount = bookPrice + latePenalty
      
      transaction.status = 'lost'
      transaction.returnDate = today
      transaction.fineAmount = fineAmount
      transaction.remarks = remarks || "Book Reported Lost"
      await transaction.save()

      // DO NOT increase stock since book is lost
      message = "Book marked as Lost. Penalty applied."
    }

    // Create Fine and Update Member Balance
    if (fineAmount > 0) {
      await Fine.create({
        memberId: transaction.memberId,
        transactionId: transaction._id,
        amount: fineAmount,
        reason: action === 'lost' ? 'Lost Book & Late Penalty' : 'Late Return Penalty'
      })
      await Member.findByIdAndUpdate(transaction.memberId, { $inc: { finesDue: fineAmount } })
    }

    await AuditLog.create({
      userId: session.id,
      action: action === 'lost' ? 'MARK_LOST' : 'RETURN_BOOK',
      details: { 
        transactionId: transaction._id, 
        book: transaction.bookId?.title, 
        fine: fineAmount 
      }
    })

    return NextResponse.json({ message, fineAmount })
  } catch (error) {
    console.error('Transaction PUT error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
