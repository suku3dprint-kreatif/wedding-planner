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

    const gift = await prisma.giftItem.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!gift) {
      return NextResponse.json(
        { message: 'Barang tidak ditemukan' },
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

    const updatedGift = await prisma.giftItem.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updatedGift);
  } catch (error) {
    console.error('Update gift error:', error);
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

    const gift = await prisma.giftItem.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    });

    if (!gift) {
      return NextResponse.json(
        { message: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.giftItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Barang berhasil dihapus' });
  } catch (error) {
    console.error('Delete gift error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
