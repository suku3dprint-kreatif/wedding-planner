'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { EmptyState } from '@/app/components/EmptyState';
import { Plus, Trash2, ExternalLink, ChevronDown, ChevronUp, Gift } from 'lucide-react';
import { formatRupiah } from '@/app/lib/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface GiftItem {
  id: string;
  name: string;
  category: string;
  price: bigint;
  status: 'PENDING' | 'IN_PROCESS' | 'COMPLETED';
  purchaseLink?: string;
  notes?: string;
}

interface GiftsSummary {
  items: GiftItem[];
  totalCost: number;
  completedCount: number;
  inProcessCount: number;
  pendingCount: number;
}

export default function GiftsPage() {
  const [data, setData] = useState<GiftsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    purchaseLink: '',
    notes: '',
  });

  const fetchGifts = async () => {
    try {
      const res = await fetch('/api/gifts');
      if (res.ok) {
        const giftsData = await res.json();
        setData(giftsData);
      }
    } catch (error) {
      console.error('Error fetching gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: parseInt(formData.price.replace(/[^0-9]/g, '')),
          purchaseLink: formData.purchaseLink || null,
          notes: formData.notes || null,
        }),
      });

      if (res.ok) {
        setFormData({
          name: '',
          category: '',
          price: '',
          purchaseLink: '',
          notes: '',
        });
        setShowForm(false);
        fetchGifts();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: 'PENDING' | 'IN_PROCESS' | 'COMPLETED'
  ) => {
    try {
      const nextStatus = {
        PENDING: 'IN_PROCESS',
        IN_PROCESS: 'COMPLETED',
        COMPLETED: 'PENDING',
      } as const;

      await fetch(`/api/gifts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus[status] }),
      });
      fetchGifts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteGift = async (id: string) => {
    if (!confirm('Yakin ingin menghapus barang ini?')) return;

    try {
      await fetch(`/api/gifts/${id}`, { method: 'DELETE' });
      fetchGifts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
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
            List Seserahan
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

  const categories = [...new Set(data.items.map((item) => item.category))].sort();

  const statusDistribution = [
    {
      name: 'Belum Dimulai',
      value: data.pendingCount,
      color: '#ef4444',
    },
    {
      name: 'Sedang Proses',
      value: data.inProcessCount,
      color: '#f59e0b',
    },
    {
      name: 'Selesai',
      value: data.completedCount,
      color: '#10b981',
    },
  ].filter((d) => d.value > 0);

  const progressPercent =
    data.items.length > 0
      ? ((data.completedCount / data.items.length) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            List Seserahan
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Checklist barang seserahan pernikahan
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Tambah Barang</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader title="Total Biaya" />
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatRupiah(data.totalCost)}
          </p>
        </Card>

        <Card>
          <CardHeader title="Progress" />
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {progressPercent}%
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Selesai" />
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {data.completedCount}/{data.items.length}
          </p>
        </Card>

        <Card>
          <CardHeader title="Kategori" />
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {categories.length}
          </p>
        </Card>
      </div>

      {/* Status Chart */}
      {statusDistribution.length > 0 && (
        <Card>
          <CardHeader title="Distribusi Status" />
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Add Gift Form */}
      {showForm && (
        <Card>
          <CardHeader title="Tambah Barang Seserahan" />
          <form onSubmit={handleAddGift} className="space-y-4">
            <Input
              label="Nama Barang"
              placeholder="Misal: Cincin, Gelang, Batu Akik"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Input
              label="Kategori"
              placeholder="Misal: Perhiasan, Make Up, Alat Sholat"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />

            <Input
              label="Harga"
              placeholder="Rp 0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />

            <Input
              label="Link Pembelian (opsional)"
              type="url"
              placeholder="https://..."
              value={formData.purchaseLink}
              onChange={(e) =>
                setFormData({ ...formData, purchaseLink: e.target.value })
              }
            />

            <Input
              label="Catatan (opsional)"
              placeholder="Misalnya: Warna, ukuran, dll"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">
                Tambah Barang
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    name: '',
                    category: '',
                    price: '',
                    purchaseLink: '',
                    notes: '',
                  });
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Items by Category */}
      {data.items.length === 0 ? (
        <EmptyState
          icon={<Gift className="h-6 w-6 text-gray-400" />}
          title="Belum ada barang seserahan"
          description="Mulai dengan menambahkan barang pertama ke daftar seserahan"
          action={{
            label: 'Tambah Barang Pertama',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const categoryItems = data.items.filter(
              (item) => item.category === category
            );
            const categoryTotal = categoryItems.reduce(
              (sum, item) => sum + Number(item.price),
              0
            );
            const categoryCompleted = categoryItems.filter(
              (item) => item.status === 'COMPLETED'
            ).length;
            const isExpanded = expandedCategories.has(category);

            return (
              <Card key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {categoryCompleted}/{categoryItems.length} selesai •{' '}
                      {formatRupiah(categoryTotal)}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                    {categoryItems.map((item) => {
                      const statusColors = {
                        PENDING: 'text-gray-400',
                        IN_PROCESS: 'text-yellow-400',
                        COMPLETED: 'text-green-400',
                      };

                      const statusLabels = {
                        PENDING: 'Belum',
                        IN_PROCESS: 'Proses',
                        COMPLETED: '✓ Selesai',
                      };

                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
                        >
                          <button
                            onClick={() =>
                              handleUpdateStatus(item.id, item.status)
                            }
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              item.status === 'COMPLETED'
                                ? 'bg-green-600 border-green-600'
                                : item.status === 'IN_PROCESS'
                                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                                  : 'border-gray-300 dark:border-gray-600'
                            }`}
                            title={`Status: ${statusLabels[item.status]}`}
                          >
                            {item.status === 'COMPLETED' && (
                              <span className="text-white text-sm">✓</span>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4
                                  className={`font-medium ${
                                    item.status === 'COMPLETED'
                                      ? 'line-through text-gray-500'
                                      : 'text-gray-900 dark:text-white'
                                  }`}
                                >
                                  {item.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatRupiah(Number(item.price))}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-medium ${statusColors[item.status]}`}
                                >
                                  {statusLabels[item.status]}
                                </span>
                                <button
                                  onClick={() => handleDeleteGift(item.id)}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {item.notes && (
                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                📝 {item.notes}
                              </p>
                            )}

                            {item.purchaseLink && (
                              <a
                                href={item.purchaseLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Buka Link
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
