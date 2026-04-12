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
    const { action, remarks, manualFine, daysLate } = await req.json()
    const { id } = await params

    const transaction = await Transaction.findById(id).populate('bookId')
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const today = new Date()
    let fineAmount = 0
    let message = ""

    // Calculate daily penalty (RS 10 per day)
    const isOverdue = isAfter(today, transaction.dueDate)
    const overdueDays = isOverdue ? differenceInDays(today, transaction.dueDate) : 0
    const latePenalty = overdueDays * 10

    if (action === 'return') {
      if (transaction.status === 'returned') return NextResponse.json({ error: 'Already returned' }, { status: 400 })
      // Use manual fine if provided, otherwise auto-calculate
      fineAmount = manualFine !== undefined ? Number(manualFine) : latePenalty
      
      transaction.status = 'returned'
      transaction.returnDate = today
      transaction.fineAmount = fineAmount
      transaction.daysLate = daysLate !== undefined ? Number(daysLate) : overdueDays
      transaction.remarks = remarks || (fineAmount > 0 ? `Late return - ${transaction.daysLate} day(s) overdue` : 'Normal Return')
      await transaction.save()

      // Increase stock
      await Book.findByIdAndUpdate(transaction.bookId, { $inc: { availableCopies: 1 } })
      message = "Book returned successfully"
    } 
    else if (action === 'lost') {
      if (transaction.status === 'lost') return NextResponse.json({ error: 'Already marked as lost' }, { status: 400 })
      const bookPrice = transaction.bookId?.price || 0
      // Use manual fine if provided, otherwise auto-calculate (full price + late penalty)
      fineAmount = manualFine !== undefined ? Number(manualFine) : (bookPrice + latePenalty)
      
      transaction.status = 'lost'
      transaction.returnDate = today
      transaction.fineAmount = fineAmount
      transaction.remarks = remarks || `Book Reported Lost - Fine: ₹${fineAmount}`
      await transaction.save()

      // DO NOT increase stock since book is lost
      message = "Book marked as Lost. Penalty applied."
    }
    else if (action === 'pay_fine') {
      if (transaction.finePaid) return NextResponse.json({ error: 'Fine already paid' }, { status: 400 })
      if (transaction.fineAmount <= 0) return NextResponse.json({ error: 'No fine to pay' }, { status: 400 })

      transaction.finePaid = true
      await transaction.save()

      // Update Member Balance
      await Member.findByIdAndUpdate(transaction.memberId, { $inc: { finesDue: -transaction.fineAmount } })
      
      // Update Fine Record
      await Fine.findOneAndUpdate(
        { transactionId: transaction._id }, 
        { isPaid: true, paidDate: today }
      )
      
      message = "Fine payment processed successfully"
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

    // Fetch fully populated transaction to return to client
    const updatedTx = await Transaction.findById(id)
      .populate('bookId', 'title isbn price')
      .populate('memberId', 'name memberId email phone className address')
      .populate('issuedBy', 'name')

    return NextResponse.json({ message, fineAmount, transaction: updatedTx })
  } catch (error) {
    console.error('Transaction PUT error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
export async function DELETE(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const { id } = await params

    const tx = await Transaction.findById(id)
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    // If active issue, restore book stock
    if (tx.status === 'issued' || tx.status === 'overdue') {
      await Book.findByIdAndUpdate(tx.bookId, { $inc: { availableCopies: 1 } })
    }

    await Transaction.findByIdAndDelete(id)

    await AuditLog.create({
      userId: session.id,
      action: 'DELETE_TRANSACTION',
      details: { transactionId: id }
    })

    return NextResponse.json({ message: 'Transaction deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
