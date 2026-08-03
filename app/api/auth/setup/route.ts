import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { hashPasscode, setWorkspaceCookie, isValidPasscodeFormat } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { groomName, brideName, weddingDate, passcode } =
      await request.json();

    // Validate input
    if (!groomName || !brideName || !weddingDate || !passcode) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    if (!isValidPasscodeFormat(passcode)) {
      return NextResponse.json(
        { message: 'Passcode harus 6 digit' },
        { status: 400 }
      );
    }

    // Check if workspace already exists
    const existingWorkspace = await prisma.workspace.findFirst();

    if (existingWorkspace) {
      return NextResponse.json(
        { message: 'Workspace sudah ada. Gunakan login untuk melanjutkan.' },
        { status: 409 }
      );
    }

    // Hash passcode
    const hashedPasscode = await hashPasscode(passcode);

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        groomName,
        brideName,
        weddingDate: new Date(weddingDate),
        passcode: hashedPasscode,
      },
    });

    // Set cookie
    await setWorkspaceCookie(workspace.id);

    // Create default guest categories
    const defaultCategories = [
      'Keluarga',
      'Teman',
      'Kolega',
      'Tetangga',
      'Teman Orang Tua',
      'VIP',
    ];

    await Promise.all(
      defaultCategories.map((name) =>
        prisma.guestCategory.create({
          data: {
            workspaceId: workspace.id,
            name,
          },
        })
      )
    );

    return NextResponse.json(
      { message: 'Setup berhasil', workspaceId: workspace.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
