import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

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

    const scenario = await prisma.budgetScenario.findFirst({
      where: { id: params.id, workspaceId },
    });

    if (!scenario) {
      return NextResponse.json(
        { message: 'Skenario tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.budgetScenario.delete({ where: { id: params.id } });

    return NextResponse.json(
      { message: 'Skenario berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete scenario error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
