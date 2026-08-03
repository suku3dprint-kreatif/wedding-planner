import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Tidak ada workspace' },
        { status: 401 }
      );
    }

    const { name, initialAmount } = await request.json();

    if (!name || !initialAmount) {
      return NextResponse.json(
        { message: 'Nama dan jumlah harus diisi' },
        { status: 400 }
      );
    }

    // Verify event ownership
    const event = await prisma.weddingEvent.findFirst({
      where: { id: (await params).id, workspaceId },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Acara tidak ditemukan' },
        { status: 404 }
      );
    }

    const item = await prisma.budgetItem.create({
      data: {
        eventId: (await params).id,
        name,
        initialAmount: BigInt(initialAmount),
      },
      include: { payments: true },
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
