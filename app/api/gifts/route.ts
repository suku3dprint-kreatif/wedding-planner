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

    const items = await prisma.giftItem.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    const totalCost = items.reduce((sum, item) => sum + Number(item.price), 0);
    const completedCount = items.filter(
      (item) => item.status === 'COMPLETED'
    ).length;
    const inProcessCount = items.filter(
      (item) => item.status === 'IN_PROCESS'
    ).length;
    const pendingCount = items.filter((item) => item.status === 'PENDING').length;

    return NextResponse.json({
      items,
      totalCost,
      completedCount,
      inProcessCount,
      pendingCount,
    });
  } catch (error) {
    console.error('Get gifts error:', error);
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

    const body = await request.json();
    const { name, category, price, purchaseLink, notes } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { message: 'Nama, kategori, dan harga harus diisi' },
        { status: 400 }
      );
    }

    const gift = await prisma.giftItem.create({
      data: {
        name,
        category,
        price: BigInt(price),
        purchaseLink: purchaseLink || null,
        notes: notes || null,
        status: 'PENDING',
        workspaceId,
      },
    });

    return NextResponse.json(gift, { status: 201 });
  } catch (error) {
    console.error('Create gift error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
