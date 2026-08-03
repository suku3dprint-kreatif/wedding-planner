'use client';

import { Card, CardHeader } from '@/app/components/Card';

export default function BudgetEventsPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Budget Pernikahan (Resmi)
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Track budget & pembayaran per acara pernikahan
        </p>
      </div>

      <Card>
        <CardHeader title="Coming Soon - Phase 2" />
        <p className="text-gray-600 dark:text-gray-400">
          Fitur ini akan mencakup:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✓ Manajemen acara (Lamaran, Akad, Resepsi, dll)</li>
          <li>✓ Item budget per acara dengan tagihan awal</li>
          <li>✓ Tracking pembayaran dinamis (DP, Termin 1, 2, 3, dll)</li>
          <li>✓ Perhitungan otomatis total dibayar & sisa tagihan</li>
          <li>✓ Progress bar per item & per acara</li>
          <li>✓ Ringkasan total budget workspace</li>
          <li>✓ Grafik donut & bar chart visualisasi</li>
        </ul>
      </Card>
    </div>
  );
}
