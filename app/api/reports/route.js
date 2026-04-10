import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Transaction from '@/lib/models/Transaction'
import Fine from '@/lib/models/Fine'
import Book from '@/lib/models/Book'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export async function GET(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'daily'

    if (type === 'daily') {
      const today = new Date()
      const start = startOfDay(today)
      const end = endOfDay(today)

      const [issues, returns, fines] = await Promise.all([
        Transaction.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'issued' }),
        Transaction.countDocuments({ returnDate: { $gte: start, $lte: end }, status: 'returned' }),
        Fine.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
      ])

      return NextResponse.json({
        issues,
        returns,
        finesCollected: fines[0]?.total || 0
      })
    }

    if (type === 'top-books') {
      const topBooks = await Transaction.aggregate([
        { $group: { _id: "$bookId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "books",
            localField: "_id",
            foreignField: "_id",
            as: "book"
          }
        },
        { $unwind: "$book" }
      ])
      return NextResponse.json(topBooks)
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
