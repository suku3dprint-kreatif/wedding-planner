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

    const song = await prisma.song.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!song) {
      return NextResponse.json(
        { message: 'Lagu tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, artist, category } = body;

    const updatedSong = await prisma.song.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(artist && { artist }),
        ...(category !== undefined && { category }),
      },
    });

    return NextResponse.json(updatedSong);
  } catch (error) {
    console.error('Update song error:', error);
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

    const song = await prisma.song.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!song) {
      return NextResponse.json(
        { message: 'Lagu tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.song.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Lagu berhasil dihapus' });
  } catch (error) {
    console.error('Delete song error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
