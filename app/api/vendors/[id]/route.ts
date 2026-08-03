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

    const vendor = await prisma.vendor.findFirst({
      where: {
        id: (await params).id,
        workspaceId,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { message: 'Vendor tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, category, phone, status, notes } = body;

    const updatedVendor = await prisma.vendor.update({
      where: { id: (await params).id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(phone && { phoneNumber: phone }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error('Update vendor error:', error);
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

    const vendor = await prisma.vendor.findFirst({
      where: {
        id: (await params).id,
        workspaceId,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { message: 'Vendor tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.vendor.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ message: 'Vendor berhasil dihapus' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
