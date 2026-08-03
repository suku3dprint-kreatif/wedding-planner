import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET(
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

    const event = await prisma.weddingEvent.findFirst({
      where: { id: (await params).id, workspaceId },
      include: {
        budgetItems: {
          include: { payments: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Acara tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const event = await prisma.weddingEvent.findFirst({
      where: { id: (await params).id, workspaceId },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Acara tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.weddingEvent.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json(
      { message: 'Acara berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
