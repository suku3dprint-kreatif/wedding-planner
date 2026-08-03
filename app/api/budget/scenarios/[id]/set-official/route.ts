import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function POST(
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

    // Verify scenario ownership
    const scenario = await prisma.budgetScenario.findFirst({
      where: { id: (await params).id, workspaceId },
    });

    if (!scenario) {
      return NextResponse.json(
        { message: 'Skenario tidak ditemukan' },
        { status: 404 }
      );
    }

    // Unset all others as official
    await prisma.budgetScenario.updateMany({
      where: { workspaceId, isOfficial: true },
      data: { isOfficial: false },
    });

    // Set this one as official
    const updated = await prisma.budgetScenario.update({
      where: { id: (await params).id },
      data: { isOfficial: true },
      include: { items: true },
    });

    return NextResponse.json(
      { scenario: updated, message: 'Skenario dijadikan resmi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Set official error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
