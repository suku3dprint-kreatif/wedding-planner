'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Card, CardHeader } from '@/app/components/Card';

export default function LoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [mode, setMode] = useState<'login' | 'setup'>('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState({
    groomName: '',
    brideName: '',
    weddingDate: '',
    passcodeSetup: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Passcode tidak valid');
        return;
      }

      router.push('/');
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groomName: setupData.groomName,
          brideName: setupData.brideName,
          weddingDate: setupData.weddingDate,
          passcode: setupData.passcodeSetup,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Setup gagal. Silakan coba lagi.');
        return;
      }

      router.push('/');
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader
          title={mode === 'login' ? 'Bismillah Nikah' : 'Setup Workspace'}
          subtitle={
            mode === 'login'
              ? 'Masukkan passcode untuk melanjutkan'
              : 'Buat workspace pernikahan Anda'
          }
        />

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Passcode (6 digit)"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={passcode}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                setPasscode(val);
              }}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Masuk
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode('setup');
                setError('');
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Belum punya workspace? Setup sekarang
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4">
            <Input
              label="Nama Mempelai Pria"
              type="text"
              placeholder="Nama lengkap"
              value={setupData.groomName}
              onChange={(e) =>
                setSetupData({ ...setupData, groomName: e.target.value })
              }
              required
            />

            <Input
              label="Nama Mempelai Wanita"
              type="text"
              placeholder="Nama lengkap"
              value={setupData.brideName}
              onChange={(e) =>
                setSetupData({ ...setupData, brideName: e.target.value })
              }
              required
            />

            <Input
              label="Tanggal Pernikahan"
              type="date"
              value={setupData.weddingDate}
              onChange={(e) =>
                setSetupData({ ...setupData, weddingDate: e.target.value })
              }
              required
            />

            <Input
              label="Passcode (6 digit)"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={setupData.passcodeSetup}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                setSetupData({ ...setupData, passcodeSetup: val });
              }}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Buat Workspace
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sudah punya workspace? Masuk
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
