import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function PATCH(
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

    const body = await request.json();

    // Verify ownership
    const timeline = await prisma.timeline.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!timeline) {
      return NextResponse.json(
        { message: 'Task tidak ditemukan' },
        { status: 404 }
      );
    }

    const updated = await prisma.timeline.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ timeline: updated }, { status: 200 });
  } catch (error) {
    console.error('Update timeline error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify ownership
    const timeline = await prisma.timeline.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!timeline) {
      return NextResponse.json(
        { message: 'Task tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.timeline.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Task berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete timeline error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
