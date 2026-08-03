'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { EmptyState } from '@/app/components/EmptyState';
import { Plus, Trash2, Check, DollarSign } from 'lucide-react';
import { formatRupiah } from '@/app/lib/formatters';

interface BudgetScenarioItem {
  id: string;
  name: string;
  amount: bigint;
}

interface BudgetScenario {
  id: string;
  name: string;
  items: BudgetScenarioItem[];
  isOfficial: boolean;
}

export default function BudgetScenariosPage() {
  const [scenarios, setScenarios] = useState<BudgetScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [itemData, setItemData] = useState({ name: '', amount: '' });

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await fetch('/api/budget/scenarios');
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/budget/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name }),
      });

      if (res.ok) {
        setFormData({ name: '' });
        setShowForm(false);
        fetchScenarios();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddItem = async (scenarioId: string) => {
    if (!itemData.name || !itemData.amount) return;

    try {
      const res = await fetch(`/api/budget/scenarios/${scenarioId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemData.name,
          amount: parseInt(itemData.amount.replace(/[^0-9]/g, '')),
        }),
      });

      if (res.ok) {
        setItemData({ name: '', amount: '' });
        fetchScenarios();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteScenario = async (id: string) => {
    if (!confirm('Yakin ingin menghapus skenario ini?')) return;

    try {
      await fetch(`/api/budget/scenarios/${id}`, { method: 'DELETE' });
      fetchScenarios();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSetOfficial = async (id: string) => {
    try {
      await fetch(`/api/budget/scenarios/${id}/set-official`, {
        method: 'POST',
      });
      fetchScenarios();
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

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Skenario Budget
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Buat & bandingkan beberapa skenario anggaran pernikahan
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Skenario Baru</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Buat Skenario Baru" />
          <form onSubmit={handleCreateScenario} className="space-y-4">
            <Input
              label="Nama Skenario"
              placeholder="Misal: Sederhana, Menengah, Mewah"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary">
                Buat Skenario
              </Button>
              <Button
                type="button"
                variant="secondary"
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

      {scenarios.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="h-6 w-6 text-gray-400" />}
          title="Belum ada skenario"
          description="Buat beberapa skenario untuk membandingkan berbagai pilihan budget pernikahan Anda"
          action={{
            label: 'Buat Skenario Pertama',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {scenarios.map((scenario) => {
            const total = scenario.items.reduce(
              (sum, item) => sum + item.amount,
              0n
            );

            return (
              <Card key={scenario.id}>
                <CardHeader
                  title={scenario.name}
                  subtitle={`${scenario.items.length} item • ${formatRupiah(total)}`}
                  action={
                    <div className="flex gap-2">
                      {!scenario.isOfficial && (
                        <Button
                          onClick={() => handleSetOfficial(scenario.id)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline text-xs">Jadikan Resmi</span>
                        </Button>
                      )}
                      {scenario.isOfficial && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          ✓ Resmi
                        </span>
                      )}
                      <Button
                        onClick={() => handleDeleteScenario(scenario.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  }
                />

                <div className="space-y-3">
                  {scenario.items.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Belum ada item
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {scenario.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatRupiah(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedScenario === scenario.id && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddItem(scenario.id);
                      }}
                      className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800"
                    >
                      <Input
                        label="Item Baru"
                        placeholder="Nama item"
                        value={itemData.name}
                        onChange={(e) =>
                          setItemData({ ...itemData, name: e.target.value })
                        }
                        size="sm"
                      />

                      <Input
                        label="Harga"
                        placeholder="Rp 0"
                        value={itemData.amount}
                        onChange={(e) =>
                          setItemData({ ...itemData, amount: e.target.value })
                        }
                        size="sm"
                      />

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          Tambah
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedScenario(null);
                            setItemData({ name: '', amount: '' });
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  )}

                  {selectedScenario !== scenario.id && (
                    <Button
                      onClick={() => setSelectedScenario(scenario.id)}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      Tambah Item
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
