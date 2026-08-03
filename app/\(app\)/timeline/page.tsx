'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input, TextArea } from '@/app/components/Input';
import { EmptyState } from '@/app/components/EmptyState';
import { Calendar, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { formatDate } from '@/app/lib/formatters';

interface Timeline {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  description?: string;
}

export default function TimelinePage() {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      const res = await fetch('/api/timelines');
      if (res.ok) {
        const data = await res.json();
        setTimelines(data.timelines);
      }
    } catch (error) {
      console.error('Error fetching timelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/timelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: '', startDate: '', endDate: '', description: '' });
        setShowForm(false);
        fetchTimelines();
      }
    } catch (error) {
      console.error('Error adding timeline:', error);
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('Yakin ingin menghapus task ini?')) return;

    try {
      await fetch(`/api/timelines/${id}`, { method: 'DELETE' });
      fetchTimelines();
    } catch (error) {
      console.error('Error deleting timeline:', error);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  ) => {
    try {
      await fetch(`/api/timelines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchTimelines();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredTimelines = timelines.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const sorted = [...filteredTimelines].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const groupedByStatus = {
    PENDING: sorted.filter((t) => t.status === 'PENDING'),
    IN_PROGRESS: sorted.filter((t) => t.status === 'IN_PROGRESS'),
    COMPLETED: sorted.filter((t) => t.status === 'COMPLETED'),
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-400 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Timeline Persiapan
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Kelola daftar tugas persiapan pernikahan Anda
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Tambah Task</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Tambah Task Baru" />
          <form onSubmit={handleAddTimeline} className="space-y-4">
            <Input
              label="Nama Task"
              placeholder="Misalnya: Cari venue"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Tanggal Mulai"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />

              <Input
                label="Tanggal Selesai"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>

            <TextArea
              label="Keterangan (opsional)"
              placeholder="Detail tambahan tentang task ini"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary">
                Simpan
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '', startDate: '', endDate: '', description: '' });
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
              }`}
            >
              {status === 'ALL' && 'Semua'}
              {status === 'PENDING' && 'Belum Dimulai'}
              {status === 'IN_PROGRESS' && 'Sedang Berjalan'}
              {status === 'COMPLETED' && 'Selesai'}
            </button>
          )
        )}
      </div>

      {/* Tasks grouped by status */}
      {timelines.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-6 w-6 text-gray-400" />}
          title="Belum ada task"
          description="Mulai dengan menambahkan task persiapan pernikahan Anda. Atur tanggal dan track progress dengan mudah!"
          action={{
            label: 'Tambah Task Pertama',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="space-y-6">
          {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(
            (status) => {
              const statusTasks = groupedByStatus[status];
              const statusLabels = {
                PENDING: 'Belum Dimulai',
                IN_PROGRESS: 'Sedang Berjalan',
                COMPLETED: 'Selesai',
              };

              return (
                <div key={status}>
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {statusLabels[status]} ({statusTasks.length})
                  </h2>

                  {statusTasks.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tidak ada task dalam kategori ini
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {statusTasks.map((task) => (
                        <Card key={task.id} className="group">
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => {
                                const nextStatus = {
                                  PENDING: 'IN_PROGRESS',
                                  IN_PROGRESS: 'COMPLETED',
                                  COMPLETED: 'PENDING',
                                } as const;
                                handleUpdateStatus(
                                  task.id,
                                  nextStatus[task.status]
                                );
                              }}
                              className="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              {task.status === 'COMPLETED' ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                              ) : (
                                <Circle className="h-6 w-6" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-semibold ${
                                  task.status === 'COMPLETED'
                                    ? 'line-through text-gray-500'
                                    : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {task.name}
                              </h3>

                              {task.description && (
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  {task.description}
                                </p>
                              )}

                              <div className="mt-2 flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <span>
                                  📅 {formatDate(new Date(task.startDate))} -{' '}
                                  {formatDate(new Date(task.endDate))}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteTimeline(task.id)}
                              className="flex-shrink-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
