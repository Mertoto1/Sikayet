# Railway Database Path Hatası - Kesin Çözüm

## 🔴 Hata: "Error code 14: Unable to open the database file"

Database dosyası bulunamıyor. Bu genellikle şu nedenlerden kaynaklanır:

1. **Migration çalışmamış** - Database dosyası oluşmamış
2. **DATABASE_URL yanlış path'e işaret ediyor**
3. **Volume mount path'i yanlış**

## ✅ Çözüm: DATABASE_URL ve Volume Kontrolü

### Adım 1: Volume Mount Path'ini Kontrol Edin

Railway Dashboard → **Volumes** → Volume'u açın:

- **Mount Path:** `/app/data` (veya `/app/db`) olmalı
- **ÖNEMLİ:** `/app/prisma` olarak bırakmayın!

### Adım 2: DATABASE_URL'i Güncelleyin

Railway Dashboard → **Variables** → `DATABASE_URL`:

**Eğer volume mount path `/app/data` ise:**
```
file:./data/prod.db
```

**Eğer volume mount path `/app/db` ise:**
```
file:./db/prod.db
```

**Eğer volume yoksa:**
```
file:./prisma/prod.db
```

### Adım 3: Start Command Kontrolü

Railway Dashboard → Settings → Deploy → **Start Command:**

```bash
npm run migrate && npm run seed && npm start
```

Bu komut:
1. Migration çalıştırır (database dosyasını oluşturur)
2. Seed çalıştırır (admin kullanıcısını oluşturur)
3. Server'ı başlatır

### Adım 4: Service'i Yeniden Başlatın

Railway Dashboard → **Deployments** → En son deployment → **"Redeploy"**

## 📋 Kontrol Listesi

- [ ] Volume mount path: `/app/data` (veya `/app/db`) - `/app/prisma` değil!
- [ ] `DATABASE_URL = file:./data/prod.db` (volume path'ine göre)
- [ ] Start Command: `npm run migrate && npm run seed && npm start`
- [ ] Migration çalıştırıldı (loglarda "Migration applied successfully" görünmeli)

## 🔍 Log Kontrolü

Railway Dashboard → **Logs** → Şu mesajları arayın:

✅ **Başarılı:**
- "Migration applied successfully"
- "Seeding database..."
- "Admin user created/updated"
- "> Ready on http://localhost:8080"

❌ **Hata:**
- "Error code 14: Unable to open the database file"
- "Could not find Prisma Schema"

## ⚠️ Önemli Notlar

1. **Volume mount path'i `/app/prisma` olarak bırakmayın!** Bu, schema dosyalarını override eder.

2. **DATABASE_URL volume mount path'ine göre ayarlanmalı:**
   - Volume `/app/data` → `DATABASE_URL = file:./data/prod.db`
   - Volume `/app/db` → `DATABASE_URL = file:./db/prod.db`
   - Volume yok → `DATABASE_URL = file:./prisma/prod.db`

3. **Migration mutlaka çalışmalı** - Database dosyası migration ile oluşur.

---

**En Yaygın Sorun:** Volume mount path'i `/app/prisma` olarak bırakılmış ve DATABASE_URL yanlış path'e işaret ediyor.

