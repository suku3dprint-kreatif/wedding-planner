'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { EmptyState } from '@/app/components/EmptyState';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface AdminItem {
  id: string;
  name: string;
  status: boolean;
}

interface AdminSummary {
  items: AdminItem[];
  totalCount: number;
  completedCount: number;
  progressPercent: number;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });

  const fetchAdmin = async () => {
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const adminData = await res.json();
        setData(adminData);
      }
    } catch (error) {
      console.error('Error fetching admin:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (res.ok) {
        setFormData({ name: '' });
        setShowForm(false);
        fetchAdmin();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggleStatus = async (id: string, status: boolean) => {
    try {
      await fetch(`/api/admin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !status }),
      });
      fetchAdmin();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Yakin ingin menghapus dokumen ini?')) return;

    try {
      await fetch(`/api/admin/${id}`, { method: 'DELETE' });
      fetchAdmin();
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
            List Administrasi
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

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            List Administrasi
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Checklist dokumen pernikahan
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Tambah Dokumen</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader title="Total Dokumen" />
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {data.totalCount}
          </p>
        </Card>

        <Card>
          <CardHeader title="Selesai" />
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {data.completedCount}/{data.totalCount}
          </p>
        </Card>

        <Card>
          <CardHeader title="Progress" />
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${data.progressPercent}%` }}
              ></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.progressPercent}%
            </p>
          </div>
        </Card>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <Card>
          <CardHeader title="Tambah Dokumen Administrasi" />
          <form onSubmit={handleAddItem} className="space-y-4">
            <Input
              label="Nama Dokumen"
              placeholder="Misal: Surat Nikah, Undangan Elektronik, Izin Venue"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              required
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">
                Tambah Dokumen
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '' });
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Items List */}
      {data.items.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6 text-gray-400" />}
          title="Belum ada dokumen"
          description="Mulai dengan menambahkan dokumen administrasi pertama"
          action={{
            label: 'Tambah Dokumen Pertama',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <Card>
          <CardHeader title="Daftar Dokumen" />
          <div className="space-y-2">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {item.status ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        item.status
                          ? 'line-through text-gray-500'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {item.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 p-2 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
