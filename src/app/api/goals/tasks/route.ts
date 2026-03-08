import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const task = await prisma.goalTask.create({
      data: {
        goalId: body.goalId,
        title: body.title,
        sortOrder: body.sortOrder || 0,
      },
    })
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const task = await prisma.goalTask.update({
      where: { id: body.id },
      data: { completed: body.completed, title: body.title },
    })

    // Auto-update goal progress
    const goal = await prisma.goal.findUnique({
      where: { id: task.goalId },
      include: { tasks: true },
    })
    if (goal && goal.tasks.length > 0) {
      const completedCount = goal.tasks.filter(t => t.id === task.id ? body.completed : t.completed).length
      const progress = Math.round((completedCount / goal.tasks.length) * 100)
      await prisma.goal.update({
        where: { id: goal.id },
        data: { progress, status: progress === 100 ? 'completed' : 'active' },
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await prisma.goalTask.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
