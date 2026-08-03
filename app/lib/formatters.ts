// Format currency to Rupiah
export function formatRupiah(amount: number | bigint): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

// Format date to DD MMM YYYY
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Format date to DD MMM YYYY HH:mm
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Calculate days remaining until wedding
export function daysUntilWedding(weddingDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weddingDate.setHours(0, 0, 0, 0);
  const diff = weddingDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format countdown text
export function formatCountdown(weddingDate: Date): string {
  const days = daysUntilWedding(weddingDate);
  if (days < 0) return 'Acara sudah berlangsung';
  if (days === 0) return 'Hari ini!';
  if (days === 1) return 'Besok';
  return `${days} hari lagi`;
}

// Parse currency input (remove Rp, comma, etc)
export function parseCurrencyInput(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, '')) || 0;
}
