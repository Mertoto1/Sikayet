# Railway Volume Mount Sorunu - Kesin Çözüm

## 🔴 Sorun

Prisma dosyaları proje root'unda `prisma/` klasöründe. Railway'de build sonrası `/app/prisma/schema.prisma` olmalı.

**AMA:** Volume mount edilmiş ve `/app/prisma` dizini volume tarafından override ediliyor. Bu yüzden schema dosyası görünmüyor.

## ✅ Çözüm: Volume Mount Path'ini Değiştirin

### Adım 1: Volume Mount Path'ini Değiştirin

1. **Railway Dashboard** → **Volumes**
2. Mevcut volume'u açın
3. **Mount Path:** `/app/data` olarak değiştirin (veya `/app/db`)
4. **Save**

**ÖNEMLİ:** `/app/prisma` olarak bırakmayın! Bu dizin build'den gelen schema dosyalarını içerir.

### Adım 2: DATABASE_URL'i Güncelleyin

Railway Dashboard → Variables → `DATABASE_URL`:

```
file:./data/prod.db
```

(Veya `/app/db` kullandıysanız: `file:./db/prod.db`)

### Adım 3: Start Command

Railway Dashboard → Settings → Deploy → **Start Command:**

```
npm run migrate && npm start
```

### Adım 4: Service'i Yeniden Başlatın

Railway Dashboard → Settings → **Restart**

## 📋 Dosya Yapısı

### Build Öncesi (GitHub):
```
prisma/
  ├── schema.prisma
  ├── migrations/
  └── ...
```

### Build Sonrası (Railway `/app`):
```
/app/
  ├── prisma/
  │   ├── schema.prisma      ← Build'den gelir
  │   └── migrations/         ← Build'den gelir
  ├── data/                  ← Volume mount (database dosyası için)
  │   └── prod.db
  └── ...
```

## 🔍 Neden Bu Çözüm?

1. **Schema dosyaları** (`schema.prisma`, `migrations/`) build'den gelir ve `/app/prisma/` dizininde olmalı
2. **Database dosyası** (`prod.db`) volume'da kalıcı olarak saklanmalı
3. Volume mount edildiğinde, mount path'i override eder
4. Bu yüzden volume mount path'i **farklı bir dizin** olmalı (`/app/data`)

## ✅ Kontrol Listesi

- [ ] Volume mount path: `/app/data` (veya `/app/db`)
- [ ] `DATABASE_URL = file:./data/prod.db`
- [ ] Start Command: `npm run migrate && npm start`
- [ ] Schema dosyaları `/app/prisma/` dizininde (build'den gelir)
- [ ] Database dosyası `/app/data/prod.db` (volume'da)

---

**ÖNEMLİ:** Volume mount path'ini mutlaka `/app/data` veya `/app/db` olarak değiştirin. `/app/prisma` olarak bırakırsanız schema dosyaları görünmez!

