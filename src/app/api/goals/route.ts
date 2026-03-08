import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { tasks: { orderBy: { sortOrder: 'asc' } } },
    })
    return NextResponse.json(goals)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const goal = await prisma.goal.create({
      data: {
        title: body.title,
        description: body.description || null,
        type: body.type || 'weekly',
        startDate: body.startDate,
        endDate: body.endDate,
        priority: body.priority || 'medium',
        tasks: body.tasks?.length
          ? {
              create: body.tasks.map((t: any, i: number) => ({
                title: t.title,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { tasks: true },
    })
    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
