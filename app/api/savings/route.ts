import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET() {
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

    // Get all savings records
    const records = await prisma.savingsRecord.findMany({
      where: { workspaceId },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    // Get total budget from official budget scenario
    const officialScenario = await prisma.budgetScenario.findFirst({
      where: { workspaceId, isOfficial: true },
      include: { items: true },
    });

    const budgetTarget = officialScenario
      ? officialScenario.items.reduce((sum, item) => sum + item.amount, 0n)
      : 0n;

    // Calculate accumulated savings
    let totalAccumulated = 0n;
    records.forEach((record) => {
      totalAccumulated += record.amountFromGroom + record.amountFromBride;
    });

    // Calculate progress percentage
    const percentageComplete =
      budgetTarget > 0n
        ? (Number(totalAccumulated) / Number(budgetTarget)) * 100
        : 0;

    // Calculate if on track
    const today = new Date();
    const weddingDate = workspace.weddingDate;
    const totalDays = Math.ceil(
      (weddingDate.getTime() - new Date(workspace.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.ceil(
      (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const monthsRemaining = Math.ceil(daysRemaining / 30);

    const expectedSavings =
      budgetTarget > 0n
        ? (Number(budgetTarget) / Math.max(totalDays / 30, 1)) *
          (Math.max(totalDays / 30, 1) - monthsRemaining)
        : 0;

    const isOnTrack = Number(totalAccumulated) >= expectedSavings;

    return NextResponse.json(
      {
        records,
        totalAccumulated: Number(totalAccumulated),
        budgetTarget: Number(budgetTarget),
        percentageComplete,
        isOnTrack,
        daysUntilWedding: Math.max(0, daysRemaining),
        monthsUntilWedding: Math.max(0, monthsRemaining),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get savings error:', error);
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

    const { month, year, amountFromGroom, amountFromBride } =
      await request.json();

    if (!month || !year || amountFromGroom === undefined || amountFromBride === undefined) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Check if record already exists
    const existing = await prisma.savingsRecord.findUnique({
      where: {
        workspaceId_month_year: {
          workspaceId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Data tabungan bulan ini sudah ada' },
        { status: 409 }
      );
    }

    const record = await prisma.savingsRecord.create({
      data: {
        workspaceId,
        month: parseInt(month),
        year: parseInt(year),
        amountFromGroom: BigInt(amountFromGroom),
        amountFromBride: BigInt(amountFromBride),
      },
    });

    return NextResponse.json(
      { record, message: 'Tabungan berhasil ditambahkan' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create savings error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
