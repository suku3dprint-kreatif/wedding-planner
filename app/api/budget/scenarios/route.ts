import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Tidak ada workspace' },
        { status: 401 }
      );
    }

    const scenarios = await prisma.budgetScenario.findMany({
      where: { workspaceId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ scenarios }, { status: 200 });
  } catch (error) {
    console.error('Get scenarios error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Tidak ada workspace' },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Nama skenario harus diisi' },
        { status: 400 }
      );
    }

    const scenario = await prisma.budgetScenario.create({
      data: {
        workspaceId,
        name,
      },
      include: { items: true },
    });

    return NextResponse.json(
      { scenario, message: 'Skenario berhasil dibuat' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create scenario error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
