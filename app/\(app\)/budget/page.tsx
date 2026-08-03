'use client';

import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Plus } from 'lucide-react';

export default function BudgetPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Anggaran Pernikahan
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Kelola budget pernikahan dan tracking pembayaran
          </p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Tambah Acara</span>
        </Button>
      </div>

      <Card>
        <CardHeader title="Coming Soon" subtitle="Fitur budget dan scenarios sedang dalam pengembangan" />
        <p className="text-gray-600 dark:text-gray-400">
          Modul ini akan mencakup:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✓ Skenario budget (sederhana, menengah, mewah)</li>
          <li>✓ Perbandingan anggaran side-by-side</li>
          <li>✓ Item per acara dengan tracking pembayaran</li>
          <li>✓ Grafik visualisasi budget</li>
        </ul>
      </Card>
    </div>
  );
}
