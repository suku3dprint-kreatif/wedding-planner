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

    const item = await prisma.administrationItem.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: 'Dokumen tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: 'Status harus diisi' },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.administrationItem.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Update admin item error:', error);
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

    const item = await prisma.administrationItem.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: 'Dokumen tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.administrationItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    console.error('Delete admin item error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
