import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Book from '@/lib/models/Book'
import AuditLog from '@/lib/models/AuditLog'

export async function GET(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const book = await Book.findById(params.id)
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

    return NextResponse.json(book)
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
    
    const existing = await Book.findById(params.id)
    if (!existing) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

    // Adjust available copies if total copies changed
    const totalDiff = data.totalCopies - existing.totalCopies
    const newAvailable = existing.availableCopies + totalDiff

    const book = await Book.findByIdAndUpdate(params.id, {
      ...data,
      availableCopies: newAvailable,
      updatedAt: Date.now()
    }, { new: true })

    await AuditLog.create({
      userId: session.id,
      action: 'EDIT_BOOK',
      details: { bookId: book._id, title: book.title }
    })

    return NextResponse.json(book)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    
    // Soft delete
    const book = await Book.findByIdAndUpdate(params.id, { isActive: false }, { new: true })
    
    await AuditLog.create({
      userId: session.id,
      action: 'SOFT_DELETE_BOOK',
      details: { bookId: params.id, title: book.title }
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}
