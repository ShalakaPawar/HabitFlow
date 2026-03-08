import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const date = searchParams.get('date')

    if (date) {
      const entry = await prisma.fitnessSync.findFirst({
        where: { date },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(entry)
    }

    const where: any = {}
    if (month) where.date = { startsWith: month }

    const entries = await prisma.fitnessSync.findMany({
      where,
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fitness data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entry = await prisma.fitnessSync.upsert({
      where: { date_source: { date: body.date, source: body.source || 'manual' } },
      update: {
        steps: body.steps,
        heartRate: body.heartRate,
        sleep: body.sleep,
        calories: body.calories,
        distance: body.distance,
        rawData: body.rawData ? JSON.stringify(body.rawData) : null,
      },
      create: {
        date: body.date,
        source: body.source || 'manual',
        steps: body.steps || null,
        heartRate: body.heartRate || null,
        sleep: body.sleep || null,
        calories: body.calories || null,
        distance: body.distance || null,
        rawData: body.rawData ? JSON.stringify(body.rawData) : null,
      },
    })
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save fitness data' }, { status: 500 })
  }
}
