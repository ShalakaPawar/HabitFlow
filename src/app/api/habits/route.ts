import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const habits = await prisma.habit.findMany({
      where: { archived: false },
      orderBy: { sortOrder: 'asc' },
      include: { logs: true },
    })
    return NextResponse.json(habits)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const habit = await prisma.habit.create({
      data: {
        name: body.name,
        description: body.description || null,
        icon: body.icon || 'circle',
        color: body.color || '#0ea5e9',
        frequency: body.frequency || 'daily',
        targetCount: body.targetCount || 1,
        unit: body.unit || null,
        reminderTime: body.reminderTime || null,
        reminderDays: body.reminderDays || null,
        category: body.category || 'general',
      },
    })
    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
}
