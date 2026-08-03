'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { EmptyState } from '@/app/components/EmptyState';
import { Target, Plus, TrendingUp, AlertCircle, Trash2 } from 'lucide-react';
import { formatRupiah, formatDate } from '@/app/lib/formatters';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface SavingsRecord {
  id: string;
  month: number;
  year: number;
  amountFromGroom: bigint;
  amountFromBride: bigint;
}

interface SavingsSummary {
  records: SavingsRecord[];
  totalAccumulated: number;
  budgetTarget: number;
  percentageComplete: number;
  isOnTrack: boolean;
  daysUntilWedding: number;
  monthsUntilWedding: number;
}

export default function SavingsPage() {
  const [data, setData] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amountFromGroom: '',
    amountFromBride: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      const res = await fetch('/api/savings');
      if (res.ok) {
        const savingsData = await res.json();
        setData(savingsData);
      }
    } catch (error) {
      console.error('Error fetching savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/savings/${editingId}`
        : `/api/savings`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: parseInt(formData.month.toString()),
          year: parseInt(formData.year.toString()),
          amountFromGroom: parseInt(
            formData.amountFromGroom.replace(/[^0-9]/g, '')
          ),
          amountFromBride: parseInt(
            formData.amountFromBride.replace(/[^0-9]/g, '')
          ),
        }),
      });

      if (res.ok) {
        resetForm();
        fetchSavings();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data tabungan bulan ini?')) return;

    try {
      await fetch(`/api/savings/${id}`, { method: 'DELETE' });
      fetchSavings();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amountFromGroom: '',
      amountFromBride: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (record: SavingsRecord) => {
    setFormData({
      month: record.month,
      year: record.year,
      amountFromGroom: Number(record.amountFromGroom).toString(),
      amountFromBride: Number(record.amountFromBride).toString(),
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const chartData = data?.records.map((record) => ({
    month: `${record.month}/${record.year}`,
    Groom: Number(record.amountFromGroom),
    Bride: Number(record.amountFromBride),
    Total: Number(record.amountFromGroom) + Number(record.amountFromBride),
  })) || [];

  const accumulatedData = chartData.map((item, idx) => ({
    ...item,
    AccumulatedTotal:
      chartData.slice(0, idx + 1).reduce((sum, d) => sum + d.Total, 0),
  }));

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
            Target Tabungan
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

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Target Tabungan
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Track tabungan bulanan menuju hari-H
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Tambah Bulan</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader title="Total Terkumpul" />
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatRupiah(data.totalAccumulated)}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            dari target {formatRupiah(data.budgetTarget)}
          </p>
        </Card>

        <Card>
          <CardHeader title="Progress" />
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-800">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(data.percentageComplete, 100)}%` }}
              ></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.percentageComplete.toFixed(1)}%
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Status" />
          <div className="flex items-center gap-2 mt-4">
            {data.isOnTrack ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  On Track
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  Tertinggal
                </span>
              </>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {data.monthsUntilWedding} bulan menjelang H
          </p>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader title={editingId ? 'Edit Tabungan' : 'Tambah Tabungan Bulan'} />
          <form onSubmit={handleAddSavings} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Bulan
                </label>
                <select
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({ ...formData, month: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                >
                  {monthNames.map((month, idx) => (
                    <option key={idx} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Tahun"
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
              />
            </div>

            <Input
              label="Tabungan dari Mempelai Pria"
              placeholder="Rp 0"
              value={formData.amountFromGroom}
              onChange={(e) =>
                setFormData({ ...formData, amountFromGroom: e.target.value })
              }
            />

            <Input
              label="Tabungan dari Mempelai Wanita"
              placeholder="Rp 0"
              value={formData.amountFromBride}
              onChange={(e) =>
                setFormData({ ...formData, amountFromBride: e.target.value })
              }
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? 'Update' : 'Simpan'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={resetForm}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <>
          <Card>
            <CardHeader title="Tabungan Per Bulan" />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                />
                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatRupiah(value)}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="Groom" fill="#3b82f6" name="Pria" />
                <Bar dataKey="Bride" fill="#ec4899" name="Wanita" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader title="Progress Akumulatif" />
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={accumulatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                />
                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatRupiah(value)}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="Total" fill="#a3e635" name="Tabungan Bulan Ini" />
                <Line
                  type="monotone"
                  dataKey="AccumulatedTotal"
                  stroke="#10b981"
                  name="Total Akumulatif"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* Data Table */}
      {data.records.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6 text-gray-400" />}
          title="Belum ada tabungan"
          description="Mulai dengan memasukkan target tabungan bulanan untuk kedua mempelai"
          action={{
            label: 'Tambah Tabungan Pertama',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <Card>
          <CardHeader title="Riwayat Tabungan" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Bulan
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    Pria
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    Wanita
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {monthNames[record.month - 1]} {record.year}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      {formatRupiah(Number(record.amountFromGroom))}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      {formatRupiah(Number(record.amountFromBride))}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {formatRupiah(
                        Number(record.amountFromGroom) +
                          Number(record.amountFromBride)
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
