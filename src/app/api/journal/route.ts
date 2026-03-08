import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const date = searchParams.get('date')

    if (date) {
      const entry = await prisma.journalEntry.findUnique({ where: { date } })
      return NextResponse.json(entry)
    }

    const where: any = {}
    if (month) where.date = { startsWith: month }

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch journal' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entry = await prisma.journalEntry.upsert({
      where: { date: body.date },
      update: { content: body.content, gratitude: body.gratitude },
      create: {
        date: body.date,
        content: body.content,
        gratitude: body.gratitude || null,
      },
    })
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save journal' }, { status: 500 })
  }
}
