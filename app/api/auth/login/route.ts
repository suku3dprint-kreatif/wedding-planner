import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyPasscode, setWorkspaceCookie, isValidPasscodeFormat } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();

    if (!passcode || !isValidPasscodeFormat(passcode)) {
      return NextResponse.json(
        { message: 'Passcode harus 6 digit' },
        { status: 400 }
      );
    }

    // Find workspace dengan passcode
    const workspace = await prisma.workspace.findFirst({
      where: {},
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify passcode
    const isValid = await verifyPasscode(passcode, workspace.passcode);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Passcode tidak valid' },
        { status: 401 }
      );
    }

    // Set cookie
    await setWorkspaceCookie(workspace.id);

    return NextResponse.json(
      { message: 'Login berhasil', workspaceId: workspace.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
