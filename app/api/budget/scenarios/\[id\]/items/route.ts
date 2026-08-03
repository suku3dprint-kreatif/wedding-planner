import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Tidak ada workspace' },
        { status: 401 }
      );
    }

    const { name, amount } = await request.json();

    if (!name || !amount) {
      return NextResponse.json(
        { message: 'Name dan amount harus diisi' },
        { status: 400 }
      );
    }

    // Verify scenario ownership
    const scenario = await prisma.budgetScenario.findFirst({
      where: { id: params.id, workspaceId },
    });

    if (!scenario) {
      return NextResponse.json(
        { message: 'Skenario tidak ditemukan' },
        { status: 404 }
      );
    }

    const item = await prisma.budgetScenarioItem.create({
      data: {
        scenarioId: params.id,
        name,
        amount: BigInt(amount),
      },
    });

    return NextResponse.json(
      { item, message: 'Item berhasil ditambahkan' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
