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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';

    const songs = await prisma.song.findMany({
      where: {
        workspaceId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { artist: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(category && { category }),
      },
      orderBy: { createdAt: 'asc' },
    });

    const categories = [...new Set(songs.map((s) => s.category).filter(Boolean))].sort();

    return NextResponse.json({
      songs,
      categories,
      totalSongs: songs.length,
    });
  } catch (error) {
    console.error('Get songs error:', error);
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
    const { title, artist, category } = body;

    if (!title || !artist) {
      return NextResponse.json(
        { message: 'Judul dan penyanyi harus diisi' },
        { status: 400 }
      );
    }

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        category: category || null,
        workspaceId,
      },
    });

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error('Create song error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
