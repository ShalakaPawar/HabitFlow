import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: params.id },
      include: { logs: true },
    })
    if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(habit)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const habit = await prisma.habit.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(habit)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.habit.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 })
  }
}
