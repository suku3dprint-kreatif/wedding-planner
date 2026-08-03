'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { EmptyState } from '@/app/components/EmptyState';
import { Plus, Edit2, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { formatRupiah } from '@/app/lib/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface BudgetItemData {
  id: string;
  name: string;
  initialAmount: bigint;
  totalPaid: number;
}

interface Event {
  id: string;
  name: string;
  eventDate: string | null;
  budgetItems: BudgetItemData[];
}

interface EventsSummary {
  events: Event[];
  totalBudget: number;
  totalPaid: number;
  totalRemaining: number;
}

export default function BudgetEventsPage() {
  const [data, setData] = useState<EventsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    eventDate: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/budget/events');
      if (res.ok) {
        const eventsData = await res.json();
        setData(eventsData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/budget/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          eventDate: formData.eventDate ? new Date(formData.eventDate) : null,
        }),
      });

      if (res.ok) {
        setFormData({ name: '', eventDate: '' });
        setShowForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Yakin ingin menghapus acara ini?')) return;

    try {
      await fetch(`/api/budget/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-400 h-12 w-12"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 pb-20 md:pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Anggaran Pernikahan (Resmi)
          </h1>
        </div>
        <Card>
          <p className="text-red-600 dark:text-red-400">
            Terjadi kesalahan memuat data
          </p>
        </Card>
      </div>
    );
  }

  const chartData = data.events
    .filter((event) => data.events.some((e) => {
      const total = e.budgetItems.reduce((sum, item) => sum + Number(item.initialAmount), 0);
      return total > 0;
    }))
    .map((event) => {
      const total = event.budgetItems.reduce(
        (sum, item) => sum + Number(item.initialAmount),
        0
      );
      return {
        name: event.name,
        value: total,
      };
    });

  const colors = [
    '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#a855f7',
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Anggaran Pernikahan (Resmi)
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Kelola budget & pembayaran per acara
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Tambah Acara</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader title="Total Anggaran" />
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatRupiah(data.totalBudget)}
          </p>
        </Card>

        <Card>
          <CardHeader title="Total Dibayar" />
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatRupiah(data.totalPaid)}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {data.totalBudget > 0
              ? ((data.totalPaid / data.totalBudget) * 100).toFixed(1)
              : 0}
            % selesai
          </p>
        </Card>

        <Card>
          <CardHeader title="Sisa Tagihan" />
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {formatRupiah(data.totalRemaining)}
          </p>
        </Card>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <Card>
          <CardHeader title="Tambah Acara Baru" />
          <form onSubmit={handleAddEvent} className="space-y-4">
            <Input
              label="Nama Acara"
              placeholder="Misal: Lamaran, Akad, Resepsi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Tanggal Acara (opsional)"
              type="date"
              value={formData.eventDate}
              onChange={(e) =>
                setFormData({ ...formData, eventDate: e.target.value })
              }
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">
                Buat Acara
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '', eventDate: '' });
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Budget Allocation Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader title="Alokasi Budget per Acara" />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatRupiah(value)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatRupiah(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Events List */}
      {data.events.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="h-6 w-6 text-gray-400" />}
          title="Belum ada acara"
          description="Mulai dengan membuat acara pernikahan Anda (Lamaran, Akad, Resepsi, dll)"
          action={{
            label: 'Buat Acara Pertama',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="space-y-4">
          {data.events.map((event) => {
            const eventTotal = event.budgetItems.reduce(
              (sum, item) => sum + Number(item.initialAmount),
              0
            );
            const eventPaid = event.budgetItems.reduce(
              (sum, item) => sum + item.totalPaid,
              0
            );
            const eventRemaining = eventTotal - eventPaid;
            const eventPercent = eventTotal > 0 ? (eventPaid / eventTotal) * 100 : 0;

            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.budgetItems.length} item • {formatRupiah(eventTotal)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/budget/events/${event.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDeleteEvent(event.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {eventPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${eventPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Tagihan</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatRupiah(eventTotal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Dibayar</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {formatRupiah(eventPaid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Sisa</p>
                      <p className="font-semibold text-orange-600 dark:text-orange-400">
                        {formatRupiah(eventRemaining)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
