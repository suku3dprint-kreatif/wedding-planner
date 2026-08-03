import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; itemId: string }> }
) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Tidak ada workspace' },
        { status: 401 }
      );
    }

    const { paymentType, amount, paidDate } = await request.json();

    if (!paymentType || !amount || !paidDate) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Verify item ownership
    const item = await prisma.budgetItem.findFirst({
      where: {
        id: (await params).itemId,
        event: {
          id: (await params).eventId,
          workspaceId,
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: 'Item tidak ditemukan' },
        { status: 404 }
      );
    }

    const payment = await prisma.budgetPayment.create({
      data: {
        budgetItemId: (await params).itemId,
        paymentType,
        amount: BigInt(amount),
        paidDate: new Date(paidDate),
      },
    });

    return NextResponse.json(
      { payment, message: 'Pembayaran berhasil dicatat' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
