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
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const vendors = await prisma.vendor.findMany({
      where: {
        workspaceId,
        ...(status && { status }),
        ...(category && { category }),
      },
      orderBy: { createdAt: 'asc' },
    });

    const categories = [...new Set(vendors.map((v) => v.category))].sort();
    const planningCount = vendors.filter(
      (v) => v.status === 'PLANNING'
    ).length;
    const contractedCount = vendors.filter(
      (v) => v.status === 'CONTRACTED'
    ).length;

    return NextResponse.json({
      vendors,
      categories,
      totalVendors: vendors.length,
      planningCount,
      contractedCount,
    });
  } catch (error) {
    console.error('Get vendors error:', error);
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
    const { name, category, phone, status, notes } = body;

    if (!name || !category || !phone || !status) {
      return NextResponse.json(
        { message: 'Nama, kategori, telepon, dan status harus diisi' },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        category,
        phone,
        status,
        notes: notes || null,
        workspaceId,
      },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error('Create vendor error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
