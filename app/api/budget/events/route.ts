import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Tidak ada workspace' },
        { status: 401 }
      );
    }

    const events = await prisma.weddingEvent.findMany({
      where: { workspaceId },
      include: {
        budgetItems: {
          include: {
            payments: true,
          },
        },
      },
      orderBy: { eventDate: 'asc' },
    });

    // Calculate summary
    let totalBudget = 0n;
    let totalPaid = 0n;

    const eventsWithPaid = events.map((event) => {
      const eventBudgetItems = event.budgetItems.map((item) => {
        const itemPaid = item.payments.reduce((sum, p) => sum + p.amount, 0n);
        totalBudget += item.initialAmount;
        totalPaid += itemPaid;
        return {
          id: item.id,
          name: item.name,
          initialAmount: item.initialAmount,
          totalPaid: Number(itemPaid),
        };
      });

      return {
        id: event.id,
        name: event.name,
        eventDate: event.eventDate?.toISOString() || null,
        budgetItems: eventBudgetItems,
      };
    });

    return NextResponse.json(
      {
        events: eventsWithPaid,
        totalBudget: Number(totalBudget),
        totalPaid: Number(totalPaid),
        totalRemaining: Number(totalBudget - totalPaid),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Tidak ada workspace' },
        { status: 401 }
      );
    }

    const { name, eventDate } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Nama acara harus diisi' },
        { status: 400 }
      );
    }

    const event = await prisma.weddingEvent.create({
      data: {
        workspaceId,
        name,
        eventDate: eventDate ? new Date(eventDate) : null,
      },
      include: {
        budgetItems: {
          include: { payments: true },
        },
      },
    });

    return NextResponse.json(
      { event, message: 'Acara berhasil dibuat' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
