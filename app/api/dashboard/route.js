import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import dbConnect from '@/lib/mongodb'
import Book from '@/lib/models/Book'
import Member from '@/lib/models/Member'
import Transaction from '@/lib/models/Transaction'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    // Parallel fetching for performance
    const [
      totalBooks,
      totalMembers,
      issuedToday,
      overdueCount,
      recentTransactions,
      activityData
    ] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      Member.countDocuments({ isActive: true }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startOfToday, $lte: endOfToday },
        status: 'issued'
      }),
      Transaction.countDocuments({ 
        status: 'issued', 
        dueDate: { $lt: today } 
      }),
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('bookId', 'title')
        .populate('memberId', 'name'),
      // Fetch activity for last 7 days
      Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
          const date = subDays(today, i)
          const start = startOfDay(date)
          const end = endOfDay(date)
          
          const [issues, returns] = await Promise.all([
            Transaction.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'issued' }),
            Transaction.countDocuments({ returnDate: { $gte: start, $lte: end }, status: 'returned' })
          ])
          
          return {
            name: format(date, 'EEE'),
            issues,
            returns
          }
        })
      )
    ])

    return NextResponse.json({
      totalBooks,
      totalMembers,
      issuedToday,
      overdueCount,
      recentTransactions,
      chartData: activityData.reverse()
    })
  } catch (error) {
    console.error('Dashboard Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
