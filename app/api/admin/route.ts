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

    const items = await prisma.administrationItem.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });

    const completedCount = items.filter(
      (item) => item.status === true
    ).length;

    const progressPercent =
      items.length > 0
        ? ((completedCount / items.length) * 100).toFixed(1)
        : 0;

    return NextResponse.json({
      items,
      totalCount: items.length,
      completedCount,
      progressPercent: parseFloat(String(progressPercent)),
    });
  } catch (error) {
    console.error('Get admin items error:', error);
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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Nama dokumen harus diisi' },
        { status: 400 }
      );
    }

    const item = await prisma.administrationItem.create({
      data: {
        name,
        status: false,
        workspaceId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Create admin item error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
