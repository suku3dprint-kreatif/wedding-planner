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

    const categories = await prisma.guestCategory.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });

    const totalGroom = categories.reduce((sum, cat) => sum + cat.groomCount, 0);
    const totalBride = categories.reduce((sum, cat) => sum + cat.brideCount, 0);
    const totalGuests = totalGroom + totalBride;

    return NextResponse.json({
      categories,
      totalGroom,
      totalBride,
      totalGuests,
    });
  } catch (error) {
    console.error('Get guests error:', error);
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

    const body = await request.json();
    const { name, groomCount, brideCount } = body;

    if (!name || groomCount === undefined || brideCount === undefined) {
      return NextResponse.json(
        { message: 'Nama kategori dan jumlah tamu harus diisi' },
        { status: 400 }
      );
    }

    const category = await prisma.guestCategory.create({
      data: {
        name,
        groomCount: Math.max(0, parseInt(groomCount) || 0),
        brideCount: Math.max(0, parseInt(brideCount) || 0),
        workspaceId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create guest category error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
