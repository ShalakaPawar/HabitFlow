import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const month = searchParams.get('month')

    if (date) {
      const log = await prisma.waterLog.findUnique({ where: { date } })
      return NextResponse.json(log || { date, glasses: 0, target: 8 })
    }

    const where: any = {}
    if (month) where.date = { startsWith: month }

    const logs = await prisma.waterLog.findMany({
      where,
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch water logs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const log = await prisma.waterLog.upsert({
      where: { date: body.date },
      update: { glasses: body.glasses, target: body.target },
      create: {
        date: body.date,
        glasses: body.glasses || 0,
        target: body.target || 8,
      },
    })
    return NextResponse.json(log)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save water log' }, { status: 500 })
  }
}
