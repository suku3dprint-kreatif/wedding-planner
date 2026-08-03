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

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get stats
    const timelines = await prisma.timeline.findMany({
      where: { workspaceId },
    });

    const budgetItems = await prisma.budgetItem.findMany({
      where: { event: { workspaceId } },
      include: { payments: true },
    });

    const guestCategories = await prisma.guestCategory.findMany({
      where: { workspaceId },
    });

    const savingsRecords = await prisma.savingsRecord.findMany({
      where: { workspaceId },
    });

    const giftItems = await prisma.giftItem.findMany({
      where: { workspaceId },
    });

    const guestCategories = await prisma.guestCategory.findMany({
      where: { workspaceId },
    });

    // Calculate totals
    const tasksTotal = timelines.length;
    const tasksCompleted = timelines.filter(
      (t) => t.status === 'COMPLETED'
    ).length;

    const totalBudget = budgetItems.reduce(
      (sum, item) => sum + item.initialAmount,
      0n
    );

    const totalPaid = budgetItems.reduce((sum, item) => {
      const itemPaid = item.payments.reduce((s, p) => s + p.amount, 0n);
      return sum + itemPaid;
    }, 0n);

    const totalGuestGroom = guestCategories.reduce(
      (sum, cat) => sum + cat.groomCount,
      0
    );

    const totalGuestBride = guestCategories.reduce(
      (sum, cat) => sum + cat.brideCount,
      0
    );

    const guestCount = totalGuestGroom + totalGuestBride;

    const totalSavings = savingsRecords.reduce(
      (sum, record) => sum + record.amountFromGroom + record.amountFromBride,
      0n
    );

    const totalGiftCost = giftItems.reduce(
      (sum, item) => sum + item.price,
      0n
    );

    const giftCompleted = giftItems.filter(
      (item) => item.status === 'COMPLETED'
    ).length;

    return NextResponse.json(
      {
        workspace: {
          groomName: workspace.groomName,
          brideName: workspace.brideName,
          weddingDate: workspace.weddingDate,
        },
        stats: {
          tasksTotal: tasksTotal || 0,
          tasksCompleted,
          totalBudget: Number(totalBudget),
          totalPaid: Number(totalPaid),
          totalSavings: Number(totalSavings),
          guestCount,
          totalGiftCost: Number(totalGiftCost),
          giftCompleted,
          totalGuestGroom,
          totalGuestBride,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
