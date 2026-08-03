'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/app/components/Card';
import {
  Calendar,
  DollarSign,
  Target,
  Gift,
  Users,
  Music,
  ArrowRight,
} from 'lucide-react';
import { formatRupiah, formatDate, formatCountdown } from '@/app/lib/formatters';

interface Dashboard {
  workspace: {
    groomName: string;
    brideName: string;
    weddingDate: Date;
  };
  stats: {
    tasksTotal: number;
    tasksCompleted: number;
    totalBudget: number;
    totalPaid: number;
    totalSavings: number;
    guestCount: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const dashData = await res.json();
          setData(dashData);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-400 h-12 w-12"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Terjadi kesalahan memuat dashboard
        </p>
      </div>
    );
  }

  const weddingDate = new Date(data.workspace.weddingDate);
  const daysLeft = formatCountdown(weddingDate);
  const progressPercent = Math.min(
    (data.stats.tasksCompleted / data.stats.tasksTotal) * 100 || 0,
    100
  );
  const budgetPercent = Math.min(
    (data.stats.totalPaid / data.stats.totalBudget) * 100 || 0,
    100
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {data.workspace.groomName} & {data.workspace.brideName}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {formatDate(weddingDate)} ({daysLeft})
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Progress Timeline */}
        <Card>
          <CardHeader title="Progress Timeline" subtitle={`${data.stats.tasksCompleted}/${data.stats.tasksTotal} task`} />
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progressPercent.toFixed(0)}% selesai
            </p>
          </div>
        </Card>

        {/* Budget Status */}
        <Card>
          <CardHeader title="Status Budget" subtitle={formatRupiah(data.stats.totalPaid)} />
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${budgetPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              dari {formatRupiah(data.stats.totalBudget)}
            </p>
          </div>
        </Card>

        {/* Savings Status */}
        <Card>
          <CardHeader title="Tabungan Terkumpul" subtitle={formatRupiah(data.stats.totalSavings)} />
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((data.stats.totalSavings / data.stats.totalBudget) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              target {formatRupiah(data.stats.totalBudget)}
            </p>
          </div>
        </Card>

        {/* Guests */}
        <Card>
          <CardHeader title="Jumlah Tamu" subtitle={`${data.stats.guestCount} orang`} />
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {data.stats.guestCount}
          </div>
        </Card>

        {/* Days Left */}
        <Card>
          <CardHeader title="Menjelang Hari-H" subtitle="Waktu tersisa" />
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCountdown(weddingDate).split(' ')[0]}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Navigasi Cepat" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/timeline">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Timeline
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>

          <Link href="/budget">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Budget
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>

          <Link href="/savings">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Tabungan
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>

          <Link href="/gifts">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-pink-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Seserahan
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>

          <Link href="/guests">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Tamu
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>

          <Link href="/songs">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-red-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Lagu
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
