import { NextRequest, NextResponse } from 'next/server';
import { clearWorkspaceCookie } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await clearWorkspaceCookie();
    return NextResponse.json({ message: 'Logout berhasil' }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
