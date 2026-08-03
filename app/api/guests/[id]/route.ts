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

    const category = await prisma.guestCategory.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Kategori tamu tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, groomCount, brideCount } = body;

    const updatedCategory = await prisma.guestCategory.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(groomCount !== undefined && { groomCount: Math.max(0, parseInt(groomCount) || 0) }),
        ...(brideCount !== undefined && { brideCount: Math.max(0, parseInt(brideCount) || 0) }),
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Update guest category error:', error);
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

    const category = await prisma.guestCategory.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Kategori tamu tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.guestCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Kategori tamu berhasil dihapus' });
  } catch (error) {
    console.error('Delete guest category error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
