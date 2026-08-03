import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

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

    // Verify ownership through event
    const item = await prisma.budgetItem.findFirst({
      where: {
        id: (await params).id,
        event: { workspaceId },
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: 'Item tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.budgetItem.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json(
      { message: 'Item berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
