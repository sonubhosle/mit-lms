import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Book from '@/lib/models/Book'
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
    const genre = searchParams.get('genre') || ''
    const skip = (page - 1) * limit

    let query = { isActive: true }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ]
    }
    if (genre) query.genre = genre

    const [books, total] = await Promise.all([
      Book.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(query)
    ])

    return NextResponse.json({
      books,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
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

    // Check ISBN uniqueness
    const existing = await Book.findOne({ isbn: data.isbn })
    if (existing) {
      return NextResponse.json({ error: 'Book with this ISBN already exists' }, { status: 400 })
    }

    const book = await Book.create({
      ...data,
      availableCopies: data.totalCopies,
      addedBy: session.id
    })

    await AuditLog.create({
      userId: session.id,
      action: 'ADD_BOOK',
      details: { bookId: book._id, title: book.title, isbn: book.isbn }
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 })
  }
}
