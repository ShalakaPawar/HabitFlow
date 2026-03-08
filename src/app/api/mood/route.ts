import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // YYYY-MM format
    
    const where: any = {}
    if (month) {
      where.date = { startsWith: month }
    }

    const moods = await prisma.moodEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(moods)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch moods' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const mood = await prisma.moodEntry.upsert({
      where: { date: body.date },
      update: { mood: body.mood, energy: body.energy, note: body.note },
      create: {
        date: body.date,
        mood: body.mood,
        energy: body.energy || null,
        note: body.note || null,
      },
    })
    return NextResponse.json(mood)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save mood' }, { status: 500 })
  }
}
