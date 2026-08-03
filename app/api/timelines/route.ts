import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Tidak ada workspace' },
        { status: 401 }
      );
    }

    const timelines = await prisma.timeline.findMany({
      where: { workspaceId },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ timelines }, { status: 200 });
  } catch (error) {
    console.error('Get timelines error:', error);
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

    const { name, startDate, endDate, description } = await request.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { message: 'Field name, startDate, endDate harus diisi' },
        { status: 400 }
      );
    }

    const timeline = await prisma.timeline.create({
      data: {
        workspaceId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { timeline, message: 'Task berhasil ditambahkan' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create timeline error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
