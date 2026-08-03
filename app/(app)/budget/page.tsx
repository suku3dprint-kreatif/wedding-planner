'use client';

import Link from 'next/link';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Plus, TrendingUp, DollarSign } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

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

      {/* Quick Navigation */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/budget/scenarios">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Skenario Budget
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bandingkan berbagai pilihan
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>

        <Link href="/budget/events">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Budget Resmi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track pembayaran per acara
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>
      </div>

      <Card>
        <CardHeader title="Fitur Budget" />
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400">✓</span>
            <span>Skenario budget (Sederhana, Menengah, Mewah, dll)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400">✓</span>
            <span>Perbandingan anggaran side-by-side</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400">✓</span>
            <span>Jadikan skenario terpilih sebagai anggaran resmi</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400">✓</span>
            <span>Item per acara (Lamaran, Akad, Resepsi, dll)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400">✓</span>
            <span>Tracking pembayaran per item (DP, Termin 1, 2, dll)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400">✓</span>
            <span>Progress bar pembayaran otomatis</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400">✓</span>
            <span>Grafik visualisasi budget & pembayaran</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
