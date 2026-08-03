# Bismillah Nikah - Wedding Planner

Aplikasi web wedding planner yang user-friendly dan mobile-first, dibangun dengan Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, dan Vercel Postgres.

## Fitur Utama

- 🎯 **10 Modul Lengkap**: Dashboard, Timeline, Budget, Tabungan, Seserahan, Administrasi, Vendor, Tamu, Rundown, dan Lagu
- 🔐 **Auth Sederhana**: Passcode 6-digit per workspace pernikahan
- 📱 **Mobile-First**: Responsive design dengan bottom navigation di mobile dan sidebar di desktop
- 💾 **Auto-Save**: Perubahan tersimpan otomatis ke database Postgres
- 💰 **Format Rupiah**: Semua angka uang diformat otomatis dalam Rupiah
- 📊 **Visualisasi**: Chart dan progress bar untuk tracking budget dan progress
- 🌙 **Dark Mode**: Support light dan dark theme

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + React
- **Styling**: Tailwind CSS + Lucide Icons
- **Database**: PostgreSQL via Vercel Postgres (Neon)
- **ORM**: Prisma
- **Auth**: Cookie-based dengan bcrypt untuk passcode hashing
- **Charts**: Recharts (siap untuk implementasi)
- **Deploy**: Vercel

## Struktur Project

```
app/
├── (app)/                    # Protected routes dengan navigation
│   ├── page.tsx             # Dashboard
│   ├── timeline/            # Module 1: Timeline Persiapan
│   ├── budget/              # Module 3: Anggaran Pernikahan
│   ├── savings/             # Module 4: Target Tabungan
│   ├── gifts/               # Module 5: List Seserahan
│   ├── admin/               # Module 6: List Administrasi
│   ├── vendor/              # Module 7: Kontak Vendor
│   ├── guests/              # Module 8: List Tamu
│   ├── songs/               # Module 10: List Lagu
│   └── layout.tsx
├── (auth)/                  # Public routes untuk authentication
│   ├── login/page.tsx       # Passcode login & setup
│   └── layout.tsx
├── api/
│   ├── auth/               # Authentication endpoints
│   ├── timelines/          # Timeline CRUD
│   └── dashboard/          # Dashboard data
├── components/             # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Navigation.tsx
│   └── EmptyState.tsx
├── lib/
│   ├── auth.ts             # Auth utilities (passcode, cookies)
│   ├── db.ts               # Prisma client
│   └── formatters.ts       # Format uang, tanggal, dll
└── globals.css
prisma/
├── schema.prisma           # Database schema
└── migrations/             # Database migrations
```

## Cara Menjalankan Lokal

### Prerequisites
- Node.js 18+
- npm atau yarn
- PostgreSQL (atau gunakan Prisma Postgres)

### Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd wedding-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   
   Option A: Menggunakan Prisma Postgres lokal (recommended untuk dev)
   ```bash
   npx prisma dev
   ```
   Ini akan start PostgreSQL server lokal dan update `.env` secara otomatis.

   Option B: Menggunakan existing PostgreSQL
   ```bash
   # Update .env dengan DATABASE_URL Anda
   # DATABASE_URL="postgresql://user:password@localhost:5432/wedding_planner"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Buka di browser**
   ```
   http://localhost:3000
   ```

7. **First-time setup**
   - Klik "Setup Workspace" di halaman login
   - Isi nama pasangan, tanggal pernikahan, dan passcode 6-digit
   - Akan otomatis redirect ke dashboard setelah setup berhasil

## Deploy ke Vercel

### Prerequisites
- Akun Vercel (https://vercel.com)
- Repository di GitHub

### Steps

1. **Push code ke GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Setup database di Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Select GitHub repository ini
   - Di "Environment Variables", tambahkan:
     - `DATABASE_URL`: Connection string dari Vercel Postgres atau Neon
     
   Untuk setup Vercel Postgres:
   - Di project settings, go to "Storage"
   - Click "Create Database" → "Postgres"
   - Copy connection string ke env var

   Atau gunakan Neon (free tier tersedia):
   - Go to https://console.neon.tech
   - Buat database baru
   - Copy connection string
   - Paste ke Vercel env var

3. **Configure build command** (optional, sudah ada di vercel.json)
   ```
   npx prisma migrate deploy && npm run build
   ```

4. **Deploy**
   - Vercel akan otomatis build dan deploy
   - Database akan di-migrate secara otomatis
   - URL akan ditampilkan di dashboard Vercel

5. **First-time setup di production**
   - Buka URL yang disediakan Vercel
   - Setup workspace dengan data pasangan & passcode
   - Aplikasi siap digunakan!

## Environment Variables

### Development (.env)
```
# Auto-generated oleh "npx prisma dev"
DATABASE_URL="prisma+postgres://..."
```

### Production (Vercel)
```
DATABASE_URL="postgresql://..." # Dari Vercel Postgres atau Neon
```

## Database Schema

Prisma schema mencakup 10 models untuk semua modul:
- **Workspace**: Main workspace per pasangan
- **Timeline**: Task persiapan
- **BudgetScenario & BudgetScenarioItem**: Multiple budget scenarios
- **WeddingEvent & BudgetItem & BudgetPayment**: Budget tracking per acara
- **SavingsRecord**: Tracking tabungan bulanan
- **GiftItem**: Seserahan
- **AdministrationItem**: Dokumen administrasi
- **Vendor**: Daftar vendor
- **GuestCategory**: Kategori tamu
- **EventRundown**: Rundown acara
- **Song**: Playlist lagu

Lihat `prisma/schema.prisma` untuk detail lengkap.

## API Endpoints

### Auth
- `POST /api/auth/setup` - Setup workspace baru
- `POST /api/auth/login` - Login dengan passcode
- `GET /api/auth/check` - Check auth status
- `POST /api/auth/logout` - Logout

### Dashboard
- `GET /api/dashboard` - Get dashboard stats

### Timelines
- `GET /api/timelines` - List all tasks
- `POST /api/timelines` - Create new task
- `PATCH /api/timelines/[id]` - Update task status
- `DELETE /api/timelines/[id]` - Delete task

Endpoints untuk modul lainnya akan ditambahkan pada fase pengembangan berikutnya.

## Roadmap Fitur

### Phase 1 ✅ (Done)
- [x] Setup infrastructure (Next.js, Prisma, Auth)
- [x] Authentication dengan passcode
- [x] Dashboard dengan ringkasan
- [x] Timeline module (CRUD lengkap)
- [x] Placeholder untuk modul lainnya

### Phase 2 (Next)
- [ ] Module 2: Skenario Budget (full CRUD + comparison)
- [ ] Module 3: Anggaran Pernikahan (events, budget items, payments, charts)
- [ ] Module 4: Target Tabungan (monthly tracking + visualization)

### Phase 3
- [ ] Module 5-7: Seserahan, Administrasi, Vendor
- [ ] Module 8-10: Tamu, Rundown, Lagu

### Polish & Optimization
- [ ] Increase test coverage
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Export to PDF features

## Development Notes

### Adding New Features
1. Pastikan model sudah ada di `prisma/schema.prisma`
2. Run `npx prisma migrate dev` untuk create migration
3. Create API routes di `app/api/`
4. Create UI di `app/(app)/`
5. Import components dari `app/components/`

### Coding Conventions
- Use TypeScript untuk type safety
- Component files: PascalCase (Button.tsx)
- Utility files: camelCase (formatters.ts)
- API routes: use Next.js App Router structure
- Styling: Tailwind CSS classes, prefer dark mode support

### Testing Locally
- Run `npm run dev` untuk development
- Buka http://localhost:3000
- Setup workspace dengan test data
- Test semua fitur sebelum commit

## Troubleshooting

### Database connection error
- Check `.env` dan ensure DATABASE_URL benar
- Untuk Prisma Postgres: `npx prisma dev`
- Untuk external DB: verify connection string dan firewall rules

### Prisma schema error
- Run `npx prisma generate` untuk regenerate client
- Run `npx prisma migrate dev` untuk sync schema

### Build error di Vercel
- Check build logs di Vercel dashboard
- Ensure all env vars di Vercel settings
- Run `npm run build` lokal untuk debug

## License

MIT

## Contact

Untuk pertanyaan atau feedback, silakan buat issue di repository ini.

---

**Selamat merencanakan pernikahan impian Anda! 💍**
