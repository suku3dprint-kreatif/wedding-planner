'use client';

import { Card, CardHeader } from '@/app/components/Card';

export default function VendorPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Kontak Vendor
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Daftar vendor pernikahan dan kontak
        </p>
      </div>
      <Card>
        <CardHeader title="Coming Soon" />
        <p className="text-gray-600 dark:text-gray-400">Fitur ini sedang dalam pengembangan</p>
      </Card>
    </div>
  );
}
