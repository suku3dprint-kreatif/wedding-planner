import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function PATCH(
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

    // Verify ownership
    const record = await prisma.savingsRecord.findFirst({
      where: {
        id: (await params).id,
        workspaceId,
      },
    });

    if (!record) {
      return NextResponse.json(
        { message: 'Data tabungan tidak ditemukan' },
        { status: 404 }
      );
    }

    const { amountFromGroom, amountFromBride } = await request.json();

    const updated = await prisma.savingsRecord.update({
      where: { id: (await params).id },
      data: {
        amountFromGroom: BigInt(amountFromGroom),
        amountFromBride: BigInt(amountFromBride),
      },
    });

    return NextResponse.json(
      { record: updated, message: 'Tabungan berhasil diupdate' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update savings error:', error);
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

    // Verify ownership
    const record = await prisma.savingsRecord.findFirst({
      where: {
        id: (await params).id,
        workspaceId,
      },
    });

    if (!record) {
      return NextResponse.json(
        { message: 'Data tabungan tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.savingsRecord.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json(
      { message: 'Tabungan berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete savings error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
