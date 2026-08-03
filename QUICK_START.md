# Quick Start Guide

Mulai develop Wedding Planner dalam 5 menit! 🚀

## Prerequisites
- Node.js 18+
- npm atau yarn
- Git

## Setup Lokal (Development)

### 1. Clone & Install (2 menit)
```bash
git clone https://github.com/suku3dprint-kreatif/wedding-planner.git
cd wedding-planner
npm install
```

### 2. Setup Database (1 menit)

**Opsi A: Prisma Postgres (Recommended - Automatic)**
```bash
npx prisma dev
# Ini akan:
# - Download & start PostgreSQL lokal
# - Auto-update .env dengan DATABASE_URL
# - Jalankan migrations
```

**Opsi B: External PostgreSQL**
```bash
# Update .env
DATABASE_URL="postgresql://user:password@localhost:5432/wedding_planner"

# Setup database
npx prisma migrate dev --name init
```

### 3. Start Dev Server (1 menit)
```bash
npm run dev
```

**Access**: http://localhost:3000

## First Time Usage

### Step 1: Setup Workspace
- Click "Setup Workspace"
- Isi nama pasangan, tanggal nikah, passcode 6-digit
- Click "Buat Workspace"

### Step 2: Explore Features
- 🏠 **Dashboard**: Lihat overview semua data
- 📅 **Timeline**: Tambah task persiapan
- 💰 **Budget**: Buat & bandingkan skenario budget
- ... (9 modul lainnya)

## Testing Locally

### Add a Task
1. Go to Timeline module (`/timeline`)
2. Click "Tambah Task"
3. Isi: nama, tanggal mulai, tanggal selesai
4. Click "Simpan"
5. Task akan muncul & bisa di-drag ke status berbeda

### Create Budget Scenario
1. Go to Budget → Skenario Budget
2. Click "Skenario Baru"
3. Isi nama (misal: "Sederhana")
4. Click "Buat Skenario"
5. Tambah items dengan harga
6. Buat scenario lain untuk dibandingkan
7. Mark one as "official"

## Useful Commands

### Database
```bash
npx prisma studio      # Open Prisma Studio (visual DB manager)
npx prisma generate    # Regenerate Prisma client
npx prisma migrate dev --name add_feature  # Create new migration
```

### Development
```bash
npm run dev            # Start dev server
npm run build          # Build for production
npm run lint           # Run ESLint
```

### Debug
```bash
# View database in browser
npx prisma studio

# Check pending migrations
npx prisma migrate status

# Reset database (WARNING: loses data)
npx prisma migrate reset
```

## File Structure Quick Ref

```
📁 app/
  📁 (app)/            ← Protected pages (dashboard, modules)
  📁 (auth)/           ← Login page
  📁 api/              ← API endpoints
  📁 components/       ← Reusable UI components
  📁 lib/              ← Utility functions

📁 prisma/
  📄 schema.prisma     ← Database definition
  📁 migrations/       ← Auto-generated migrations

📄 README.md           ← Full documentation
📄 DEVELOPMENT.md      ← Development roadmap
📄 QUICK_START.md      ← This file!
```

## Common Issues & Solutions

### "Can't reach database"
```bash
# Restart database
npx prisma dev

# Or setup external PostgreSQL:
# DATABASE_URL="postgresql://..." npm run dev
```

### "Prisma schema validation error"
```bash
# Regenerate Prisma client
npx prisma generate
```

### "Port 3000 already in use"
```bash
# Use different port
PORT=3001 npm run dev
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Read DEVELOPMENT.md** - Understand architecture & roadmap
2. **Add new features** - Pick from Phase 2/3 modules
3. **Test thoroughly** - Use both mobile & desktop
4. **Deploy to Vercel** - See README.md deployment section

## Need Help?

- 📖 Read `README.md` - Comprehensive guide
- 📋 Check `DEVELOPMENT.md` - Architecture & roadmap
- 🐛 Open GitHub Issues - Report bugs
- 💡 Check code comments - Inline documentation

## Development Tips

### 1. Use Prisma Studio
```bash
npx prisma studio
# Open visual database manager in browser
# Great untuk debugging & testing
```

### 2. Test Mobile View
- Chrome DevTools: Toggle device toolbar (Ctrl+Shift+M)
- Test bottom navigation & responsive layout

### 3. Dark Mode Testing
- Chrome DevTools: Emulate CSS media feature `prefers-color-scheme: dark`
- Check all components render correctly

### 4. Database Exploration
```bash
# Enter Prisma CLI
npx prisma db execute --stdin

# Example queries:
SELECT COUNT(*) FROM "Workspace";
SELECT * FROM "Timeline" LIMIT 5;
```

## Performance Checklist

Before deploying:
- [ ] Test on mobile device (not just DevTools)
- [ ] Run `npm run build` successfully
- [ ] Check database migrations
- [ ] Verify all API endpoints return correct data
- [ ] Test auth flow (login, setup, logout)
- [ ] Check dark mode looks good

## Happy Coding! 🎉

Selamat mengembangkan Bismillah Nikah! Jika ada pertanyaan atau masalah, jangan ragu untuk buka GitHub issue.

---

**Last updated**: August 3, 2026  
**Status**: Phase 1 Complete, Phase 2 In Progress
