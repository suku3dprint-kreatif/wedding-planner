'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { EmptyState } from '@/app/components/EmptyState';
import { Plus, Trash2, Edit2, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GuestCategory {
  id: string;
  name: string;
  groomCount: number;
  brideCount: number;
}

interface GuestsSummary {
  categories: GuestCategory[];
  totalGroom: number;
  totalBride: number;
  totalGuests: number;
}

export default function GuestsPage() {
  const [data, setData] = useState<GuestsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    groomCount: '',
    brideCount: '',
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const res = await fetch('/api/guests');
      if (res.ok) {
        const guestsData = await res.json();
        setData(guestsData);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/guests/${editingId}` : '/api/guests';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          groomCount: parseInt(formData.groomCount) || 0,
          brideCount: parseInt(formData.brideCount) || 0,
        }),
      });

      if (res.ok) {
        setFormData({
          name: '',
          groomCount: '',
          brideCount: '',
        });
        setEditingId(null);
        setShowForm(false);
        fetchGuests();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (category: GuestCategory) => {
    setFormData({
      name: category.name,
      groomCount: String(category.groomCount),
      brideCount: String(category.brideCount),
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;

    try {
      await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      fetchGuests();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      groomCount: '',
      brideCount: '',
    });
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
            List Tamu
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

  const chartData = data.categories.map((cat) => ({
    name: cat.name,
    'Pihak Pria': cat.groomCount,
    'Pihak Wanita': cat.brideCount,
  }));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            List Tamu
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Tracking jumlah tamu per kategori
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Tambah Kategori</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader title="Total Tamu" />
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {data.totalGuests}
          </p>
        </Card>

        <Card>
          <CardHeader title="Pihak Pria" />
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {data.totalGroom}
          </p>
        </Card>

        <Card>
          <CardHeader title="Pihak Wanita" />
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
            {data.totalBride}
          </p>
        </Card>

        <Card>
          <CardHeader title="Kategori" />
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {data.categories.length}
          </p>
        </Card>
      </div>

      {/* Comparison Chart */}
      {data.categories.length > 0 && (
        <Card>
          <CardHeader title="Perbandingan Pihak" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Pihak Pria" fill="#4f46e5" />
              <Bar dataKey="Pihak Wanita" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Add Category Form */}
      {showForm && (
        <Card>
          <CardHeader title={editingId ? 'Edit Kategori Tamu' : 'Tambah Kategori Tamu'} />
          <form onSubmit={handleAddCategory} className="space-y-4">
            <Input
              label="Nama Kategori"
              placeholder="Misal: Keluarga, Teman, Kolega"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Jumlah - Pihak Pria"
                type="number"
                min="0"
                placeholder="0"
                value={formData.groomCount}
                onChange={(e) =>
                  setFormData({ ...formData, groomCount: e.target.value })
                }
                required
              />

              <Input
                label="Jumlah - Pihak Wanita"
                type="number"
                min="0"
                placeholder="0"
                value={formData.brideCount}
                onChange={(e) =>
                  setFormData({ ...formData, brideCount: e.target.value })
                }
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? 'Update Kategori' : 'Tambah Kategori'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleCancel}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories List */}
      {data.categories.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6 text-gray-400" />}
          title="Belum ada kategori tamu"
          description="Mulai dengan menambahkan kategori pertama"
          action={{
            label: 'Tambah Kategori Pertama',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <Card>
          <CardHeader title="Daftar Kategori" />
          <div className="space-y-3">
            {data.categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      Pria: <strong>{category.groomCount}</strong>
                    </span>
                    <span className="text-pink-600 dark:text-pink-400">
                      Wanita: <strong>{category.brideCount}</strong>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Total: <strong>{category.groomCount + category.brideCount}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
