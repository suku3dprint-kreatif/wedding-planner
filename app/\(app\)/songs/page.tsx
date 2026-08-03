'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { EmptyState } from '@/app/components/EmptyState';
import { Plus, Trash2, Edit2, Music, Search } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  category?: string;
}

interface SongsSummary {
  songs: Song[];
  categories: string[];
  totalSongs: number;
}

export default function SongsPage() {
  const [data, setData] = useState<SongsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    category: '',
  });

  useEffect(() => {
    fetchSongs();
  }, [searchTerm, filterCategory]);

  const fetchSongs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);

      const res = await fetch(`/api/songs?${params.toString()}`);
      if (res.ok) {
        const songsData = await res.json();
        setData(songsData);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/songs/${editingId}` : '/api/songs';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          artist: formData.artist,
          category: formData.category || null,
        }),
      });

      if (res.ok) {
        setFormData({
          title: '',
          artist: '',
          category: '',
        });
        setEditingId(null);
        setShowForm(false);
        fetchSongs();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (song: Song) => {
    setFormData({
      title: song.title,
      artist: song.artist,
      category: song.category || '',
    });
    setEditingId(song.id);
    setShowForm(true);
  };

  const handleDeleteSong = async (id: string) => {
    if (!confirm('Yakin ingin menghapus lagu ini?')) return;

    try {
      await fetch(`/api/songs/${id}`, { method: 'DELETE' });
      fetchSongs();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      artist: '',
      category: '',
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
            List Lagu
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
            List Lagu
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Playlist musik acara pernikahan
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Tambah Lagu</span>
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader title="Total Lagu" />
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {data.totalSongs}
        </p>
      </Card>

      {/* Search & Filter */}
      <Card>
        <CardHeader title="Cari & Filter" />
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul atau penyanyi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {data.categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Momen
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Semua Momen</option>
                {data.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Add Song Form */}
      {showForm && (
        <Card>
          <CardHeader title={editingId ? 'Edit Lagu' : 'Tambah Lagu Baru'} />
          <form onSubmit={handleAddSong} className="space-y-4">
            <Input
              label="Judul Lagu"
              placeholder="Misal: Pernikahan Impian"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <Input
              label="Penyanyi/Artis"
              placeholder="Misal: Anji, Maudy Ayunda"
              value={formData.artist}
              onChange={(e) =>
                setFormData({ ...formData, artist: e.target.value })
              }
              required
            />

            <Input
              label="Momen (opsional)"
              placeholder="Misal: Akad, Resepsi, Entrance, Reses"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? 'Update Lagu' : 'Tambah Lagu'}
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

      {/* Songs List */}
      {data.songs.length === 0 ? (
        <EmptyState
          icon={<Music className="h-6 w-6 text-gray-400" />}
          title="Belum ada lagu"
          description="Mulai dengan menambahkan lagu pertama ke playlist"
          action={{
            label: 'Tambah Lagu Pertama',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <Card>
          <CardHeader title={`Playlist (${data.songs.length})`} />
          <div className="space-y-2">
            {data.songs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {song.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      🎤 {song.artist}
                    </p>
                    {song.category && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        📌 {song.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(song)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSong(song.id)}
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
