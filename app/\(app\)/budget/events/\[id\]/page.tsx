'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { formatRupiah, formatDate } from '@/app/lib/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetPayment {
  id: string;
  paymentType: string;
  amount: bigint;
  paidDate: string;
}

interface BudgetItem {
  id: string;
  name: string;
  initialAmount: bigint;
  payments: BudgetPayment[];
}

interface Event {
  id: string;
  name: string;
  eventDate: string | null;
  budgetItems: BudgetItem[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    initialAmount: '',
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    paymentType: 'DP',
    amount: '',
    paidDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/budget/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/budget/events/${eventId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemFormData.name,
          initialAmount: parseInt(itemFormData.initialAmount.replace(/[^0-9]/g, '')),
        }),
      });

      if (res.ok) {
        setItemFormData({ name: '', initialAmount: '' });
        setShowItemForm(false);
        fetchEvent();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddPayment = async (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/budget/events/${eventId}/items/${itemId}/payments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentType: paymentFormData.paymentType,
            amount: parseInt(paymentFormData.amount.replace(/[^0-9]/g, '')),
            paidDate: paymentFormData.paidDate,
          }),
        }
      );

      if (res.ok) {
        setPaymentFormData({
          paymentType: 'DP',
          amount: '',
          paidDate: new Date().toISOString().split('T')[0],
        });
        setSelectedItemId(null);
        fetchEvent();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Yakin ingin menghapus pembayaran ini?')) return;

    try {
      await fetch(`/api/budget/payments/${paymentId}`, {
        method: 'DELETE',
      });
      fetchEvent();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Yakin ingin menghapus item ini?')) return;

    try {
      await fetch(`/api/budget/items/${itemId}`, {
        method: 'DELETE',
      });
      fetchEvent();
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

  if (!event) {
    return (
      <div className="space-y-6 pb-20 md:pb-8">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Acara Tidak Ditemukan
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const eventTotal = event.budgetItems.reduce(
    (sum, item) => sum + item.initialAmount,
    0n
  );

  const eventPaid = event.budgetItems.reduce((sum, item) => {
    const itemPaid = item.payments.reduce((s, p) => s + p.amount, 0n);
    return sum + itemPaid;
  }, 0n);

  const chartData = event.budgetItems.map((item) => {
    const paid = item.payments.reduce((sum, p) => sum + p.amount, 0n);
    return {
      name: item.name,
      Tagihan: Number(item.initialAmount),
      Dibayar: Number(paid),
      Sisa: Number(item.initialAmount - paid),
    };
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="ghost">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {event.name}
          </h1>
          {event.eventDate && (
            <p className="text-gray-600 dark:text-gray-400">
              📅 {formatDate(new Date(event.eventDate))}
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader title="Tagihan" />
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatRupiah(Number(eventTotal))}
          </p>
        </Card>

        <Card>
          <CardHeader title="Dibayar" />
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatRupiah(Number(eventPaid))}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {Number(eventTotal) > 0
              ? ((Number(eventPaid) / Number(eventTotal)) * 100).toFixed(1)
              : 0}
            %
          </p>
        </Card>

        <Card>
          <CardHeader title="Sisa" />
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {formatRupiah(Number(eventTotal - eventPaid))}
          </p>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader title="Progress Pembayaran per Item" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatRupiah(value)} />
              <Legend />
              <Bar dataKey="Dibayar" fill="#10b981" />
              <Bar dataKey="Sisa" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Add Item Form */}
      {showItemForm && (
        <Card>
          <CardHeader title="Tambah Item Baru" />
          <form onSubmit={handleAddItem} className="space-y-4">
            <Input
              label="Nama Item"
              placeholder="Misal: Konsumsi, Dekorasi, Foto"
              value={itemFormData.name}
              onChange={(e) =>
                setItemFormData({ ...itemFormData, name: e.target.value })
              }
              required
            />

            <Input
              label="Estimasi Biaya"
              placeholder="Rp 0"
              value={itemFormData.initialAmount}
              onChange={(e) =>
                setItemFormData({ ...itemFormData, initialAmount: e.target.value })
              }
              required
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">
                Tambah Item
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowItemForm(false);
                  setItemFormData({ name: '', initialAmount: '' });
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Items */}
      <div className="space-y-4">
        {event.budgetItems.length === 0 ? (
          <Card>
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              Belum ada item. Mulai dengan menambahkan item pertama!
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowItemForm(true)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Item Pertama
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowItemForm(!showItemForm)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Tambah Item
              </Button>
            </div>

            {event.budgetItems.map((item) => {
              const itemPaid = item.payments.reduce((sum, p) => sum + p.amount, 0n);
              const itemRemaining = item.initialAmount - itemPaid;
              const itemPercent =
                Number(item.initialAmount) > 0
                  ? (Number(itemPaid) / Number(item.initialAmount)) * 100
                  : 0;

              return (
                <Card key={item.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.payments.length} pembayaran
                      </p>
                    </div>
                    <Button
                      onClick={() => handleDeleteItem(item.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {itemPercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${itemPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Tagihan</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatRupiah(Number(item.initialAmount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Dibayar</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {formatRupiah(Number(itemPaid))}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Sisa</p>
                        <p className="font-semibold text-orange-600 dark:text-orange-400">
                          {formatRupiah(Number(itemRemaining))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payments List */}
                  {item.payments.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Riwayat Pembayaran:
                      </p>
                      <div className="space-y-2">
                        {item.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <span className="text-gray-900 dark:text-white">
                                {payment.paymentType}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                                ({formatDate(new Date(payment.paidDate))})
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {formatRupiah(Number(payment.amount))}
                              </span>
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Payment Form */}
                  {selectedItemId === item.id ? (
                    <form
                      onSubmit={(e) => handleAddPayment(e, item.id)}
                      className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800"
                    >
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                            Tipe Pembayaran
                          </label>
                          <select
                            value={paymentFormData.paymentType}
                            onChange={(e) =>
                              setPaymentFormData({
                                ...paymentFormData,
                                paymentType: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                          >
                            <option value="DP">DP</option>
                            <option value="TERMIN_1">Termin 1</option>
                            <option value="TERMIN_2">Termin 2</option>
                            <option value="TERMIN_3">Termin 3</option>
                            <option value="LUNAS">Lunas</option>
                          </select>
                        </div>

                        <Input
                          label="Jumlah"
                          placeholder="Rp 0"
                          value={paymentFormData.amount}
                          onChange={(e) =>
                            setPaymentFormData({
                              ...paymentFormData,
                              amount: e.target.value,
                            })
                          }
                          required
                        />

                        <Input
                          label="Tanggal"
                          type="date"
                          value={paymentFormData.paidDate}
                          onChange={(e) =>
                            setPaymentFormData({
                              ...paymentFormData,
                              paidDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" variant="primary" size="sm" className="flex-1">
                          Catat Pembayaran
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedItemId(null);
                            setPaymentFormData({
                              paymentType: 'DP',
                              amount: '',
                              paidDate: new Date().toISOString().split('T')[0],
                            });
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      onClick={() => setSelectedItemId(item.id)}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      Catat Pembayaran
                    </Button>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
