'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { EmptyState } from '@/app/components/EmptyState';
import { Plus, Trash2, Edit2, Phone, MessageCircle, Building2 } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  phoneNumber: string;
  status: 'PLANNING' | 'CONTRACTED';
  notes?: string;
}

interface VendorsSummary {
  vendors: Vendor[];
  categories: string[];
  totalVendors: number;
  planningCount: number;
  contractedCount: number;
}

export default function VendorsPage() {
  const [data, setData] = useState<VendorsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    status: 'PLANNING',
    notes: '',
  });

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterCategory) params.append('category', filterCategory);

      const res = await fetch(`/api/vendors?${params.toString()}`);
      if (res.ok) {
        const vendorsData = await res.json();
        setData(vendorsData);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [filterStatus, filterCategory]);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/vendors/${editingId}` : '/api/vendors';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          phone: formData.phone,
          status: formData.status,
          notes: formData.notes || null,
        }),
      });

      if (res.ok) {
        setFormData({
          name: '',
          category: '',
          phone: '',
          status: 'PLANNING',
          notes: '',
        });
        setEditingId(null);
        setShowForm(false);
        fetchVendors();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      category: vendor.category,
      phone: vendor.phoneNumber,
      status: vendor.status,
      notes: vendor.notes || '',
    });
    setEditingId(vendor.id);
    setShowForm(true);
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Yakin ingin menghapus vendor ini?')) return;

    try {
      await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      fetchVendors();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: '',
      phone: '',
      status: 'PLANNING',
      notes: '',
    });
  };

  const handleCallVendor = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('62')
      ? cleanPhone
      : '62' + cleanPhone.slice(1);
    window.open(`https://wa.me/${waPhone}`, '_blank');
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
            Kontak Vendor
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

  const filteredVendors =
    filterStatus || filterCategory
      ? data.vendors
      : data.vendors;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kontak Vendor
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Kelola vendor dan kontak pernikahan
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Tambah Vendor</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader title="Total Vendor" />
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {data.totalVendors}
          </p>
        </Card>

        <Card>
          <CardHeader title="Rencana" />
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {data.planningCount}
          </p>
        </Card>

        <Card>
          <CardHeader title="Fix Kerjasama" />
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {data.contractedCount}
          </p>
        </Card>
      </div>

      {/* Filters */}
      {data.categories.length > 0 && (
        <Card>
          <CardHeader title="Filter" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Semua Status</option>
                <option value="PLANNING">Rencana</option>
                <option value="CONTRACTED">Fix Kerjasama</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Semua Kategori</option>
                {data.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Add Vendor Form */}
      {showForm && (
        <Card>
          <CardHeader title={editingId ? 'Edit Vendor' : 'Tambah Vendor Baru'} />
          <form onSubmit={handleAddVendor} className="space-y-4">
            <Input
              label="Nama Vendor"
              placeholder="Misal: PT Catering ABC, Studio Foto XYZ"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Input
              label="Kategori"
              placeholder="Misal: Catering, Fotografi, Dekorasi, Venue"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />

            <Input
              label="Telepon"
              type="tel"
              placeholder="+62 812 3456 7890"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="PLANNING">Rencana</option>
                <option value="CONTRACTED">Fix Kerjasama</option>
              </select>
            </div>

            <Input
              label="Catatan (opsional)"
              placeholder="Misal: Harga, kualitas, rekomendasi"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? 'Update Vendor' : 'Tambah Vendor'}
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

      {/* Vendors List */}
      {filteredVendors.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6 text-gray-400" />}
          title="Belum ada vendor"
          description="Mulai dengan menambahkan vendor pertama"
          action={{
            label: 'Tambah Vendor Pertama',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <Card>
          <CardHeader title="Daftar Vendor" />
          <div className="space-y-3">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {vendor.name}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        vendor.status === 'CONTRACTED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {vendor.status === 'CONTRACTED'
                        ? 'Fix Kerjasama'
                        : 'Rencana'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      📁 {vendor.category}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      📞 {vendor.phoneNumber}
                    </p>
                    {vendor.notes && (
                      <p className="text-gray-600 dark:text-gray-400">
                        📝 {vendor.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleCallVendor(vendor.phoneNumber)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2"
                    title="Hubungi"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleWhatsApp(vendor.phoneNumber)}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 p-2"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(vendor)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
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
