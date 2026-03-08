import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { habitId, date, value = 1, note } = body

    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date } },
      update: { value, note },
      create: { habitId, date, value, note },
    })
    return NextResponse.json(log)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log habit' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const habitId = searchParams.get('habitId')
    const date = searchParams.get('date')

    if (!habitId || !date) {
      return NextResponse.json({ error: 'Missing habitId or date' }, { status: 400 })
    }

    await prisma.habitLog.delete({
      where: { habitId_date: { habitId, date } },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 })
  }
}
